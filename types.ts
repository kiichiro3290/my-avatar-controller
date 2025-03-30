import * as THREE from 'three';
import { mixamoRigNames } from './const/mixamorigNames';

export type LandMark = {
    x: number;
    y: number;
    z: number;
    visibility: number;
    name: string;
}

export type MixamoRigNamesType = typeof mixamoRigNames[number]

export type Rigs = {
    [key in MixamoRigNamesType]: THREE.Object3D
}
