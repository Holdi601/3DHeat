/**
 * What the race tab's controls do: read lap files, make demo laps, and move
 * the replay to a place on the track.
 */

import { timeAt } from '../../race/align';
import { readForzaTelemetry, readLaps, UnreadableLap } from '../../race/adapters';
import { carFromPath, courseFromPath, nameCars } from '../../race/carNames';
import { readCarPack, saveCarPack, storedCarPacks } from '../../race/carPack';
import { readIbt, UnreadableIbt } from '../../race/ibt';
import type { ControlEvent } from '../../race/control';
import type { LapTrace } from '../../race/lap';
import { lapsIn, mistakeTable } from '../../race/stats';
import { autoMap, type MappingHints } from '../../data/automap';
import { loader } from '../../data/loader';
import { useStore } from '../../state/store';
import { DEMO_CARS, syntheticLap } from '../../race/synthetic';
import type { PickedFile } from '../../data/filePick';
import type { Engine } from '../../render/engine';
import { raceClock, useRaceStore } from '../../state/raceStore';
import { t } from '../../i18n';

/** A gzip file's text, decompressed by the browser. */
async function gunzip(file: Blob): Promise<string> {
  const stream = file.stream().pipeThrough(new DecompressionStream('gzip'));
  return new Response(stream).text();
}

/** A lap file: alone, or with where it was in a picked or dropped folder. */
export type LapFile = File | PickedFile;

const LAP_FILE = /\.(json|csv|txt|ibt|tele\.gz)$/i;

/**
 * Read every lap in the files; unreadable files are reported, the rest load.
 * Laps are analysed one course at a time: files from several courses - a
 * folder of the lap library above a course's - are not read, but offered a
 * course each (`RaceState.courses`), and the laps of another course than
 * those loaded replace them. `after` runs once laps have loaded.
 * An FH Companion lap file and its telemetry (`<lap>.json` and
 * `<lap>.json.tele.gz`) picked together are one lap: the telemetry, sixty
 * times a second with every tyre's slip, and the lap file's car and time.
 *
 * Files from a folder - FH Companion's lap library, or any part of it - name
 * their car in the folder they are in, for lap files too old to name it
 * themselves; and what in a folder is not a lap (the course's own file, its
 * map) is passed over without a word.
 */
/** A car file: used from now on, and kept in this browser in place of the same game's last one. */
export async function loadCarFile(file: Blob): Promise<void> {
  const pack = await readCarPack(file);
  const store = useRaceStore.getState();
  store.setCarPacks([...store.carPacks.filter((p) => p.game !== pack.game), pack]);
  await saveCarPack(pack).catch(() => {
    // Blocked storage: the file lasts as long as the page.
  });
}

/** The car files kept from earlier visits. */
export async function restoreCarFiles(): Promise<void> {
  if (useRaceStore.getState().carPacks.length) return;
  const packs = await storedCarPacks();
  if (packs.length) useRaceStore.getState().setCarPacks(packs);
}

export async function loadLapFiles(files: Iterable<LapFile>, after?: () => void): Promise<void> {
  const store = useRaceStore.getState();
  const laps: LapTrace[] = [];
  const errors: string[] = [];
  const everything = [...files].map((f) => (f instanceof File ? { file: f, relativePath: '' } : f));
  const carFiles = everything.filter((f) => /\.h3dcars$/i.test(f.file.name));
  for (const f of carFiles) {
    await loadCarFile(f.file).catch((e: unknown) => {
      errors.push(t('race.ui.load.fileError', { file: f.file.name, error: e instanceof Error ? e.message : String(e) }));
    });
  }
  const picked = everything.filter((f) => !carFiles.includes(f));
  if (carFiles.length && !picked.length) {
    useRaceStore.setState({ error: errors.length ? errors.join('\n') : null });
    return;
  }
  const inFolder = (f: PickedFile) => f.relativePath.includes('/');
  const all = picked.filter((f) => !inFolder(f) || LAP_FILE.test(f.file.name));
  // Several courses' folders: one at a time.
  const byCourse = new Map<string, { name: string; files: PickedFile[] }>();
  for (const f of all) {
    const course = courseFromPath(f.relativePath);
    if (!course) continue;
    const group = byCourse.get(course.key) ?? { name: course.name, files: [] };
    group.files.push(f);
    byCourse.set(course.key, group);
  }
  if (byCourse.size > 1) {
    const lapCount = (g: PickedFile[]) =>
      g.filter((f) => /\.(json|csv|ibt)$/i.test(f.file.name) && f.file.name !== 'course.json').length;
    store.setError(null);
    store.setCourses(
      [...byCourse]
        .map(([key, g]) => ({
          key,
          name: g.name,
          laps: lapCount(g.files),
          load: () => {
            useRaceStore.getState().setCourses(null);
            void loadLapFiles(g.files, after);
          },
        }))
        .filter((c) => c.laps > 0)
        .sort((x, y) => y.laps - x.laps),
    );
    return;
  }
  const pathOf = (f: PickedFile) => f.relativePath || f.file.name;
  const telemetry = new Map(
    all.filter((f) => /\.tele\.gz$/i.test(f.file.name)).map((f) => [pathOf(f).replace(/\.tele\.gz$/i, ''), f]),
  );
  const named = (lap: LapTrace, f: PickedFile): LapTrace => {
    const fromPath = carFromPath(f.relativePath);
    if (!lap.car.name && fromPath.name) lap.car = { ...lap.car, name: fromPath.name };
    if (lap.car.ordinal === undefined && fromPath.ordinal !== undefined) lap.car = { ...lap.car, ordinal: fromPath.ordinal };
    return lap;
  };
  const paired = new Set<PickedFile>();
  for (const f of all) {
    if (/\.tele\.gz$/i.test(f.file.name)) continue;
    const tele = telemetry.get(pathOf(f));
    if (!tele) continue;
    try {
      const lapFile = JSON.parse((await f.file.text()).replace(/^\uFEFF/, ''));
      laps.push(named(readForzaTelemetry(JSON.parse(await gunzip(tele.file)), f.file.name, lapFile), f));
      paired.add(f);
      paired.add(tele);
    } catch (e) {
      errors.push(t('race.ui.load.fileError', { file: f.file.name, error: e instanceof Error ? e.message : String(e) }));
      paired.add(tele);
    }
  }
  for (const f of all) {
    if (paired.has(f)) continue;
    const file = f.file;
    try {
      if (/\.ibt$/i.test(file.name)) laps.push(...readIbt(await file.arrayBuffer(), file.name));
      else if (/\.tele\.gz$/i.test(file.name))
        laps.push(named(readForzaTelemetry(JSON.parse(await gunzip(file)), file.name), f));
      else laps.push(...readLaps(await file.text(), file.name).map((lap) => named(lap, f)));
    } catch (e) {
      // A folder's JSON that is no lap - the course's own file - is not an error.
      if (inFolder(f) && e instanceof UnreadableLap && /\.json$/i.test(file.name)) continue;
      errors.push(
        e instanceof UnreadableLap || e instanceof UnreadableIbt
          ? e.message
          : t('race.ui.load.fileError', { file: file.name, error: e instanceof Error ? e.message : String(e) }),
      );
    }
  }
  // Laps of several named tracks, picked as files rather than from their
  // folders: one at a time, too. A lap that does not name its track goes
  // with the rest.
  const byTrack = new Map<string, LapTrace[]>();
  for (const lap of laps) if (lap.track) byTrack.set(lap.track, [...(byTrack.get(lap.track) ?? []), lap]);
  if (byCourse.size === 0 && byTrack.size > 1) {
    const unnamed = laps.filter((l) => !l.track);
    store.setError(errors.length ? errors.join('\n') : null);
    store.setCourses(
      [...byTrack]
        .map(([name, group]) => ({
          key: name,
          name,
          laps: group.length,
          load: () => {
            useRaceStore.getState().setCourses(null);
            addCourse([...group, ...unnamed], after);
          },
        }))
        .sort((x, y) => y.laps - x.laps),
    );
    return;
  }
  addCourse(laps, after);
  store.setError(errors.length ? errors.join('\n') : null);
}

/** Add laps of one course - in place of those loaded, when they are of another. */
function addCourse(laps: LapTrace[], after?: () => void): void {
  if (!laps.length) return;
  const store = useRaceStore.getState();
  const track = laps[0].track;
  if (track && store.laps.some((l) => l.track && l.track !== track)) store.clearLaps();
  // Unnamed laps take the name another lap in the same car has.
  nameCars([...useRaceStore.getState().laps, ...laps]);
  useRaceStore.getState().addLaps(laps);
  raceClock.set(0);
  after?.();
}

/** How the heatmap reads the mistakes table: see `mistakeTable`. */
const MISTAKE_HINTS: MappingHints = {
  axes: { up: 'y', flipX: false, flipY: false, flipZ: false, scale: 1 },
  columns: {
    x: 'x',
    y: 'y',
    z: 'z',
    time: 'elapsed',
    timeUnit: 'seconds',
    personId: 'car',
    teamId: 'mistake',
    sessionId: 'lap',
    lookMode: 'none',
    extra: ['car_class', 'corner', 'cost'],
  },
};

/**
 * The laps' mistakes - of the classes the statistics look at - into the
 * heatmap: every lap's mistake at each point it covers, grouped by what it
 * was, with the class and the corner to filter on. The heatmap's whole
 * toolset then works on where the laps go wrong.
 */
export async function openMistakesInHeatmap(engine?: Engine | null): Promise<void> {
  const race = useRaceStore.getState();
  const a = race.analysis;
  if (!a) return;
  const text = mistakeTable(a, lapsIn(a, race.mass.classes));
  const file = new File([text], 'mistakes.csv', { type: 'text/csv' });
  const preview = await loader.preview(file);
  const mapping = autoMap({
    columns: preview.columns,
    rows: preview.rows,
    numeric: preview.numeric,
    logicalTypes: preview.logicalTypes,
    hints: MISTAKE_HINTS,
    fileCount: 1,
  });
  const size = await loader.measure([file]);
  const track = a.alignment.reference.track;
  const name = track ? t('race.ui.load.mistakesOn', { track }) : t('race.ui.load.mistakesOnCourse');
  const dataset = await loader.ingest([file], mapping, preview.columns, name, 1, size.rows);
  useStore.getState().setDataset(dataset);
  race.setTab('heat');
  engine?.frameDataset(true);
}

/** Three laps of the demo circuit: a clean one, one with mistakes, one in a different car. */
export function loadDemoLaps(): void {
  const [grip, power] = DEMO_CARS;
  const laps = [
    syntheticLap(grip, { wheels: true }, `demo-clean-${Date.now()}`),
    syntheticLap(
      grip,
      {
        wheels: true,
        brakeEarly: { corner: 2, metres: 35 },
        lateThrottle: { corner: 3, metres: 30 },
        overslow: { corner: 4, factor: 0.88 },
        offset: 1.2,
      },
      `demo-mistakes-${Date.now()}`,
    ),
    syntheticLap(power, { wheels: true, offset: -1.2 }, `demo-power-${Date.now()}`),
  ];
  const store = useRaceStore.getState();
  store.addLaps(laps);
  // The lap with the mistakes is the one worth reading first.
  store.setFocus(laps[1].id);
  raceClock.set(0);
}

/** The reference lap's time at `s` metres - where the clock puts it there. */
function referenceTimeAt(s: number): number | null {
  const a = useRaceStore.getState().analysis;
  if (!a) return null;
  const ref = a.alignment.laps.find((l) => l.lap === a.alignment.reference);
  if (!ref) return null;
  const t = timeAt(ref, a.alignment.grid, s);
  return Number.isFinite(t) ? t : null;
}

/** Move the replay to where the reference reaches `s` metres. */
export function seekToDistance(s: number): void {
  const t = referenceTimeAt(s);
  if (t !== null) raceClock.set(Math.max(0, t));
}

/**
 * Put every car on the same spot at `s` metres and let them go from there -
 * starting a moment before, so the eye has time to find them.
 */
export function lineUpAt(s: number, leadIn = 1.5): void {
  const store = useRaceStore.getState();
  store.patchReplay({ mode: 'anchor', anchorS: s });
  const t = referenceTimeAt(s);
  if (t !== null) raceClock.set(Math.max(0, t - leadIn));
}

/**
 * Look at a finding: select it, line the cars up just before it, bring it into
 * view (unless the camera is chasing a car) and play through it.
 */
export function showFinding(index: number, engine?: Engine | null): void {
  const store = useRaceStore.getState();
  const a = store.analysis;
  const f = a?.findings[index];
  if (!a || !f) return;
  const step = a.alignment.grid[1] - a.alignment.grid[0];
  store.select(index);
  lineUpAt(Math.max(0, Math.min(f.from, f.to) * step - 40));
  if (engine && !store.follow) {
    const ref = a.alignment.laps.find((l) => l.lap === a.alignment.reference)!;
    const at = Math.max(ref.first, Math.min(ref.last, Math.round((f.from + f.to) / 2)));
    const span = (Math.abs(f.to - f.from) * step) / 2;
    engine.frameAround(
      ref.channels.x[at],
      ref.channels.y[at],
      ref.channels.z[at],
      Math.max(40, span + 30),
    );
  }
  store.patchReplay({ playing: true });
}

/** Line the cars up before a car-control event - a slide, a lock, a hit - and replay it. */
export function showEvent(e: ControlEvent, engine?: Engine | null): void {
  const store = useRaceStore.getState();
  const a = store.analysis;
  if (!a) return;
  const step = a.alignment.grid[1] - a.alignment.grid[0];
  lineUpAt(Math.max(0, e.from * step - 40));
  const ref = a.alignment.laps.find((l) => l.lap === a.alignment.reference)!;
  const at = Math.max(ref.first, Math.min(ref.last, Math.round((e.from + e.to) / 2)));
  if (engine && !store.follow) engine.frameAround(ref.channels.x[at], ref.channels.y[at], ref.channels.z[at], 60);
  store.patchReplay({ playing: true });
}
