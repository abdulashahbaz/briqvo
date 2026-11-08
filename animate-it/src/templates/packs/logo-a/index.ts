import type { Recipe } from '../../kit';
import { frameTrace } from './frame-trace';
import { splitShift } from './split-shift';
import { irisBloom } from './iris-bloom';
import { accentSweep } from './accent-sweep';

export const recipes: Recipe[] = [frameTrace, splitShift, irisBloom, accentSweep];
