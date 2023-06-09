import { getInstance } from "./getInstance";

import type { InstancedMesh, Intersection } from "three";

import type { Physics3D } from "@lib/three/systems/Physics/Physics3D";
import type { Instance } from "@lib/three/types/Instance";
import type { PhysicsBody } from "@lib/three/types/Rapier3D";
import type { World } from "@lib/three/World";

/**
 * Get physics body from raycaster intersection.
 */
export function getPhysics3DBody(
  { physics }: World,
  intersection: Intersection,
  instances: Instance[],
  instancedMesh: InstancedMesh
): PhysicsBody | undefined {
  const instance = getInstance(intersection, instances);
  if (!instance) {
    return undefined;
  }

  const physicsBodies = (physics as Physics3D).instanceMeshMap.get(
    instancedMesh
  );
  const physicsBody = physicsBodies?.find(({ id }) => id === instance.id);

  return physicsBody;
}
