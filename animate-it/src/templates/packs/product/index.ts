import type { Recipe } from '../../kit';
import { recipes as product } from './product';
import { recipes as devices } from './devices';
import { recipes as charts } from './charts';

/** Product & UI pack: product, devices, charts, icons and creator templates. */
export const recipes: Recipe[] = [...product, ...devices, ...charts];
