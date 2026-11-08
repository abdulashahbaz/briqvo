import type { Recipe } from '../kit';
import { recipes as starter } from './starter';
import { recipes as logoA } from './logo-a';
import { recipes as logoB } from './logo-b';
import { recipes as carousel } from './carousel';
import { recipes as social } from './social';
import { recipes as motion } from './motion';
import { recipes as product } from './product';

/** Every recipe pack. Order controls default gallery ordering. */
export const PACKS: Recipe[][] = [starter, logoA, logoB, carousel, social, motion, product];
