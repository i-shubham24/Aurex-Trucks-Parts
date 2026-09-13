import logoOrange from "../assets/aurex-logo.png";
import logoWhite from "../assets/aurex-logo-white.png";
import mainLogo from "../assets/mainlogo.png";

// The official Aurex 3D emblem is the primary mark across the site (nav bar, footer, cards).
// Only explicit mono={true} uses the flat white knockout wordmark.
export function LogoFull({ className = "", imgClassName = "", light = false, mono = false, size }) {
  const chosenSrc = mono ? logoWhite : mainLogo;
  const defaultHeightStyle = size !== undefined ? { height: size } : undefined;

  return (
    <span className={`inline-flex items-center shrink-0 ${className}`}>
      <img
        src={chosenSrc}
        alt="Aurex Truck Parts"
        style={defaultHeightStyle}
        className={
          imgClassName ||
          (size !== undefined
            ? "w-auto select-none object-contain"
            : "h-8 sm:h-9 md:h-10 w-auto select-none object-contain")
        }
        draggable={false}
      />
      <span className="sr-only">Aurex Truck Parts Australia</span>
    </span>
  );
}

export function LogoCompact({ className = "", size, mono = false, light = false }) {
  const chosenSrc = mono ? logoWhite : mainLogo;
  return (
    <img
      src={chosenSrc}
      alt="Aurex Truck Parts"
      style={size !== undefined ? { height: size } : undefined}
      className={
        size !== undefined
          ? `w-auto select-none object-contain ${className}`
          : `h-8 sm:h-9 w-auto select-none object-contain ${className}`
      }
      draggable={false}
    />
  );
}

