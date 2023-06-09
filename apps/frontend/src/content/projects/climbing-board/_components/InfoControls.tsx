import { useContext } from "react";

import Dialog from "@lib/react/components/Dialog";

import { ALLOWED_ANGLES } from "../_context/BoardAngleContext";
import { ALLOWED_WIDTHS } from "../_context/BoardWidthContext";
import { ControlsModeContext } from "../_context/ControlsModeContext";

import InAppLink from "./InAppLink";

export default function InfoControls() {
  const { setControlsMode } = useContext(ControlsModeContext);

  return (
    <Dialog
      isModal
      isProse
      hasPadding
      buttonWidth={100}
      confirmText="CLOSE"
      onConfirm={(e) => {
        e.preventDefault();
        setControlsMode("opened");
      }}
      onClose={(e) => {
        e.preventDefault();
        setControlsMode("opened");
      }}
    >
      <div className="mb-5">
        <h1 className="text-center">Climbing Board</h1>
        <p>Concept climbing training board app. Features include:</p>
        <ul>
          <li>
            Board <InAppLink controlsMode="width">width adjustment</InAppLink>{" "}
            from {ALLOWED_WIDTHS[0]} to {ALLOWED_WIDTHS.at(-1)} ft
          </li>
          <li>
            Board <InAppLink controlsMode="angle">angle adjustment</InAppLink>{" "}
            from {ALLOWED_ANGLES[0]} to {ALLOWED_ANGLES.at(-1)}&deg;
          </li>
          <li>
            <InAppLink controlsMode="transitioning_to_browse">
              Problem selection
            </InAppLink>{" "}
            from list of pseudo problems
          </li>
          <li>
            Custom{" "}
            <InAppLink controlsMode="transitioning_to_edit">
              problem setting
            </InAppLink>
          </li>
        </ul>
        <p>
          Inspired by the{" "}
          <a href="https://settercloset.com/pages/the-kilter-board">Kilter</a>,{" "}
          <a href="https://tensionclimbing.com/">Tension</a>, and{" "}
          <a href="https://www.moonboard.com/">Moon</a> boards.
        </p>
        <small>
          Created with <a href="https://threejs.org/">three.js</a> and{" "}
          <a href="https://docs.pmnd.rs/react-three-fiber/getting-started/introduction">
            react-three-fiber
          </a>
          .
        </small>
        <br />
        <small>
          <b>Code:</b>{" "}
          <a href="https://github.com/tonydangblog/blog/tree/main/apps/frontend/src/content/projects/climbing-board">
            Github
          </a>
        </small>
      </div>
    </Dialog>
  );
}
