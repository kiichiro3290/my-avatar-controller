import { LandMark } from '@/types';
import { atom } from 'jotai';

export const landmarkAtom = atom<LandMark[]>([]);
