/**
 * Animate It scene format.
 *
 * A Scene is plain JSON: a tree of layers whose properties are either static
 * values or keyframe tracks. The renderer is a pure function of (scene, time),
 * which keeps previews, scrubbing and frame-accurate export identical.
 *
 * Coordinate model: every layer has a box (w × h). Its (x, y) is where its
 * anchor (ax, ay — fractions of the box, default centre) sits in the parent's
 * space. Children of a group live in the group's box space (0,0 = top-left).
 */

export type EaseName =
  | 'linear'
  | 'hold'
  | 'inSine' | 'outSine' | 'inOutSine'
  | 'inQuad' | 'outQuad' | 'inOutQuad'
  | 'inCubic' | 'outCubic' | 'inOutCubic'
  | 'inQuart' | 'outQuart' | 'inOutQuart'
  | 'inQuint' | 'outQuint' | 'inOutQuint'
  | 'inExpo' | 'outExpo' | 'inOutExpo'
  | 'inCirc' | 'outCirc' | 'inOutCirc'
  | 'inBack' | 'outBack' | 'inOutBack'
  | 'outElastic' | 'outBounce'
  | 'spring' | 'softSpring';

/** Named easing or a CSS-style cubic-bezier(x1, y1, x2, y2). */
export type Ease = EaseName | [number, number, number, number];

/** `e` is the easing used to arrive at this keyframe from the previous one. */
export interface Keyframe<T> {
  t: number;
  v: T;
  e?: Ease;
}

export type Anim<T> = T | Keyframe<T>[];

export type Color = string;

export interface GradientStop {
  o: number; // offset 0..1
  c: Color;
}

export interface LinearGradient {
  kind: 'linear';
  angle: number; // degrees, 0 = left→right, 90 = top→bottom
  stops: GradientStop[];
}

export interface RadialGradient {
  kind: 'radial';
  cx: number; // 0..1 of box
  cy: number;
  r: number; // fraction of the box diagonal / 2
  stops: GradientStop[];
}

export type Gradient = LinearGradient | RadialGradient;
export type Paint = Color | Gradient;

export interface Shadow {
  color: Color;
  blur: number;
  x?: number;
  y?: number;
}

export interface LayerBase {
  id: string;
  name?: string;
  x?: Anim<number>;
  y?: Anim<number>;
  w?: Anim<number>;
  h?: Anim<number>;
  ax?: number;
  ay?: number;
  rotation?: Anim<number>; // degrees
  scale?: Anim<number>;
  sx?: Anim<number>;
  sy?: Anim<number>;
  skewX?: Anim<number>; // degrees
  opacity?: Anim<number>;
  blur?: Anim<number>; // px in scene units
  shadow?: Shadow;
  /** Visible from `start` (inclusive) to `end` (exclusive), seconds. */
  start?: number;
  end?: number;
  /** Shifts this layer's (and its children's) clock. */
  dt?: number;
  blend?: GlobalCompositeOperation;
  hidden?: boolean;
  /** Editor hints. */
  role?: string;
  locked?: boolean;
}

export interface RectLayer extends LayerBase {
  type: 'rect';
  fill?: Anim<Paint>;
  radius?: Anim<number>;
  stroke?: Anim<Color>;
  strokeWidth?: Anim<number>;
  dash?: number[];
}

export interface EllipseLayer extends LayerBase {
  type: 'ellipse';
  fill?: Anim<Paint>;
  stroke?: Anim<Color>;
  strokeWidth?: Anim<number>;
  /** Draw only an arc, as fractions of a full turn starting at 12 o'clock. */
  arcStart?: Anim<number>;
  arcEnd?: Anim<number>;
  lineCap?: CanvasLineCap;
}

export interface TextUnitState {
  x?: number; // em
  y?: number; // em
  opacity?: number;
  scale?: number;
  rotation?: number;
  blur?: number; // px
}

export interface TextAnim {
  by: 'char' | 'word' | 'line';
  start: number;
  dur: number;
  stagger: number;
  ease?: Ease;
  from: TextUnitState;
  /** Clip each line to its own box so units slide in from behind a mask. */
  mask?: boolean;
  order?: 'forward' | 'reverse' | 'center' | 'edges' | 'random';
  /** Optional exit: units animate from rest to `to`. */
  out?: { start: number; dur: number; stagger: number; ease?: Ease; to: TextUnitState; order?: TextAnim['order'] };
}

export interface Counter {
  from: number;
  to: number;
  start: number;
  dur: number;
  ease?: Ease;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: boolean;
}

export interface TextLayer extends LayerBase {
  type: 'text';
  text: string;
  font: string;
  weight?: number;
  italic?: boolean;
  size: Anim<number>;
  fill?: Anim<Paint>;
  stroke?: Anim<Color>;
  strokeWidth?: number;
  align?: 'left' | 'center' | 'right';
  lineHeight?: number; // multiple of size
  tracking?: number; // em
  uppercase?: boolean;
  anim?: TextAnim;
  counter?: Counter;
  /** Typewriter: number of visible characters animates 0 → all. */
  reveal?: Anim<number>; // 0..1
}

export interface ImageLayer extends LayerBase {
  type: 'image';
  src: string;
  fit?: 'cover' | 'contain' | 'fill';
  radius?: Anim<number>;
  /** Tint a single-colour logo (applied with source-in). */
  tint?: Anim<Color>;
}

export interface PathLayer extends LayerBase {
  type: 'path';
  d: string;
  /** viewBox size the path coordinates are expressed in. */
  vw: number;
  vh: number;
  fill?: Anim<Paint>;
  stroke?: Anim<Color>;
  strokeWidth?: Anim<number>; // in viewBox units
  trimStart?: Anim<number>; // 0..1
  trimEnd?: Anim<number>; // 0..1
  lineCap?: CanvasLineCap;
  lineJoin?: CanvasLineJoin;
}

export interface Mask {
  shape: 'rect' | 'circle';
  x: Anim<number>;
  y: Anim<number>;
  w?: Anim<number>;
  h?: Anim<number>;
  r?: Anim<number>; // circle radius or rect corner radius
  invert?: boolean;
}

export interface GroupLayer extends LayerBase {
  type: 'group';
  children: Layer[];
  /** Clip children to the group box. */
  clip?: boolean;
  clipRadius?: Anim<number>;
  mask?: Mask;
  /** Render children offscreen first (needed for children blend modes like source-atop). */
  isolate?: boolean;
}

export type Layer = RectLayer | EllipseLayer | TextLayer | ImageLayer | PathLayer | GroupLayer;
export type LayerType = Layer['type'];

export interface Scene {
  w: number;
  h: number;
  duration: number;
  fps?: number;
  background: Paint;
  layers: Layer[];
  /** Carousel: the scene is `slides` equal-width slides laid side by side. */
  slides?: number;
  /** Fonts the scene needs: "Family:weight" or "Family:italic:weight". */
  fonts?: string[];
  /** Playback-rate multiplier; `duration` is already expressed in output seconds. */
  speed?: number;
}
