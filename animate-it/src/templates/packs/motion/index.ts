/**
 * Motion pack: kinetic type, intros, transitions and seamless background loops.
 * 16 recipes × 4 variants.
 */
import type { Recipe } from '../../kit';
import { textRecipes } from './text';
import { introRecipes } from './intros';
import { transitionRecipes } from './transitions';
import { backgroundRecipes } from './backgrounds';

export const recipes: Recipe[] = [...textRecipes, ...introRecipes, ...transitionRecipes, ...backgroundRecipes];
