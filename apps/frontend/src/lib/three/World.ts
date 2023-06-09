import { Object3D, Scene } from "three";

import { webGLRenderer } from "./components-core/webGLRenderer";
import { Loop } from "./systems/Loop";
import { Resizer } from "./systems/Resizer";

import type {
  EventDispatcher,
  OrthographicCamera,
  PerspectiveCamera,
  WebGLRenderer,
} from "three";
import type { Physics2D } from "./systems/Physics/Physics2D";
import type { Physics3D } from "./systems/Physics/Physics3D";
import type { Pointer } from "./systems/Pointer/Pointer";
import type { Gui } from "./systems/Gui";
import type { PostProcessor } from "./systems/PostProcessor";
import type { Statistics } from "./systems/Statistics";

export class World {
  camera: OrthographicCamera | PerspectiveCamera;
  scene: Scene;
  renderer: WebGLRenderer;
  loop: Loop;
  pointer: Pointer | null = null;
  physics: Physics2D | Physics3D | null = null;
  postProcessor: PostProcessor | null = null;
  gui: Gui | null = null;
  statistics: Statistics | null = null;

  constructor({
    camera,
    renderer = webGLRenderer({}),
    container,
    minAspectRatio = 1,
    pointer,
    physics,
    postProcessor,
    gui,
    statistics,
  }: {
    camera: OrthographicCamera | PerspectiveCamera;
    renderer?: WebGLRenderer;
    container: HTMLDivElement;
    minAspectRatio?: number;
    pointer?: typeof Pointer;
    physics?: typeof Physics2D | typeof Physics3D;
    postProcessor?: typeof PostProcessor;
    gui?: typeof Gui;
    statistics?: typeof Statistics;
  }) {
    // Create core components
    this.camera = camera;
    this.scene = new Scene();
    this.renderer = renderer;
    container.append(this.renderer.domElement);

    // Add animation loop
    this.loop = new Loop(this);

    // Add optional pointer to listen for pointer events
    if (pointer) {
      this.pointer = new pointer(this);
    }

    // Add optional physics
    if (physics) {
      this.physics = new physics(this);
      this.loop.tickables.push(this.physics);
    }

    // Add optional post processing
    if (postProcessor) {
      this.postProcessor = new postProcessor(this);
    }

    // Add optional GUI
    if (gui) {
      this.gui = new gui(this);
      this.gui.tweakables.push(this.loop);
    }

    // Add optional stats collection
    if (statistics) {
      this.statistics = new statistics(this);
      this.gui?.tweakables.push(this.statistics);
    }

    // Add handling for window resizes
    new Resizer(this, container, minAspectRatio);
  }

  addObjects(objects: (EventDispatcher | Object3D)[]): void {
    // Add objects to root scene and relevant systems
    objects.forEach((object) => {
      if (object instanceof Object3D && !(object instanceof Scene)) {
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
      if ("addPhysics2D" in object || "addPhysics3D" in object) {
        this.physics?.objects.push(object);
      }

      if ("onCollisionEnter" in object) {
        this.physics?.collisionEnterObjects.push(object);
      }
      if ("onCollisionExit" in object) {
        this.physics?.collisionExitObjects.push(object);
      }
      if ("onContactsWith" in object) {
        this.physics?.contactsWithObjects.push(object);
      }
      if ("onSleep" in object || "onWake" in object) {
        this.physics?.sleepAndWakeObjects.push(object);
      }

      if (
        "onClick" in object ||
        "onPointerEnter" in object ||
        "onPointerLeave" in object
      ) {
        this.pointer?.objectsToTest.push(object);
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

  runWhileAwake(): void {
    this.physics?.runWhileAwake();
  }

  start(): void {
    this.loop.start();
  }

  stop(): void {
    this.loop.stop();
  }
}
