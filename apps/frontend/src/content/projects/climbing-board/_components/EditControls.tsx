import { useContext } from "react";

import IconButton from "@lib/components/IconButton";

import { ControlsModeContext } from "../_context/ControlsModeContext";
import { CurrentProblemContext } from "../_context/CurrentProblemContext";
import { updateLocalStorage } from "../_hooks/useSyncLocalStorage";

import ControlsList from "./ControlsList";
import { unSetProblem } from "./ContextProvider";

export default function EditControls() {
  const { setControlsMode } = useContext(ControlsModeContext);
  const { currentProblem, setCurrentProblem } = useContext(
    CurrentProblemContext
  );

  return (
    <ControlsList>
      <li>
        <IconButton
          isPill
          disabled={
            currentProblem.start.length === 0 &&
            currentProblem.middle.length === 0 &&
            currentProblem.footOnly.length === 0 &&
            currentProblem.finish.length === 0
          }
          onClick={() => {
            updateLocalStorage(["problem", unSetProblem]);
            setCurrentProblem(unSetProblem);
          }}
        >
          Clear Holds
        </IconButton>
      </li>
      <li>
        <IconButton
          ariaLabel="Exit problem setting mode."
          onClick={() => {
            setControlsMode("transitioning_to_opened");
          }}
        >
          &#x2714;
        </IconButton>
      </li>
    </ControlsList>
  );
}