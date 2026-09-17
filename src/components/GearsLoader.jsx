function gearPoints(cx, cy, rOuter, rRoot, teeth) {
  const pts = [];
  const step = (Math.PI * 2) / teeth;
  // each tooth: root gap, rise, tip, fall (tip spans 28% of pitch, gap 30%)
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const segs = [
      [0.0, rRoot],
      [0.22, rRoot],
      [0.32, rOuter],
      [0.6, rOuter],
      [0.7, rRoot],
    ];
    for (const [f, r] of segs) {
      const ang = a + f * step;
      pts.push(`${(cx + r * Math.cos(ang)).toFixed(1)},${(cy + r * Math.sin(ang)).toFixed(1)}`);
    }
  }
  return pts.join(" ");
}

function Gear({ cx, cy, r, teeth, from, to, ring = "#D7DEE8", dur = 8, reverse = false, id }) {
  const pts = gearPoints(cx, cy, r, r * 0.82, teeth);
  const gid = `gg-${id}`;
  return (
    <g
      className={reverse ? "gears-ccw" : "gears-cw"}
      style={{ animationDuration: `${dur}s`, transformBox: "fill-box", transformOrigin: "center" }}
    >
      <defs>
        <radialGradient id={gid} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </radialGradient>
      </defs>
      <polygon points={pts} fill={`url(#${gid})`} strokeLinejoin="round" style={{ filter: "drop-shadow(0 6px 10px rgba(7,20,40,0.35))" }} />
      <circle cx={cx} cy={cy} r={r * 0.55} fill="none" stroke={ring} strokeWidth={r * 0.07} opacity="0.9" />
      <circle cx={cx} cy={cy} r={r * 0.2} fill="#071E3C" opacity="0.88" />
      <circle cx={cx - r * 0.06} cy={cy - r * 0.07} r={r * 0.06} fill="#FFFFFF" opacity="0.5" />
    </g>
  );
}

export function GearsMark({ size = 168 }) {
  return (
    <svg width={size} height={size * 0.86} viewBox="0 0 220 190" role="img" aria-label="Loading">
      <Gear id="g1" cx={72} cy={122} r={54} teeth={14} from="#17508B" to="#071E3C" dur={9} />
      <Gear id="g2" cx={152} cy={104} r={40} teeth={12} from="#1E5A9E" to="#0B2F5C" dur={7.7} reverse />
      <Gear id="g3" cx={106} cy={42} r={27} teeth={10} from="#6AA3DC" to="#2F5E93" dur={6.4} />
      <Gear id="g4" cx={150} cy={20} r={17} teeth={8} from="#C4D9F0" to="#7FA8D6" dur={5.1} reverse />
    </svg>
  );
}

export function GearsOverlay() {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-transparent" aria-hidden="true">
      <div className="flex flex-col items-center">
        <GearsMark size={202} />
        <div className="gears-floor" aria-hidden="true" />
      </div>
    </div>
  );
}
