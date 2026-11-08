import type { Recipe } from '../../kit';
import { recipesA } from './a';
import { recipesB } from './b';
import { recipesC } from './c';

/** Logo animations, pack B: 12 recipes × 5 variants. */
export const recipes: Recipe[] = [...recipesA, ...recipesB, ...recipesC];
