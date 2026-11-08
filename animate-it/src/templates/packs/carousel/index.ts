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
import { eventLineup } from './event';
import { toolkitTop5 } from './toolkit';
import { milestoneTrack } from './timeline';

/** Animated carousel pack: 12 recipes × 4 variants. */
export const recipes: Recipe[] = [
  bigNumberTips,
  horizonPanorama,
  beforeAfter,
  stepPath,
  numbersStory,
  reviewRibbon,
  mythFact,
  caseFile,
  appTour,
  eventLineup,
  toolkitTop5,
  milestoneTrack,
];
