import { useContext } from "react";

import ControlsList from "@lib/react/components/ControlsList";
import IconButton from "@lib/react/components/IconButton";

import { BoardAngleContext } from "../_context/BoardAngleContext";
import { BoardWidthContext } from "../_context/BoardWidthContext";
import { ControlsModeContext } from "../_context/ControlsModeContext";
import { CurrentProblemContext } from "../_context/CurrentProblemContext";

import type { Dispatch, SetStateAction } from "react";

export default function OpenedControls({
  showInfoPing,
  setShowInfoPing,
}: {
  showInfoPing: boolean;
  setShowInfoPing: Dispatch<SetStateAction<boolean>>;
}) {
  const { boardAngle } = useContext(BoardAngleContext);
  const { boardWidth } = useContext(BoardWidthContext);
  const { setControlsMode } = useContext(ControlsModeContext);
  const { currentProblem } = useContext(CurrentProblemContext);

  const name = currentProblem.name ? currentProblem.name : "Select Problem";
  const grade = currentProblem.grade === -1 ? "" : `V${currentProblem.grade}`;

  return (
    <ControlsList isVertical shiftUp>
      <li className="flex flex-wrap gap-2">
        <IconButton
          isPill
          onClick={() => setControlsMode("transitioning_to_browse")}
        >
          {name} {grade && <>&nbsp;{grade}</>}
        </IconButton>
        <IconButton
          isPill
          onClick={() => setControlsMode("transitioning_to_edit")}
        >
          Set Problem
        </IconButton>
      </li>
      <li className="flex flex-wrap gap-2">
        <IconButton
          ariaLabel="Change board width."
          isPill
          onClick={() => setControlsMode("width")}
        >
          {boardWidth} ft
        </IconButton>
        <IconButton
          ariaLabel="Change board angle."
          isPill
          onClick={() => setControlsMode("angle")}
        >
          {boardAngle}&deg;
        </IconButton>
      </li>
      <li>
        <IconButton
          ariaLabel="Show Info."
          hasPing={showInfoPing}
          onClick={() => {
            setShowInfoPing(false);
            setControlsMode("info");
          }}
        >
          i
        </IconButton>
      </li>
    </ControlsList>
  );
}
