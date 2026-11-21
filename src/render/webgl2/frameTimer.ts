/**
 * GPU time of whole frames on WebGL2, for the frame-time check
 * (tools/check-visual.mjs --only=frametime): the display's refresh paces the
 * wall time between frames, and on a busy machine a skipped vsync makes a frame
 * look 33 ms long though its work took 5. The work itself is what a change to
 * the viewer can make slower, so that is what is measured.
 *
 * `EXT_disjoint_timer_query_webgl2` allows one TIME_ELAPSED query at a time,
 * so a frame is timed as back-to-back segments (before the heat, the heat,
 * after it), summed once all of them are read. Results are read when ready,
 * never waited on; a frame with a disjoint reading is dropped. Off unless asked
 * for: it costs a few queries a frame.
 */

/** A ring of the latest readings: `n` written so far, reading i at `ms[i % ms.length]`. */
export interface FrameRing {
  n: number;
  ms: Float32Array;
}

interface Ext {
  TIME_ELAPSED_EXT: number;
  GPU_DISJOINT_EXT: number;
}

interface Pending {
  queries: WebGLQuery[];
  heat: WebGLQuery | null;
}

export class GlFrameTimer {
  /** Whether frames are timed. */
  enabled = false;
  /** The GPU time of each frame read, in milliseconds. */
  readonly frames: FrameRing = { n: 0, ms: new Float32Array(4096) };
  /** The same frames' heat pass alone (0 where the frame drew no heat), to tell the heat's cost from the rest. */
  readonly heatFrames: FrameRing = { n: 0, ms: new Float32Array(4096) };
  /** Called with the heat pass's own time when a frame is read, for the engine's heat budget. */
  onHeat: ((ms: number) => void) | null = null;

  private ext: Ext | null | undefined;
  private open: WebGLQuery | null = null;
  private segments: WebGLQuery[] = [];
  private heat: WebGLQuery | null = null;
  private readonly pending: Pending[] = [];

  constructor(private readonly gl: WebGL2RenderingContext) {}

  /** Whether this context can time frames at all. */
  get available(): boolean {
    if (this.ext === undefined) this.ext = this.gl.getExtension('EXT_disjoint_timer_query_webgl2') as Ext | null;
    return !!this.ext;
  }

  /** At the start of a frame's drawing. */
  begin(): void {
    if (!this.enabled || !this.available) return;
    this.read();
    this.segments = [];
    this.heat = null;
    this.start();
  }

  /** Around the heat pass: its own segment, so its time is known by itself as well. */
  timeHeat(draw: () => void): void {
    if (!this.open) {
      draw();
      return;
    }
    this.stop();
    this.heat = this.start();
    draw();
    this.stop();
    this.start();
  }

  /** At the end of the frame's drawing. */
  end(): void {
    if (!this.open) return;
    this.stop();
    // Sent now: otherwise the frame's last commands wait for the end of the browser task, and main-thread work
    // after the engine's frame (a dataset set from a store listener) would read as the GPU's time.
    this.gl.flush();
    this.pending.push({ queries: this.segments, heat: this.heat });
    this.segments = [];
    this.heat = null;
    // Never more than a few frames behind; past that the oldest are given up.
    while (this.pending.length > 8) this.drop(this.pending.shift()!);
  }

  private start(): WebGLQuery | null {
    const q = this.gl.createQuery();
    if (!q) return null;
    this.gl.beginQuery(this.ext!.TIME_ELAPSED_EXT, q);
    this.open = q;
    this.segments.push(q);
    return q;
  }

  private stop(): void {
    if (!this.open) return;
    this.gl.endQuery(this.ext!.TIME_ELAPSED_EXT);
    this.open = null;
  }

  /** Reads every frame whose segments are all done, oldest first. */
  private read(): void {
    const gl = this.gl;
    while (this.pending.length) {
      const f = this.pending[0];
      const last = f.queries[f.queries.length - 1];
      if (!gl.getQueryParameter(last, gl.QUERY_RESULT_AVAILABLE)) return;
      this.pending.shift();
      const disjoint = gl.getParameter(this.ext!.GPU_DISJOINT_EXT) as boolean;
      let ns = 0;
      let heatNs = -1;
      for (const q of f.queries) {
        const v = gl.getQueryParameter(q, gl.QUERY_RESULT) as number;
        ns += v;
        if (q === f.heat) heatNs = v;
      }
      this.drop(f);
      if (disjoint) continue;
      const ms = ns / 1e6;
      if (ms >= 0 && ms < 1000) {
        this.frames.ms[this.frames.n++ % this.frames.ms.length] = ms;
        this.heatFrames.ms[this.heatFrames.n++ % this.heatFrames.ms.length] = Math.max(0, heatNs) / 1e6;
      }
      if (heatNs >= 0 && this.onHeat) this.onHeat(heatNs / 1e6);
    }
  }

  private drop(f: Pending): void {
    for (const q of f.queries) this.gl.deleteQuery(q);
  }
}
