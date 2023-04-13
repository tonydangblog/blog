import { useContext, useLayoutEffect, useRef } from "react";
import { Color, Euler, Matrix4, Vector3 } from "three";

import { bright } from "@lib/colors/paul-tol";

import { CurrentProblemContext } from "../_context/CurrentProblemContext";
import {
  BOARD_THICKNESS,
  NUM_GRIP_TYPES,
} from "../_lib/constants/constants.js";

import type { InstancedMesh } from "three";
import type { Hold } from "../_lib/types/Hold";

const euler = new Euler();
const vector3 = new Vector3();
const matrix4 = new Matrix4();
const color = new Color();

export default function Holds({
  gripType,
  holds,
  xStart,
  yStart,
}: {
  gripType: number;
  holds: Hold[];
  xStart: number;
  yStart: number;
}) {
  const { currentProblem } = useContext(CurrentProblemContext);
  const instancedMesh = useRef<InstancedMesh>(null);
  const filteredHolds = holds.filter((hold) => hold.gripType === gripType);

  useLayoutEffect(() => {
    filteredHolds.forEach((hold, index) => {
      if (!instancedMesh.current) return;

      // Set rotation and position
      euler.set(0, 0, hold.rotation);
      vector3.set(
        xStart + hold.xOffset,
        yStart + hold.yOffset,
        BOARD_THICKNESS / 2
      );
      matrix4.makeRotationFromEuler(euler);
      matrix4.setPosition(vector3);
      instancedMesh.current.setMatrixAt(index, matrix4);
      instancedMesh.current.instanceMatrix.needsUpdate = true;

      // Set color
      let holdColor = bright.grey;
      if (currentProblem.start.includes(hold.id)) {
        holdColor = bright.green;
      } else if (currentProblem.middle.includes(hold.id)) {
        holdColor = bright.blue;
      } else if (currentProblem.footOnly.includes(hold.id)) {
        holdColor = bright.yellow;
      } else if (currentProblem.finish.includes(hold.id)) {
        holdColor = bright.purple;
      }
      instancedMesh.current.setColorAt(index, color.set(`#${holdColor}`));
      if (instancedMesh.current.instanceColor) {
        instancedMesh.current.instanceColor.needsUpdate = true;
      }
    });
  }, [currentProblem, filteredHolds, xStart, yStart]);

  return (
    <instancedMesh
      ref={instancedMesh}
      args={[undefined, undefined, filteredHolds.length]}
    >
      {/* Jug */}
      {gripType === 0 && (
        <cylinderGeometry
          args={[
            3 / 12, // radiusTop
            1 / 12, // radiusBottom
            3 / 12, // height
            3, // radialSegments
            1, // heightSegments
            false, // openEnded
            -Math.PI * 0.5, // thetaStart
            Math.PI, // thetaLength
          ]}
        />
      )}

      {/* Crimp */}
      {gripType === 1 && (
        <cylinderGeometry
          args={[
            2 / 12, // radiusTop
            2 / 12, // radiusBottom
            1 / 12, // height
            3, // radialSegments
            1, // heightSegments
            false, // openEnded
            -Math.PI * 0.5, // thetaStart
            Math.PI, // thetaLength
          ]}
        />
      )}

      {/* Slopper */}
      {gripType === 2 && (
        <sphereGeometry
          args={[
            3 / 12, // radius
            3, // widthSegments
            4, // heightSegments
            0, // phiStart
            Math.PI, // phiLength
            0, // thetaStart
            Math.PI, // thetaLength
          ]}
        />
      )}

      {/* Foot Chip */}
      {gripType === NUM_GRIP_TYPES - 1 && (
        <boxGeometry args={[1 / 12, 1 / 12, 1 / 12]} />
      )}

      <meshStandardMaterial flatShading />
    </instancedMesh>
  );
}
