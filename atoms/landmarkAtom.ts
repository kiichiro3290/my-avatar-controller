import { initialLandmarkData } from '@/const/landmarks';
import { LandMark, LandMarks } from '@/types';
import { atom } from 'jotai';

export const landmarkAtom = atom<LandMarks>(initialLandmarkData);
