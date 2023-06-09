import RAPIER from "@dimforge/rapier2d-compat";
import {
  Euler,
  InstancedMesh,
  Matrix4,
  Mesh,
  Quaternion,
  Vector3,
} from "three";

import { isPatched } from "../../types/Patched";
import { Physics } from "./Physics";

import type { World as Physics2DWorld } from "@dimforge/rapier2d-compat";

import type { PhysicsBody } from "../../types/Rapier2D";
import type { World } from "../../World";

await RAPIER.init();

const positionVector = new Vector3();
const euler = new Euler();
const quaternion = new Quaternion();
const scaleVector = new Vector3();
const matrix = new Matrix4();

export class Physics2D extends Physics {
  physicsWorld: Physics2DWorld;
  eventQueue = new RAPIER.EventQueue(true);
  meshMap = new WeakMap<Mesh, PhysicsBody>();
  instanceMeshMap = new WeakMap<InstancedMesh, PhysicsBody[]>();

  constructor(world: World) {
    super(world);

    const gravity = { x: 0.0, y: -9.81 };
    this.physicsWorld = new RAPIER.World(gravity);
  }

  init(): void {
    this.objects.forEach((object) => {
      if (isPatched(object) && "addPhysics2D" in object) {
        object.addPhysics2D(this);
      }
    });
  }

  stepPhysicsWorld(): void {
    this.physicsWorld.step(this.eventQueue);
  }

  updateThreeJsObjects(): void {
    this.movableObjects.forEach((mesh) => {
      if (mesh instanceof InstancedMesh) {
        const physicsBodies = this.instanceMeshMap.get(mesh);

        physicsBodies?.forEach(({ rigidBody }, index) => {
          // Do nothing if instance is fixed
          if (rigidBody.isFixed()) return;

          // Get position from physics world
          const position = rigidBody.translation();
          positionVector.set(position.x, position.y, 0);

          // Get rotation from physics world
          const rotation = rigidBody.rotation();
          quaternion.setFromEuler(euler.set(0, 0, rotation));

          // Get scale from current instance scale
          mesh.getMatrixAt(index, matrix);
          scaleVector.setFromMatrixScale(matrix);

          // Update instance matrix
          matrix.compose(positionVector, quaternion, scaleVector);
          mesh.setMatrixAt(index, matrix);
        });

        mesh.instanceMatrix.needsUpdate = true;
        mesh.computeBoundingSphere();
      } else if (mesh instanceof Mesh) {
        const rigidBody = this.meshMap.get(mesh)?.rigidBody;
        if (!rigidBody) return;

        const position = rigidBody.translation();
        mesh.position.x = position.x;
        mesh.position.y = position.y;

        const rotation = rigidBody.rotation();
        mesh.rotation.z = rotation;
      }
    });
  }

  handleSleepAndWake(): void {
    function handleSleepAndWakeEvents(
      mesh: Mesh | InstancedMesh,
      physicsBody: PhysicsBody
    ) {
      if (physicsBody.rigidBody.isSleeping()) {
        // If already sleeping, do nothing.
        if (physicsBody.isSleeping === true) return;

        // Else set isSleeping to true and handle onSleep event
        physicsBody.isSleeping = true;
        if (isPatched(mesh) && "onSleep" in mesh) mesh.onSleep(physicsBody);
      } else {
        // If already awake, do nothing. Note: isSleeping is undefined at the
        // beginning of a simulation, which means all onWake event handlers will
        // fire once at the beginning of the simulation.
        if (physicsBody.isSleeping === false) return;

        // Else set isSleeping to false and handle onWake event
        physicsBody.isSleeping = false;
        if (isPatched(mesh) && "onWake" in mesh) mesh.onWake(physicsBody);
      }
    }

    this.sleepAndWakeObjects.forEach((object) => {
      if (object instanceof InstancedMesh) {
        const physicsBodies = this.instanceMeshMap.get(object);

        physicsBodies?.forEach((physicsBody) => {
          handleSleepAndWakeEvents(object, physicsBody);
        });
      } else if (object instanceof Mesh) {
        const physicsBody = this.meshMap.get(object);
        if (!physicsBody) return;

        handleSleepAndWakeEvents(object, physicsBody);
      }
    });
  }

  handleCollisions(): void {
    function handleCollisionEvent(
      physicsWorld: Physics2DWorld,
      handle1: number,
      handle2: number,
      object: Mesh | InstancedMesh,
      physicsBody: PhysicsBody,
      method: "onCollisionEnter" | "onCollisionExit"
    ) {
      if ([handle1, handle2].includes(physicsBody.collider.handle)) {
        // Get the other physicsBody involved in the collision
        const otherHandle =
          physicsBody.collider.handle === handle1 ? handle2 : handle1;
        const rigidBody = physicsWorld.getRigidBody(otherHandle);
        const id = (rigidBody.userData as { id: string }).id;
        const collider = physicsWorld.getCollider(otherHandle);

        // Handle the collision event
        if (isPatched(object) && method in object) {
          const handler = object[method];
          if (handler) {
            handler(physicsBody, { id, rigidBody, collider });
          }
        }
      }
    }

    this.eventQueue.drainCollisionEvents((handle1, handle2, started) => {
      if (started) {
        this.collisionEnterObjects.forEach((object) => {
          // Handle onCollisionEnter on instanced meshes
          if (object instanceof InstancedMesh) {
            const physicsBodies = this.instanceMeshMap.get(object);

            physicsBodies?.forEach((physicsBody) => {
              handleCollisionEvent(
                this.physicsWorld,
                handle1,
                handle2,
                object,
                physicsBody,
                "onCollisionEnter"
              );
            });

            // Handle onCollisionEnter on meshes
          } else if (object instanceof Mesh) {
            const physicsBody = this.meshMap.get(object);
            if (!physicsBody) return;

            handleCollisionEvent(
              this.physicsWorld,
              handle1,
              handle2,
              object,
              physicsBody,
              "onCollisionEnter"
            );
          }
        });
      } else {
        this.collisionExitObjects.forEach((object) => {
          // Handle onCollisionExit on instanced meshes
          if (object instanceof InstancedMesh) {
            const physicsBodies = this.instanceMeshMap.get(object);

            physicsBodies?.forEach((physicsBody) => {
              handleCollisionEvent(
                this.physicsWorld,
                handle1,
                handle2,
                object,
                physicsBody,
                "onCollisionExit"
              );
            });

            // Handle onCollisionExit on meshes
          } else if (object instanceof Mesh) {
            const physicsBody = this.meshMap.get(object);
            if (!physicsBody) return;

            handleCollisionEvent(
              this.physicsWorld,
              handle1,
              handle2,
              object,
              physicsBody,
              "onCollisionExit"
            );
          }
        });
      }
    });
  }

  handleContactsWith(): void {
    function handleContacts(
      physicsWorld: Physics2DWorld,
      object: Mesh | InstancedMesh,
      physicsBody: PhysicsBody
    ) {
      physicsWorld.contactsWith(physicsBody.collider, ({ handle }) => {
        // Get the other physicsBody involved in the contact
        const rigidBody = physicsWorld.getRigidBody(handle);
        const id = (rigidBody.userData as { id: string }).id;
        const collider = physicsWorld.getCollider(handle);

        // Handle the contact event
        if (isPatched(object) && "onContactsWith" in object) {
          object.onContactsWith(physicsBody, { id, rigidBody, collider });
        }
      });
    }

    this.contactsWithObjects.forEach((object) => {
      if (object instanceof InstancedMesh) {
        const physicsBodies = this.instanceMeshMap.get(object);

        physicsBodies?.forEach((physicsBody) => {
          handleContacts(this.physicsWorld, object, physicsBody);
        });
      } else if (object instanceof Mesh) {
        const physicsBody = this.meshMap.get(object);
        if (!physicsBody) return;

        handleContacts(this.physicsWorld, object, physicsBody);
      }
    });
  }
}
