import type { Recipe } from '../../kit';
import { socialRecipes } from './social';
import { quoteRecipes } from './quotes';
import { adRecipes } from './ads';

export const recipes: Recipe[] = [...socialRecipes, ...quoteRecipes, ...adRecipes];
