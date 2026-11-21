import { Euler, Matrix4, OrthographicCamera, PerspectiveCamera, Vector3 } from 'three';
import type { Bounds } from '../state/types';
import { boundsCenter, boundsRadius } from '../state/types';
import {
  DEFAULT_GAMEPAD,
  GamepadReader,
  type GamepadInput,
  type GamepadSettings,
} from './gamepad';
import { t } from '../i18n';

export type Projection = 'perspective' | 'orthographic';

/**
 * The pitch that makes a parallel projection *isometric*.
 *
 * `atan(1/sqrt(2))`, about 35.264°. At exactly this angle the three world axes
 * project to equal lengths 120° apart, which is what makes a cube's three visible
 * faces identical and lets you read distances off any of them. Any other angle is
 * an axonometric view that merely looks isometric.
 */
export const ISOMETRIC_PITCH = -(Math.atan(1 / Math.SQRT2) * 180) / Math.PI;

/**
 * Slowest the camera will fly, in world units per second.
 *
 * Two centimetres a second. Deliberately far below anything useful for covering
 * ground, because the thing it is for is holding still against a wall or a
 * doorway to read the heat behind it, where the useful speed is barely a speed
 * at all.
 */
export const MIN_FLY_SPEED = 0.02;
/**
 * Fly speed multiplier per wheel notch. Half again, which crosses the range from
 * a freshly framed map down to walking pace in about twenty notches. See the
 * wheel handler.
 */
export const WHEEL_PER_NOTCH = 1.5;
/**
 * Parallel-view zoom per wheel notch: a quarter, so a whole map comes down to
 * a building in about fifteen notches.
 */
export const ORTHO_ZOOM_PER_NOTCH = 1.25;
/**
 * Pan speed in a parallel view, in view heights per second: the picture moves
 * at the same pace on screen however far it is zoomed, where the fly speed (a
 * world speed) crawled across a whole map and leapt across a room.
 */
export const ORTHO_PAN_PER_SECOND = 0.6;

/** The key besides Q that flies the camera down: left Ctrl (default), Z, or none. */
export type DescendKey = 'ctrl' | 'z' | 'none';

/** When a camera was last flown (a movement key held, a drag), `performance.now()` ms. */
let flownAt = -Infinity;

/**
 * Whether a camera is being flown, or was within `within` ms: the page asks
 * before closing then (ui/browserKeys.ts), as Ctrl+W is a fly key to the hand.
 */
export function cameraFlying(now = performance.now(), within = 3000): boolean {
  return now - flownAt < within;
}

/** The keys that fly the camera, for "is the camera being flown". */
const FLY_KEYS = new Set([
  'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE', 'Space', 'ControlLeft', 'KeyZ',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight',
]);

export interface ViewPreset {
  /** Degrees. */
  yaw: number;
  pitch: number;
  /**
   * Projection this view is meaningful in, or null to keep the current one.
   *
   * Isometric and the axis-aligned elevations are *parallel* projections by
   * definition — under perspective a "top view" still converges toward a vanishing
   * point, so equal areas do not read as equal and the view stops answering the
   * question it exists to answer. Those presets therefore switch to orthographic
   * rather than leaving it to the user to notice.
   */
  projection: Projection | null;
  title: string;
  /** Grouping for the UI. */
  group: 'iso' | 'ortho' | 'free';
}

/**
 * Preset viewpoints.
 *
 * The four isometric corners exist because which one you want depends on where
 * the interesting geometry faces; a single "Iso" hides half of any map behind
 * whatever happens to be nearer the camera.
 */
export const VIEW_PRESETS: Record<string, ViewPreset> = {
  'Iso NE': {
    yaw: -45,
    pitch: ISOMETRIC_PITCH,
    projection: 'orthographic',
    get title() {
      return t('render.camera.preset.isoNE.title');
    },
    group: 'iso',
  },
  'Iso NW': {
    yaw: 45,
    pitch: ISOMETRIC_PITCH,
    projection: 'orthographic',
    get title() {
      return t('render.camera.preset.isoNW.title');
    },
    group: 'iso',
  },
  'Iso SE': {
    yaw: -135,
    pitch: ISOMETRIC_PITCH,
    projection: 'orthographic',
    get title() {
      return t('render.camera.preset.isoSE.title');
    },
    group: 'iso',
  },
  'Iso SW': {
    yaw: 135,
    pitch: ISOMETRIC_PITCH,
    projection: 'orthographic',
    get title() {
      return t('render.camera.preset.isoSW.title');
    },
    group: 'iso',
  },
  Top: {
    yaw: 0,
    pitch: -89.9,
    projection: 'orthographic',
    get title() {
      return t('render.camera.preset.top.title');
    },
    group: 'ortho',
  },
  Bottom: {
    yaw: 0,
    pitch: 89.9,
    projection: 'orthographic',
    get title() {
      return t('render.camera.preset.bottom.title');
    },
    group: 'ortho',
  },
  Front: {
    yaw: 0,
    pitch: 0,
    projection: 'orthographic',
    get title() {
      return t('render.camera.preset.front.title');
    },
    group: 'ortho',
  },
  Back: {
    yaw: 180,
    pitch: 0,
    projection: 'orthographic',
    get title() {
      return t('render.camera.preset.back.title');
    },
    group: 'ortho',
  },
  Left: {
    yaw: -90,
    pitch: 0,
    projection: 'orthographic',
    get title() {
      return t('render.camera.preset.left.title');
    },
    group: 'ortho',
  },
  Right: {
    yaw: 90,
    pitch: 0,
    projection: 'orthographic',
    get title() {
      return t('render.camera.preset.right.title');
    },
    group: 'ortho',
  },
  Perspective: {
    yaw: -35,
    pitch: -28,
    projection: 'perspective',
    get title() {
      return t('render.camera.preset.perspective.title');
    },
    group: 'free',
  },
};

/**
 * Free-fly camera. World space is Y-up; the dataset's own up axis is remapped
 * during ingest so the renderer never has to think about it.
 *
 * Owns its own transform rather than reading it from the store, because it
 * updates every frame from raw input and pushing that through React would cost
 * more than the rest of the frame.
 */
export class FlyCamera {
  private readonly perspective = new PerspectiveCamera(65, 1, 0.5, 40_000);
  private readonly orthographic = new OrthographicCamera(-1, 1, 1, -1, 0.5, 40_000);
  /**
   * Which projection the frame should use.
   *
   * Orthographic matters for map heatmaps specifically: under perspective, two
   * hotspots of equal density look different sizes depending on where they are
   * in the frame, which is exactly the comparison the view exists to support.
   */
  projection: Projection = 'perspective';
  /** World-units of vertical extent covered in orthographic mode. */
  orthoHeight = 1000;

  /** The camera the renderer should read matrices from. */
  get camera(): PerspectiveCamera | OrthographicCamera {
    return this.projection === 'orthographic' ? this.orthographic : this.perspective;
  }

  position = new Vector3(0, 200, 400);
  /** Radians. 0 looks down -Z. */
  yaw = 0;
  /** Radians. Positive looks up. Clamped just shy of the poles. */
  pitch = -0.35;
  /**
   * Radians about the view axis, positive counter-clockwise. 0 for every
   * camera but the replay's cockpit and fixed views, which roll with the unit.
   */
  roll = 0;

  speed = 120;
  private readonly keys = new Set<string>();
  private readonly deltas = new MouseDeltaFilter();
  private pointerLocked = false;
  private dragging = false;
  /** Set whenever the view changed enough to invalidate progressive accumulation. */
  moved = true;

  /** Gamepad support: poll-only, so it is read from the frame loop. */
  private readonly pad = new GamepadReader();
  gamepad: GamepadSettings = { ...DEFAULT_GAMEPAD };
  /** Last pad state, for the UI to show what is connected and being read. */
  padState: GamepadInput = {
    connected: false,
    id: null,
    strafe: 0,
    forward: 0,
    rise: 0,
    yawDelta: 0,
    pitchDelta: 0,
    speedScale: 1,
    framePressed: false,
    zoom: 0,
  };
  /** Set when the pad asks to frame the data; the engine consumes and clears it. */
  frameRequested = false;

  /**
   * The perspective pose to return to when leaving a parallel projection.
   *
   * Null until perspective has been left once. Restoring it is what makes the iso
   * views feel like a temporary look rather than a mode you have to fly back out
   * of by hand.
   */
  private savedPerspective: {
    position: Vector3;
    yaw: number;
    pitch: number;
    speed: number;
  } | null = null;

  /** The last pose with every number finite, for `update` to fall back to. */
  private readonly good = { position: new Vector3(0, 200, 400), yaw: 0, pitch: -0.35, roll: 0, orthoHeight: 1000 };
  private readonly euler = new Euler(0, 0, 0, 'YXZ');
  private readonly tmp = new Vector3();
  private readonly tmp2 = new Vector3();
  private readonly lastViewProj = new Matrix4();
  private readonly viewProjScratch = new Matrix4();

  /** Keys another tool takes while no drag is held (the tactics board's gizmo keys); true leaves them to it. */
  keyFilter: ((e: KeyboardEvent) => boolean) | null = null;
  /** Presses another tool takes (the board's box select); true leaves the camera still. */
  pressFilter: ((e: MouseEvent) => boolean) | null = null;

  attach(canvas: HTMLCanvasElement): () => void {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (!this.dragging && this.keyFilter?.(e)) return;
      this.keys.add(e.code);
      if (FLY_KEYS.has(e.code)) flownAt = performance.now();
      // Don't let space scroll the page while flying.
      if (e.code === 'Space') e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => this.keys.delete(e.code);
    const onBlur = () => this.keys.clear();

    let lastX = 0;
    let lastY = 0;
    const onMouseDown = (e: MouseEvent) => {
      if (this.pressFilter?.(e)) return;
      if (e.button === 0 || e.button === 2) {
        this.dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        this.deltas.reset();
        // Chromium answers with a promise, and refuses - rejects - when clicks
        // come faster than it allows locks. Dragging then works unlocked, so a
        // refusal is nothing to report.
        //
        // Raw (unadjusted) movement where the browser has it: on Windows the
        // accelerated deltas under a lock are where the spikes come from that
        // threw the view up into the sky (`MouseDeltaFilter`). A browser that
        // does not know the option rejects it, and is asked again without.
        const request = (opts?: { unadjustedMovement: boolean }) =>
          (canvas.requestPointerLock as (o?: { unadjustedMovement: boolean }) => unknown)?.call(canvas, opts);
        const lock = request({ unadjustedMovement: true });
        if (lock instanceof Promise) {
          lock.catch((err: unknown) => {
            if ((err as { name?: string })?.name !== 'NotSupportedError' || !this.dragging) return;
            const again = request();
            if (again instanceof Promise) again.catch(() => undefined);
          });
        }
      }
    };
    const onMouseUp = () => {
      this.dragging = false;
      if (this.pointerLocked) document.exitPointerLock?.();
    };
    const onPointerLockChange = () => {
      this.pointerLocked = document.pointerLockElement === canvas;
      // The first locked event can carry the jump from where the pointer was to
      // where the lock parks it; it is not a movement of the hand.
      this.deltas.reset(this.pointerLocked);
      if (!this.pointerLocked) this.dragging = false;
      // The lock is granted asynchronously, so on a quick click it can arrive
      // after the button has already come up - and the release on mouse-up,
      // having found no lock yet, did nothing. Left alone, the pointer then
      // stays locked and frozen where the click was: the next click lands
      // there too, which is a click on the wrong thing once clicks pick.
      else if (!this.dragging) document.exitPointerLock?.();
    };
    const onMouseMove = (e: MouseEvent) => {
      // A held button is the gate, not the pointer lock. The lock is requested on
      // mouse-down and released on mouse-up, but `pointerlockchange` arrives
      // asynchronously — so for a moment after the button comes up the lock is
      // still reported as held, and gating on it instead means the camera keeps
      // spinning with the mouse after the drag has ended.
      if (!this.dragging) return;
      // Under pointer lock there are no meaningful client coordinates, so
      // movement deltas are the only signal. Dragging without the lock — which is
      // what happens when the browser refuses it — has to track client
      // coordinates instead, because `movementX` is not dependable there.
      let dx: number;
      let dy: number;
      if (this.pointerLocked) {
        dx = e.movementX;
        dy = e.movementY;
      } else {
        dx = e.clientX - lastX;
        dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
      }
      if (dx === 0 && dy === 0) return;
      // A finite, plausible movement only: see `MouseDeltaFilter`.
      if (!this.deltas.accept(dx, dy, e.timeStamp)) return;
      const s = 0.0022;
      this.yaw -= dx * s;
      this.pitch -= dy * s * (this.invertY ? -1 : 1);
      const lim = Math.PI / 2 - 1e-3;
      this.pitch = Math.max(-lim, Math.min(lim, this.pitch));
      this.moved = true;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const perNotch = e.deltaMode === 1 ? 3 : e.deltaMode === 2 ? 1 : 100;
      const notches = Math.max(-4, Math.min(4, e.deltaY / perNotch));
      if (this.projection === 'orthographic') {
        // Orthographic has no forward motion that changes apparent size, so the
        // wheel has to drive the frustum extent instead - by notches, as the fly
        // speed is, and about the pointer. The old 12% a notch centred on the
        // middle needed some forty notches from a whole map to a building, and
        // the building drifted out of the picture on the way.
        const r = canvas.getBoundingClientRect();
        const aspect = r.width > 0 && r.height > 0 ? r.width / r.height : 1;
        const nx = r.width > 0 ? ((e.clientX - r.left) / r.width) * 2 - 1 : 0;
        const ny = r.height > 0 ? 1 - ((e.clientY - r.top) / r.height) * 2 : 0;
        this.zoomOrthoAt(ORTHO_ZOOM_PER_NOTCH ** notches, nx, ny, aspect);
        return;
      }
      // In perspective the wheel tunes fly speed; a fly camera has no zoom.
      //
      // Counted in notches rather than scaled from `deltaY` directly. The old
      // form gave about 11% per notch, which sounds fine until you note where
      // the speed starts: framing an eight-kilometre map sets it to some
      // thousands of metres a second, and climbing down from there to walking
      // pace took upwards of sixty notches. The floor was never the problem —
      // reaching it was. Half again per notch crosses the whole usable range in
      // about twenty, so slowing down to inspect a building is a flick.
      //
      // `deltaY` per notch is not portable — a hundred or so in pixel mode, low
      // single digits in line mode — hence the normalisation, and the clamp so
      // one fast flick of an inertial trackpad cannot skip four decades.
      this.speed *= WHEEL_PER_NOTCH ** -notches;
      this.speed = Math.max(MIN_FLY_SPEED, Math.min(200_000, this.speed));
    };
    const onContextMenu = (e: Event) => e.preventDefault();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('pointerlockchange', onPointerLockChange);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
    };
  }

  invertY = false;
  /** The key that flies down besides Q (`DescendKey`). */
  descendKey: DescendKey = 'ctrl';
  /**
   * How far behind its position the parallel view still draws, in world units:
   * set by the engine to the scene's reach, and put into the orthographic
   * near plane as a negative distance. A parallel projection has no
   * foreshortening, so what lies behind the camera's position can be drawn
   * like anything else - and must be: without it, flying down or zooming in an
   * isometric view sliced the ground off at the camera.
   */
  orthoBack = 0;

  /** Whether a movement key is held: the page guards against closing then (browserKeys.ts). */
  get flying(): boolean {
    for (const code of this.keys) if (FLY_KEYS.has(code)) return true;
    return this.dragging;
  }

  /** Advance by `dt` seconds of wall clock. */
  update(dt: number, aspect: number, fov: number, near: number, far: number): void {
    const k = this.keys;
    if (k.size && this.flying) flownAt = performance.now();
    else if (this.dragging) flownAt = performance.now();
    let fwd = 0;
    let strafe = 0;
    let rise = 0;
    if (k.has('KeyW') || k.has('ArrowUp')) fwd += 1;
    if (k.has('KeyS') || k.has('ArrowDown')) fwd -= 1;
    if (k.has('KeyD') || k.has('ArrowRight')) strafe += 1;
    if (k.has('KeyA') || k.has('ArrowLeft')) strafe -= 1;
    if (k.has('Space') || k.has('KeyE')) rise += 1;
    // Down: Q always, and left Ctrl or Z as the View panel's choice says. Ctrl
    // is the default from the games, but Ctrl+W is the browser's "close tab"
    // and a page cannot always stop it (browserKeys.ts), so it can be moved.
    if (
      k.has('KeyQ') ||
      (this.descendKey === 'ctrl' && k.has('ControlLeft')) ||
      (this.descendKey === 'z' && k.has('KeyZ'))
    )
      rise -= 1;

    // The pad adds to the keyboard rather than replacing it, so both can be used
    // at once and neither has to be "the" input device.
    const pad = this.pad.read(dt, this.gamepad);
    this.padState = pad;
    if (pad.connected) {
      fwd += pad.forward;
      strafe += pad.strafe;
      rise += pad.rise;
      if (pad.yawDelta !== 0 || pad.pitchDelta !== 0) {
        this.yaw += pad.yawDelta;
        this.pitch += pad.pitchDelta;
        const lim = Math.PI / 2 - 1e-3;
        this.pitch = Math.max(-lim, Math.min(lim, this.pitch));
        this.moved = true;
      }
      if (pad.framePressed) this.frameRequested = true;
      if (this.projection === 'orthographic' && pad.zoom !== 0) {
        this.zoomOrtho(Math.exp(-pad.zoom * dt * 1.5));
      }
    }

    const boost = k.has('ShiftLeft') || k.has('ShiftRight') ? 6 : 1;
    const slow = k.has('AltLeft') ? 0.15 : 1;
    const scale = boost * slow * (pad.connected ? pad.speedScale : 1) * dt;

    // Clamp so keyboard and pad together cannot exceed full speed on an axis.
    const f1 = Math.max(-1, Math.min(1, fwd));
    const s1 = Math.max(-1, Math.min(1, strafe));
    const r1 = Math.max(-1, Math.min(1, rise));
    if (this.projection === 'orthographic') this.moveOrtho(f1, s1, r1, this.orthoHeight * ORTHO_PAN_PER_SECOND * scale);
    else this.move(f1, s1, r1, this.speed * scale);

    const persp = this.perspective;
    if (
      persp.fov !== fov ||
      persp.aspect !== aspect ||
      persp.near !== near ||
      persp.far !== far
    ) {
      persp.fov = fov;
      persp.aspect = aspect;
      persp.near = near;
      persp.far = far;
      persp.updateProjectionMatrix();
      this.moved = true;
    }

    const ortho = this.orthographic;
    const halfH = Math.max(1e-3, this.orthoHeight * 0.5);
    const halfW = halfH * aspect;
    const back = Number.isFinite(this.orthoBack) ? Math.max(0, this.orthoBack) : 0;
    const oNear = near - back;
    if (
      ortho.left !== -halfW ||
      ortho.top !== halfH ||
      ortho.near !== oNear ||
      ortho.far !== far
    ) {
      ortho.left = -halfW;
      ortho.right = halfW;
      ortho.top = halfH;
      ortho.bottom = -halfH;
      ortho.near = oNear;
      ortho.far = far;
      ortho.updateProjectionMatrix();
      this.moved = true;
    }

    // A pose that went non-finite - a jump to a point with no height, a
    // division by a zero length somewhere upstream - would leave the view
    // empty or, as NaN compares false against every clamp, wherever the
    // matrices happen to put it. The last good pose stands instead.
    const p = this.position;
    if (Number.isFinite(p.x + p.y + p.z + this.yaw + this.pitch + this.roll + this.orthoHeight)) {
      this.good.position.copy(p);
      this.good.yaw = this.yaw;
      this.good.pitch = this.pitch;
      this.good.roll = this.roll;
      this.good.orthoHeight = this.orthoHeight;
    } else {
      p.copy(this.good.position);
      this.yaw = this.good.yaw;
      this.pitch = this.good.pitch;
      this.roll = this.good.roll;
      this.orthoHeight = this.good.orthoHeight;
      this.moved = true;
    }

    this.euler.set(this.pitch, this.yaw, this.roll);
    for (const cam of [persp, ortho]) {
      cam.position.copy(this.position);
      cam.quaternion.setFromEuler(this.euler);
      cam.updateMatrixWorld(true);
    }
    const cam = this.camera;

    // Detect view change independently of the input flags, so programmatic
    // moves (UI edits, framing) also invalidate accumulation.
    const vp = this.viewProjScratch.multiplyMatrices(
      cam.projectionMatrix,
      cam.matrixWorldInverse,
    );
    if (!matrixNearlyEqual(vp, this.lastViewProj)) {
      this.moved = true;
      this.lastViewProj.copy(vp);
    }
  }

  /**
   * Unit view direction.
   *
   * Must agree with the orientation actually rendered, which comes from the YXZ
   * Euler below: `Ry(yaw) · Rx(pitch)` applied to the camera's local -Z gives
   * `(-sin(yaw)·cos(pitch), sin(pitch), -cos(yaw)·cos(pitch))`. Getting the X sign
   * wrong here is invisible at yaw 0 and exactly backwards at yaw ±90°, so it
   * shows up as WASD flying the wrong way only after you turn — and as `frame()`
   * placing the camera on the far side of the data for any preset that is not
   * front-on.
   */
  forward(out: Vector3): Vector3 {
    const cp = Math.cos(this.pitch);
    return out.set(-Math.sin(this.yaw) * cp, Math.sin(this.pitch), -Math.cos(this.yaw) * cp);
  }

  /** Unit right vector: `cross(forward, worldUp)`, normalised and level. */
  right(out: Vector3): Vector3 {
    return out.set(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
  }

  /**
   * Translate by view-relative amounts, each -1..1, scaled by `distance`.
   *
   * Both the keyboard and the pad funnel through here, which is the point: the
   * mapping from "forward" to a world-space offset exists once, so the two input
   * paths cannot disagree about which way forward is.
   *
   * Rise is along *world* up rather than the camera's own up, because a fly camera
   * that drifts sideways when you press up while pitched is unusable for framing.
   */
  move(forward: number, strafe: number, rise: number, distance: number): void {
    if (!forward && !strafe && !rise) return;
    const dir = this.forward(this.tmp);
    const side = this.right(this.tmp2);
    this.position.x += (dir.x * forward + side.x * strafe) * distance;
    this.position.y += (dir.y * forward + rise) * distance;
    this.position.z += (dir.z * forward + side.z * strafe) * distance;
    this.moved = true;
  }

  /**
   * Translate in a parallel view: forward and back move along the screen's up,
   * sideways along its right, rise along world up - each -1..1, scaled by
   * `distance`.
   *
   * Flying along the view axis, which is what forward means in perspective,
   * changes nothing on screen in a parallel projection: W and S did nothing in
   * an isometric view but walk the near plane through the ground. Screen-up
   * pans the picture the way every map and isometric game pans it.
   */
  moveOrtho(forward: number, strafe: number, rise: number, distance: number): void {
    if (!forward && !strafe && !rise) return;
    const side = this.right(this.tmp2);
    // Screen up: cross(right, forward), for the YXZ orientation the view has.
    const sp = Math.sin(this.pitch);
    const cp = Math.cos(this.pitch);
    const ux = -Math.sin(this.yaw) * -sp;
    const uz = -Math.cos(this.yaw) * -sp;
    this.position.x += (ux * forward + side.x * strafe) * distance;
    this.position.y += (cp * forward + rise) * distance;
    this.position.z += (uz * forward + side.z * strafe) * distance;
    this.moved = true;
  }

  /**
   * Zoom the parallel view by `factor` about a point of the picture, in
   * normalised device coordinates (0, 0 the middle): the world under that point
   * stays under it, as maps zoom to the pointer.
   */
  zoomOrthoAt(factor: number, ndcX: number, ndcY: number, aspect: number): void {
    const before = this.orthoHeight;
    this.zoomOrtho(factor);
    const k = 1 - this.orthoHeight / before;
    if (!k || !Number.isFinite(ndcX + ndcY)) return;
    const half = before * 0.5;
    this.moveOrtho(ndcY * half * k, ndcX * half * aspect * k, 0, 1);
  }

  /**
   * Place the camera so `bounds` fills the view, along the current view
   * direction.
   *
   * Framing along the *current* direction rather than resetting to a default is
   * what makes "pick a preset, then frame" work: choosing Top and framing puts
   * the camera directly overhead rather than back at a three-quarter view.
   */
  frame(bounds: Bounds, fovDeg: number, keepOrientation = false): void {
    const [cx, cy, cz] = boundsCenter(bounds);
    const r = boundsRadius(bounds);
    if (!keepOrientation) {
      this.pitch = -0.62;
      this.yaw = 0;
    }
    const dist = r / Math.tan((fovDeg * Math.PI) / 360);
    const dir = this.forward(this.tmp);
    this.position.set(cx - dir.x * dist, cy - dir.y * dist, cz - dir.z * dist);
    this.speed = Math.max(1, r * 0.5);
    // Orthographic has no field of view, so its extent is set from the data.
    this.orthoHeight = r * 2.1;
    // Framing is the one moment the camera genuinely knows what it is looking at,
    // so it is where the focus distance comes from.
    this.focusDistance = Math.max(1e-3, dist);
    this.moved = true;
  }

  /**
   * Point the camera without moving it, and adopt the preset's projection.
   *
   * Returns the projection it wants so the caller can push it into the store —
   * the camera does not own that setting, the UI does.
   */
  setPreset(name: string): Projection | null {
    const p = VIEW_PRESETS[name];
    if (!p) return null;
    // Projection first, orientation second. `setProjection` may restore a
    // remembered pose, which includes an orientation — so doing it the other way
    // round silently discards the angle the preset exists to set.
    if (p.projection && p.projection !== this.projection) this.setProjection(p.projection);
    this.setOrientationDegrees(p.yaw, p.pitch);
    return p.projection;
  }

  /**
   * Switch projection while keeping the subject the same size on screen.
   *
   * Without this the switch is a jump-cut: orthographic has no field of view, so
   * its frustum height is unrelated to how far away the camera is, and flipping
   * between them either zooms wildly or shows nothing at all. Matching them means
   * solving for the other parameter — the ortho height that a perspective camera
   * covers at the focus distance, and back again.
   *
   * Also remembers the perspective pose, so returning to it lands where you left
   * rather than at whatever the orthographic view had wandered to.
   */
  setProjection(next: Projection, focusDistance?: number): void {
    if (next === this.projection) return;
    const fovRad = (this.perspective.fov * Math.PI) / 180;

    if (next === 'orthographic') {
      // Remember where perspective was, so the trip back is free.
      this.savedPerspective = {
        position: this.position.clone(),
        yaw: this.yaw,
        pitch: this.pitch,
        speed: this.speed,
      };
      // A perspective camera covers `2 * d * tan(fov/2)` of world height at
      // distance d. Use that as the parallel view's height and the subject keeps
      // its size.
      const d = focusDistance ?? this.focusDistance;
      this.orthoHeight = Math.max(0.01, 2 * d * Math.tan(fovRad / 2));
    } else {
      // Back to perspective: place the camera at the distance whose field of view
      // covers the parallel view's height, looking the same way.
      const d = this.orthoHeight / (2 * Math.tan(fovRad / 2));
      const saved = this.savedPerspective;
      if (saved) {
        this.position.copy(saved.position);
        this.yaw = saved.yaw;
        this.pitch = saved.pitch;
        this.speed = saved.speed;
      } else {
        // Nothing remembered: step back along the current view axis so the same
        // point stays centred at the same apparent scale.
        const dir = this.forward(this.tmp);
        const target = this.tmp2
          .copy(this.position)
          .addScaledVector(dir, this.focusDistance);
        this.position.copy(target).addScaledVector(dir, -d);
      }
    }
    this.projection = next;
    this.moved = true;
  }

  /**
   * Distance to whatever the view is currently framing.
   *
   * Kept as state rather than raytraced against the data: it is what the last
   * `frame()` used, which is the only distance the camera can honestly claim to
   * be looking *at*. Feeds both the projection switch and depth of field.
   */
  focusDistance = 1000;

  /** Zoom in orthographic mode, where there is no fly-forward equivalent. */
  zoomOrtho(factor: number): void {
    this.orthoHeight = Math.max(0.01, Math.min(5_000_000, this.orthoHeight * factor));
    this.moved = true;
  }

  setOrientationDegrees(yawDeg: number, pitchDeg: number): void {
    this.yaw = (yawDeg * Math.PI) / 180;
    const lim = Math.PI / 2 - 1e-3;
    this.pitch = Math.max(-lim, Math.min(lim, (pitchDeg * Math.PI) / 180));
    this.moved = true;
  }

  get yawDegrees(): number {
    return (this.yaw * 180) / Math.PI;
  }
  get pitchDegrees(): number {
    return (this.pitch * 180) / Math.PI;
  }
}

/**
 * Mouse-look deltas with the browser's spikes taken out.
 *
 * Under pointer lock Chromium on Windows now and then reports one movement
 * event of hundreds or thousands of pixels that no hand made: on the first
 * event after the lock is granted (the pointer's jump to where the lock parks
 * it), and at random with accelerated, high-polling mice. At the camera's
 * 0.0022 rad a pixel, a single upward spike of 700 px is ninety degrees - the
 * view snapped straight up into the sky and stayed there against the pitch
 * clamp. A real flick does not arrive as one event out of nowhere: it builds
 * over the events before it. So an event is dropped when it is large in
 * absolute terms *and* many times what the recent events were, and the first
 * locked event is dropped outright. Non-finite deltas are dropped too.
 */
export class MouseDeltaFilter {
  /** Below this many pixels an event is always believed. */
  static readonly FLOOR = 200;
  /** How many times the recent movement an event may be before it is a spike. */
  static readonly RATIO = 8;
  /** Recent movement per event, decaying. */
  private recent = 0;
  private lastAt = -Infinity;
  private skipNext = false;
  /** Rejected events in a row: a run of them is the hand after all. */
  private rejected = 0;

  /** Start afresh: a new drag, or the lock just came (`skipFirst`). */
  reset(skipFirst = false): void {
    this.recent = 0;
    this.lastAt = -Infinity;
    this.skipNext = skipFirst;
    this.rejected = 0;
  }

  /** Whether to turn the camera by this movement. `at` is the event's time in ms. */
  accept(dx: number, dy: number, at: number): boolean {
    if (!Number.isFinite(dx) || !Number.isFinite(dy)) return false;
    const mag = Math.hypot(dx, dy);
    if (this.skipNext) {
      this.skipNext = false;
      if (mag > MouseDeltaFilter.FLOOR / 4) return false;
    }
    // A pause forgets the pace of the movement before it.
    if (at - this.lastAt > 250) this.recent = 0;
    this.lastAt = at;
    const spike = mag > MouseDeltaFilter.FLOOR && mag > MouseDeltaFilter.RATIO * Math.max(this.recent, 4);
    if (spike && this.rejected < 2) {
      this.rejected++;
      return false;
    }
    this.rejected = 0;
    this.recent = this.recent === 0 ? mag : this.recent * 0.6 + mag * 0.4;
    return true;
  }
}

function matrixNearlyEqual(a: Matrix4, b: Matrix4): boolean {
  const ae = a.elements;
  const be = b.elements;
  for (let i = 0; i < 16; i++) {
    if (Math.abs(ae[i] - be[i]) > 1e-7) return false;
  }
  return true;
}
