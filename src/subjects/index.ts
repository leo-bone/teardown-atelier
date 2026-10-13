import { iPhone18Pro } from './iphone18';
import { rubinVR200 } from './rubin';
import { starshipV3 } from './starship';
import { mavic4Pro } from './mavic4';
import type { Subject } from '../core/types';

export const SUBJECTS: Subject[] = [iPhone18Pro(), rubinVR200(), starshipV3(), mavic4Pro()];

export const SUBJECT_MAP = new Map(SUBJECTS.map((s) => [s.id, s]));
