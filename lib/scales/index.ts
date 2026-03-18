import { simpleSocialScale } from './simple-social';
import { srsScale } from './srs';
import { snapIvScale } from './snap-iv';
import { abcScale } from './abc';
import { carsScale } from './cars';
import { ScaleDefinition } from './types';

export const scales: ScaleDefinition[] = [
  simpleSocialScale,
  srsScale,
  snapIvScale,
  abcScale,
  carsScale
];

export * from './types';
