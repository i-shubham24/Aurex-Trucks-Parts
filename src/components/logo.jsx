import logoBlue from "../assets/aurex-logo-blue.png";
import logoWhite from "../assets/aurex-logo-white.png";

// Chrome/blue Aurex wordmark (copper recoloured to brand blue). Default for
// light surfaces; pass mono for the flat white knockout on dark panels.
export function LogoFull({ className = "", light = false, mono = false, size = 40 }) {
  return (
    <span className={`inline-flex items-center shrink-0 ${className}`}>
      <img
        src={mono ? logoWhite : logoBlue}
        alt="Aurex Truck Parts"
        style={{ height: size }}
        className="w-auto select-none"
        draggable={false}
      />
      <span className="sr-only">Aurex Truck Parts Australia</span>
    </span>
  );
}

export function LogoCompact({ className = "", size = 40, mono = false }) {
  return (
    <img
      src={mono ? logoWhite : logoBlue}
      alt="Aurex Truck Parts"
      style={{ height: size }}
      className={`w-auto select-none ${className}`}
      draggable={false}
    />
  );
}
