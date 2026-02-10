import { Quaternion, Vector3 } from 'three';
import { generateUUID } from 'three/src/math/MathUtils.js';

import type { Entity } from '../types/types';

const testEntity = {
  uuid: generateUUID(),
  position: new Vector3(0, 0, 0),
  dimensions: new Vector3(1, 1, 1),
  rotation: new Quaternion(),
} satisfies Entity;

const testEntity2 = {
  uuid: generateUUID(),
  position: new Vector3(6, 6, 0),
  dimensions: new Vector3(2, 1, 1),
  rotation: new Quaternion(),
} satisfies Entity;

export const entities = [testEntity, testEntity2];
