import type { Recipe } from '../../kit';
import { socialRecipes } from './social';
import { quoteRecipes } from './quotes';
import { adRecipes } from './ads';
import { eventRecipes } from './events';

/** Social pack: 16 recipes × 4 variants across social posts, quotes, ads and events. */
export const recipes: Recipe[] = [...socialRecipes, ...quoteRecipes, ...adRecipes, ...eventRecipes];
