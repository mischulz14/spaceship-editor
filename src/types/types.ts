import type { Quaternion, Vector3 } from 'three';

export interface Entity {
  uuid: string;
  position: Vector3;
  dimensions: Vector3;
  rotation: Quaternion;
}
