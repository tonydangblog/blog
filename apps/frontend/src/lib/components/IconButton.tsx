import { useMounted } from "@lib/hooks/useMounted";
import Ping from "./Ping";

export default function IconButton({
  ariaLabel,
  ariaLabelToggled,
  toggledText,
  isToggled = false,
  hasPing = false,
  isPill = false,
  onClick,
  children,
}: {
  ariaLabel: string;
  ariaLabelToggled?: string;
  toggledText?: React.ReactNode;
  isToggled?: boolean;
  hasPing?: boolean;
  isPill?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const mounted = useMounted();

  return (
    <>
      <button
        className={`
          text-bg bg-text h-10 min-w-[40px] rounded-full drop-shadow
          ${isPill ? "text-bold px-3 font-sans" : "font-serif text-2xl"}
          ${!mounted && "cursor-not-allowed"}
        `}
        aria-label={isToggled ? ariaLabelToggled : ariaLabel}
        onClick={onClick}
      >
        {isToggled ? toggledText : children}
      </button>
      {hasPing && (
        <div className="absolute bottom-8 left-8">
          <Ping />
        </div>
      )}
    </>
  );
}