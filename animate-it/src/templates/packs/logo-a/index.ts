/**
 * Logo Animations, pack A — twelve logo reveal techniques, five looks each.
 * Every recipe uses the logo (x.logo), a `brand` field and a `tagline`.
 */
import type { Recipe } from '../../kit';
import { frameTrace } from './frame-trace';
import { splitShift } from './split-shift';
import { irisBloom } from './iris-bloom';
import { accentSweep } from './accent-sweep';
import { particleGather } from './particle-gather';
import { glitchLock } from './glitch-lock';
import { glossSweep } from './gloss-sweep';
import { coinFlip } from './coin-flip';
import { bounceDrop } from './bounce-drop';
import { typeset } from './typeset';
import { mosaicReveal } from './mosaic-reveal';
import { maisonLockup } from './maison-lockup';

export const recipes: Recipe[] = [
  frameTrace,
  splitShift,
  irisBloom,
  accentSweep,
  particleGather,
  glitchLock,
  glossSweep,
  coinFlip,
  bounceDrop,
  typeset,
  mosaicReveal,
  maisonLockup,
];
