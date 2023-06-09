import GUI from "lil-gui";
import { isPatched } from "../types/Patched";

import type { EventDispatcher, Object3D } from "three";
import type { World } from "../World";
import type { Loop } from "./Loop";
import type { Statistics } from "./Statistics";

export class Gui {
  gui: GUI;
  folders: { [key: string]: boolean } = {};
  foldersFolder: GUI;
  devFolder: GUI;
  tweakables: (EventDispatcher | Loop | Object3D | Statistics)[] = [];

  constructor(world: World) {
    // Create GUI
    const container = document.getElementById("lil-gui");
    const options = container ? { container } : {};
    this.gui = new GUI({ ...options, title: "CONTROLS" });

    // Create "folders" and "dev" folders
    this.foldersFolder = this.gui.addFolder("folders");
    this.devFolder = this.createFolder("dev");

    // Request a render with every change on the GUI
    this.gui.onChange(() => world.requestRender());
  }

  init(): void {
    this.tweakables.forEach((object) => {
      if (isPatched(object) && "updateGui" in object) {
        object.updateGui(this);
      }
    });
  }

  createFolder = (name: string, showFolder = false): GUI => {
    // Create folder
    const folder = this.gui.addFolder(name);
    folder.show(showFolder);

    // Create folder toggle
    this.folders[name] = showFolder;
    this.foldersFolder
      .add(this.folders, name)
      .onChange(() => folder.show(folder._hidden));

    return folder;
  };
}
