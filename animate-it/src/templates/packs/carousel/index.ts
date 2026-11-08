import type { Recipe } from '../../kit';
import { bigNumberTips } from './tips';
import { horizonPanorama } from './panorama';
import { beforeAfter } from './beforeAfter';
import { stepPath } from './steps';
import { numbersStory } from './stats';
import { reviewRibbon } from './reviews';
import { mythFact } from './myths';
import { caseFile } from './caseStudy';
import { appTour } from './appTour';

export const recipes: Recipe[] = [bigNumberTips, horizonPanorama, beforeAfter, stepPath, numbersStory, reviewRibbon, mythFact, caseFile, appTour];
