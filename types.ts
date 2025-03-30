import * as THREE from 'three';
import { mixamoRigNames } from './const/mixamorigNames';
import { poseLandmarkNames } from './const/landmarks';

export type LandMark = {
    x: number;
    y: number;
    z: number;
    visibility: number;
}

export type MixamoRigNamesType = typeof mixamoRigNames[number]

export type Rigs = {
    [key in MixamoRigNamesType]: THREE.Object3D
}

export type RandmarkNamesType = typeof poseLandmarkNames[number]

export type LandMarks = {
    [key in RandmarkNamesType]: LandMark
}
