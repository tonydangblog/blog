import { useLayoutEffect, useRef } from "react";
import { CylinderGeometry, Matrix4 } from "three";

import { BOARD_THICKNESS } from "../_lib/constants/constants.js";
import { padAndNutMaterial } from "../_lib/materials/padAndNutMaterial";

import type { InstancedMesh } from "three";
import type { Hold } from "../_lib/types/Hold";

const matrix4 = new Matrix4();
const NUT_HEIGHT = 0.5 / 12;
const nutGeometry = new CylinderGeometry(0.5 / 12, 0.5 / 12, NUT_HEIGHT, 6);

export default function Nuts({
  holds,
  xStart,
  yStart,
}: {
  holds: Hold[];
  xStart: number;
  yStart: number;
}) {
  const instancedMesh = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    holds.forEach((hold, index) => {
      if (!instancedMesh.current) return;

      matrix4.makeRotationX(-Math.PI * 0.5);
      matrix4.setPosition(
        xStart + hold.xOffset,
        yStart + hold.yOffset,
        -NUT_HEIGHT / 2 - BOARD_THICKNESS / 2
      );
      instancedMesh.current.setMatrixAt(index, matrix4);
      instancedMesh.current.instanceMatrix.needsUpdate = true;
    });
  }, [holds, xStart, yStart]);

  return (
    <instancedMesh
      ref={instancedMesh}
      args={[nutGeometry, padAndNutMaterial, holds.length]}
    ></instancedMesh>
  );
}
