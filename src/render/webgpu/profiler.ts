/**
 * GPU time of named passes, by timestamp queries, where the device has them
 * (`?gpuprof` asks for the feature): each pass gets a begin and an end
 * timestamp, resolved each frame and read back without waiting (a readback
 * buffer in flight is skipped, not waited on). Averages over the last frames
 * read, in milliseconds.
 */

const NAMES = ['tracks', 'scene', 'structdepth', 'peel', 'heat', 'composite'] as const;
export type PassName = (typeof NAMES)[number];

export class GpuProfiler {
  private readonly set: GPUQuerySet;
  private readonly resolve: GPUBuffer;
  private readonly read: GPUBuffer;
  private busy = false;
  private used = new Set<PassName>();
  readonly ms: Record<string, number> = {};

  constructor(device: GPUDevice) {
    this.set = device.createQuerySet({ type: 'timestamp', count: NAMES.length * 2 });
    this.resolve = device.createBuffer({ size: NAMES.length * 16, usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC });
    this.read = device.createBuffer({ size: NAMES.length * 16, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
  }

  static wanted(): boolean {
    return typeof location !== 'undefined' && new URLSearchParams(location.search).has('gpuprof');
  }

  /**
   * The `timestampWrites` for a pass; for a span of several passes, `first` on
   * the first one's and `last` on the last one's.
   */
  writes(name: PassName, first = true, last = true): GPURenderPassTimestampWrites & GPUComputePassTimestampWrites {
    const i = NAMES.indexOf(name);
    if (last) this.used.add(name);
    return {
      querySet: this.set,
      ...(first ? { beginningOfPassWriteIndex: i * 2 } : {}),
      ...(last ? { endOfPassWriteIndex: i * 2 + 1 } : {}),
    };
  }

  /** At the end of the frame's encoding: resolve, and copy for reading when the last read is done. */
  finish(encoder: GPUCommandEncoder): void {
    encoder.resolveQuerySet(this.set, 0, NAMES.length * 2, this.resolve, 0);
    if (!this.busy) encoder.copyBufferToBuffer(this.resolve, 0, this.read, 0, NAMES.length * 16);
  }

  /** After submit: read the copied timestamps when they are there. */
  collect(): void {
    if (this.busy) return;
    this.busy = true;
    const used = new Set(this.used);
    this.used.clear();
    this.read
      .mapAsync(GPUMapMode.READ)
      .then(() => {
        const t = new BigUint64Array(this.read.getMappedRange().slice(0));
        this.read.unmap();
        NAMES.forEach((n, i) => {
          if (!used.has(n)) return;
          const d = Number(t[i * 2 + 1] - t[i * 2]) / 1e6;
          if (d < 0 || d > 1000) return;
          this.ms[n] = this.ms[n] === undefined ? d : this.ms[n] * 0.9 + d * 0.1;
        });
      })
      .catch(() => undefined)
      .finally(() => {
        this.busy = false;
      });
  }
}
