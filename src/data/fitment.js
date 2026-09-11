// Structured fitment engine for the Aurex garage.
// The catalog stores free text `fit` plus make and model cues inside name, oem and desc.
// We derive a machine readable fitment object from that text once, at load time, so the
// garage can filter and rank the whole catalogue without hand editing every product.

// Australian truck makes and their model families. Used by the vehicle selector.
export const TRUCK_MAKES = {
  Kenworth: ["T410", "T610", "T909", "K200"],
  Volvo: ["FH", "FM", "FE"],
  Isuzu: ["N Series", "F Series", "FVR", "FSR"],
  Hino: ["300 Series", "500 Series", "700 Series"],
  Mack: ["Anthem", "Trident", "Superliner"],
  Scania: ["R Series", "P Series", "G Series"],
  Fuso: ["Canter", "Fighter", "Shogun"],
  "UD Trucks": ["Croner", "Quon"],
  Freightliner: ["Cascadia", "Argosy"],
  Iveco: ["Daily", "Eurocargo", "Stralis"],
};

// Newest first. A plain year list reads cleaner than ranges in the selector.
export const TRUCK_YEARS = Array.from({ length: 19 }, (_, i) => String(2026 - i));

// Make detection rules. Word boundaries keep numbers like 5000kg from matching a model.
const MAKE_KEYS = {
  Volvo: [/\bvolvo\b/, /\bd13\b/, /\bd11\b/, /\bfh\b/, /\bfm\b/],
  Kenworth: [/\bkenworth\b/, /\bt610\b/, /\bt410\b/, /\bt909\b/, /\bk200\b/, /\bx15\b/],
  Hino: [/\bhino\b/],
  Scania: [/\bscania\b/, /\br450\b/, /\br500\b/],
  Mack: [/\bmack\b/, /\banthem\b/, /\bmp8\b/],
  Isuzu: [/\bisuzu\b/, /\b6hk1\b/, /\bfsr\b/, /\bftr\b/, /\bfvr\b/],
};

// Map a matched make to the model family named in the text, when we can find one.
const MODEL_HINTS = {
  Volvo: [["FH", /\bfh\b/], ["FM", /\bfm\b/]],
  Kenworth: [["T610", /\bt610\b/], ["T410", /\bt410\b/], ["T909", /\bt909\b/], ["K200", /\bk200\b/]],
  Hino: [["500 Series", /\b500\b|\bgh\b|h500/], ["300 Series", /\b300\b/], ["700 Series", /\b700\b/]],
  Scania: [["R Series", /\br\b|r450|r500|r series|r cab/]],
  Mack: [["Anthem", /anthem|mp8/]],
  Isuzu: [["F Series", /f series|fsr|ftr|fvr|6hk1/], ["N Series", /\bn series\b/]],
};

// Universal parts fit any truck the buyer selects. Trailer and generic gear lives here.
const UNIVERSAL_HINTS = [
  /trailer/, /caravan/, /\bboat\b/, /toolbox/, /canopy/, /universal/, /all trailers/,
  /marine/, /workshop/, /prime mover/, /air brake/, /\bbpw\b/, /\bsaf\b/, /gladhand/,
];

export function deriveFitment(p) {
  const hay = `${p.name} ${p.fit || ""} ${p.oem || ""} ${p.desc || ""}`.toLowerCase();

  const apps = [];
  for (const [make, regs] of Object.entries(MAKE_KEYS)) {
    if (regs.some((r) => r.test(hay))) {
      let model = null;
      for (const [name, rx] of MODEL_HINTS[make] || []) {
        if (rx.test(hay)) { model = name; break; }
      }
      apps.push({ make, model });
    }
  }

  if (apps.length) return { universal: false, apps };

  const universal = UNIVERSAL_HINTS.some((r) => r.test(hay));
  // Anything with no make cue is treated as a cross make part so it never wrongly disappears.
  return { universal: universal || true, apps: [] };
}

// One source of truth for the fit state of a part against the selected truck.
// Returns one of: "fits" | "universal" | "no" | "unknown".
export function matchFit(product, vehicle) {
  if (!vehicle || !vehicle.make) return "unknown";
  const f = product?.fitment;
  if (!f) return "unknown";
  if (f.universal) return "universal";
  if (!f.apps || f.apps.length === 0) return "unknown";
  return f.apps.some((a) => a.make === vehicle.make) ? "fits" : "no";
}

// Rank weight so fitting parts float to the top of any list.
export const FIT_RANK = { fits: 0, universal: 1, unknown: 2, no: 3 };

// Copy for the fit chip, kept short and specific.
export function fitLabel(status, vehicle) {
  if (status === "fits") return vehicle?.model ? `Fits your ${vehicle.model}` : "Fits your truck";
  if (status === "universal") return "Universal fit";
  if (status === "no") return "Other makes";
  return "";
}
