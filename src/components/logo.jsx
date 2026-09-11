import logoOrange from "../assets/aurex-logo.png";
import logoWhite from "../assets/aurex-logo-white.png";

// The supplied Aurex wordmark. Orange reads well on both white and dark grounds, so it is
// the default. Pass mono for a flat white knockout on busy or coloured panels.
export function LogoFull({ className = "", light = false, mono = false }) {
  return (
    <span className={`inline-flex items-center shrink-0 ${className}`}>
      <img
        src={mono ? logoWhite : logoOrange}
        alt="Aurex Truck Parts"
        width={132}
        height={53}
        className="h-9 w-auto select-none"
        draggable={false}
      />
      <span className="sr-only">Aurex Truck Parts Australia</span>
    </span>
  );
}

export function LogoCompact({ className = "", size = 36, mono = false }) {
  return (
    <img
      src={mono ? logoWhite : logoOrange}
      alt="Aurex Truck Parts"
      style={{ height: size }}
      className={`w-auto select-none ${className}`}
      draggable={false}
    />
  );
}
