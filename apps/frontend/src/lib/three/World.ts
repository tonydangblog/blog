import { Object3D } from "three";

import { createPerspectiveCamera } from "./components-core/perspective-camera";
import { createRenderer } from "./components-core/renderer";
import { createScene } from "./components-core/scene";

import { Gui } from "./systems/Gui";
import { Loop } from "./systems/Loop";
import { Physics2D } from "./systems/Physics2D";
import { Physics3D } from "./systems/Physics3D";
import { Pointer } from "./systems/Pointer";
import { Resizer } from "./systems/Resizer";

import type {
  EventDispatcher,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import type { Rapier2D, Rapier3D } from "./types/Rapier";

export class World {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  pointer: Pointer;
  loop: Loop;
  physics: Physics2D | Physics3D | null = null;
  gui: Gui | null = null;

  constructor(container: HTMLDivElement, RAPIER?: Rapier2D | Rapier3D) {
    // Create core components
    this.scene = createScene();
    this.camera = createPerspectiveCamera();
    this.renderer = createRenderer();
    container.append(this.renderer.domElement);

    // Create systems
    new Resizer(this, container);
    this.pointer = new Pointer(this);
    this.loop = new Loop(this);

    if (RAPIER !== undefined) {
      if ("Vector2" in RAPIER) {
        this.physics = new Physics2D(this, RAPIER);
      } else if ("Vector3" in RAPIER) {
        this.physics = new Physics3D(this, RAPIER);
      }

      if (this.physics) {
        this.loop.tickables.push(this.physics);
      }
    }

    this.gui = new Gui(this);
  }

  addObjects(objects: (EventDispatcher | Object3D)[]): void {
    // Add objects to root scene and relevant systems
    objects.forEach((object) => {
      if (object instanceof Object3D) {
        this.scene.add(object);
      }
      this.updateSystems(object);
    });

    // Initialize physics and GUI after all objects have been added
    this.physics?.init();
    this.gui?.init();
  }

  /**
   * Add an object to relevant systems
   */
  updateSystems(object: EventDispatcher | Object3D): void {
    if (object instanceof Object3D) {
      if ("addPhysics" in object) {
        this.physics?.objects.push(object);
      }

      if (
        "onClick" in object ||
        "onPointerEnter" in object ||
        "onPointerLeave" in object
      ) {
        this.pointer.objectsToTest.push(object);
      }
    }

    if ("tickOnRenderRequest" in object || "tickOnWorldStart" in object) {
      this.loop.tickables.push(object);
    }

    if ("updateGui" in object) {
      this.gui?.tweakables.push(object);
    }
  }

  requestRender(): void {
    this.loop.requestRender();
  }

  start(): void {
    this.loop.start();
  }

  stop(): void {
    this.loop.stop();
  }
}
