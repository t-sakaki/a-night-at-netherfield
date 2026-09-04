export type LivingPortraitKind = "lady" | "gent";
export type LivingPortraitExpression = "calm" | "pleased" | "concerned" | "tense";

type Props = {
  seed: string;
  kind: LivingPortraitKind;
  color: string;
  expression?: LivingPortraitExpression;
  className?: string;
};

function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return h;
}

const SKIN_TONES = ["#e9c9a3", "#dab88f", "#c99b76"];
const HAIR_TONES = ["#2a1c12", "#4a3222", "#6b4a2e", "#1c1410"];

const MOUTHS: Record<LivingPortraitExpression, string> = {
  calm: "M 44 92 Q 60 96 76 92",
  pleased: "M 42 90 Q 60 104 78 90",
  concerned: "M 46 96 Q 60 90 74 96",
  tense: "M 46 93 L 74 93",
};

const BROW_TILT: Record<LivingPortraitExpression, number> = {
  calm: 0,
  pleased: -4,
  concerned: 8,
  tense: 10,
};

const BODY_LADY = "M 20 140 Q 20 96 60 96 Q 100 96 100 140 Z";
const BODY_GENT = "M 26 140 L 26 104 Q 60 92 94 104 L 94 140 Z";
const HAIR_LADY_BACK = "M 30 40 Q 60 20 90 40 Q 96 70 88 92 Q 60 108 32 92 Q 24 70 30 40 Z";
const HAIR_LADY_FRONT = "M 30 48 Q 60 28 90 48 Q 88 56 60 52 Q 32 56 30 48 Z";
const HAIR_GENT = "M 32 50 Q 60 30 88 50 Q 86 42 60 40 Q 34 42 32 50 Z";

/**
 * A fully procedural SVG-drawn face — no art assets required. Deterministic
 * per `seed` so the same character always renders the same tones/timing,
 * but different characters' blink/sway phases fall out of sync naturally.
 */
export default function LivingPortrait({ seed, kind, color, expression = "calm", className }: Props) {
  const h = hash(seed);
  const swayDelay = -((h % 6500) / 1000);
  const nodDelay = -(((h >> 4) % 5500) / 1000);
  const blinkDelay = -(((h >> 8) % 5000) / 1000);
  const skin = SKIN_TONES[h % SKIN_TONES.length];
  const hair = HAIR_TONES[(h >> 3) % HAIR_TONES.length];
  const browTilt = BROW_TILT[expression];
  const mouthPath = MOUTHS[expression];

  return (
    <svg
      viewBox="0 0 120 140"
      className={className}
      role="img"
      aria-label={`${kind} portrait, ${expression} expression`}
    >
      <g className="lp-body" style={{ animationDelay: `${swayDelay}s` }}>
        <path d={kind === "lady" ? BODY_LADY : BODY_GENT} fill={color} />
        <g className="lp-head" style={{ animationDelay: `${nodDelay}s` }}>
          {kind === "lady" && <path d={HAIR_LADY_BACK} fill={hair} />}
          <circle cx="60" cy="70" r="30" fill={skin} />
          <path d={kind === "lady" ? HAIR_LADY_FRONT : HAIR_GENT} fill={hair} />
          <g transform={`rotate(${-browTilt} 46 55)`}>
            <rect x="38" y="52" width="16" height="3" rx="1.5" fill="#3a2418" />
          </g>
          <g transform={`rotate(${browTilt} 74 55)`}>
            <rect x="66" y="52" width="16" height="3" rx="1.5" fill="#3a2418" />
          </g>
          <ellipse cx="46" cy="66" rx="4" ry="5" fill="#2a1c12" />
          <ellipse cx="74" cy="66" rx="4" ry="5" fill="#2a1c12" />
          <rect
            className="lp-lid"
            x="40"
            y="60"
            width="14"
            height="10"
            fill={skin}
            style={{ animationDelay: `${blinkDelay}s` }}
          />
          <rect
            className="lp-lid"
            x="68"
            y="60"
            width="14"
            height="10"
            fill={skin}
            style={{ animationDelay: `${blinkDelay}s` }}
          />
          <path d={mouthPath} stroke="#7a3b2e" strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>
      </g>
    </svg>
  );
}
