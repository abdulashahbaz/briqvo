import type { Recipe } from '../../kit';
import { recipesA } from './a';
import { recipesB } from './b';

export const recipes: Recipe[] = [...recipesA, ...recipesB];
