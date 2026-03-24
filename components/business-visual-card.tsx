"use client";

import type { CSSProperties } from "react";

import { getBusinessTheme } from "@/lib/business-theme";
import type { BusinessType } from "@/types/business";

type BusinessVisualCardProps = {
  type: BusinessType;
  businessName: string;
  label: string;
  title: string;
  description: string;
  chips: string[];
  mode?: "entry" | "photo";
};

type SceneProps = {
  type: BusinessType;
  dark: boolean;
};

function SceneArt({ type, dark }: SceneProps) {
  const soft = dark ? "rgba(255,255,255,0.12)" : "rgba(20,18,16,0.08)";
  const line = dark ? "rgba(255,255,255,0.18)" : "rgba(20,18,16,0.12)";
  const ink = dark ? "#f7f2e8" : "#171311";
  const paper = dark ? "rgba(255,255,255,0.06)" : "#fffaf1";

  return (
    <svg viewBox="0 0 560 420" className="h-auto w-full" fill="none" aria-hidden="true">
      <rect x="16" y="16" width="528" height="388" rx="40" fill={paper} />
      <circle cx="450" cy="88" r="54" fill={soft} />
      <circle cx="120" cy="318" r="72" fill={soft} />
      <path d="M64 330H496" stroke={line} strokeWidth="10" strokeLinecap="round" />

      {type === "cafe" ? (
        <>
          <ellipse cx="220" cy="304" rx="124" ry="28" fill={soft} />
          <rect x="164" y="180" width="108" height="94" rx="28" fill={ink} />
          <rect x="255" y="198" width="40" height="56" rx="20" stroke={ink} strokeWidth="14" />
          <rect x="150" y="274" width="154" height="18" rx="9" fill={ink} fillOpacity="0.2" />
          <path d="M191 150C183 133 198 125 198 112" stroke={ink} strokeWidth="10" strokeLinecap="round" />
          <path d="M223 150C215 133 230 125 230 112" stroke={ink} strokeWidth="10" strokeLinecap="round" />
          <path d="M255 150C247 133 262 125 262 112" stroke={ink} strokeWidth="10" strokeLinecap="round" />
          <path d="M362 260C390 222 440 230 450 272C454 290 440 308 420 308H360C334 308 320 276 338 258L362 260Z" fill={ink} />
          <path d="M362 286C384 268 410 270 426 292" stroke={paper} strokeWidth="10" strokeLinecap="round" />
        </>
      ) : null}

      {type === "salon" ? (
        <>
          <rect x="132" y="64" width="170" height="210" rx="84" fill={ink} fillOpacity="0.08" />
          <rect x="156" y="88" width="122" height="162" rx="60" fill={ink} />
          <rect x="204" y="252" width="24" height="72" rx="12" fill={ink} />
          <rect x="176" y="316" width="80" height="18" rx="9" fill={ink} />
          <rect x="360" y="138" width="84" height="98" rx="26" fill={ink} />
          <rect x="330" y="228" width="144" height="28" rx="14" fill={ink} />
          <rect x="352" y="256" width="22" height="72" rx="11" fill={ink} />
          <rect x="430" y="256" width="22" height="72" rx="11" fill={ink} />
          <path d="M112 118C140 110 152 96 170 72" stroke={ink} strokeWidth="10" strokeLinecap="round" />
          <path d="M108 146C138 140 162 126 182 98" stroke={ink} strokeWidth="10" strokeLinecap="round" />
          <circle cx="420" cy="106" r="16" fill={ink} />
          <circle cx="458" cy="86" r="10" fill={ink} fillOpacity="0.4" />
        </>
      ) : null}

      {type === "clinic" ? (
        <>
          <rect x="120" y="88" width="148" height="180" rx="28" fill={ink} />
          <rect x="162" y="126" width="64" height="20" rx="10" fill={paper} />
          <rect x="184" y="104" width="20" height="64" rx="10" fill={paper} />
          <rect x="312" y="110" width="126" height="96" rx="24" fill={ink} />
          <rect x="296" y="250" width="166" height="42" rx="20" fill={ink} />
          <rect x="322" y="292" width="18" height="44" rx="9" fill={ink} />
          <rect x="418" y="292" width="18" height="44" rx="9" fill={ink} />
          <path d="M118 326C152 300 178 282 208 282C244 282 264 306 286 326" stroke={ink} strokeWidth="14" strokeLinecap="round" />
          <circle cx="392" cy="84" r="12" fill={ink} fillOpacity="0.4" />
          <circle cx="428" cy="74" r="8" fill={ink} fillOpacity="0.25" />
        </>
      ) : null}

      {type === "gym" ? (
        <>
          <rect x="110" y="190" width="38" height="114" rx="14" fill={ink} />
          <rect x="150" y="170" width="40" height="154" rx="14" fill={ink} />
          <rect x="190" y="210" width="178" height="74" rx="20" fill={ink} />
          <rect x="368" y="170" width="40" height="154" rx="14" fill={ink} />
          <rect x="410" y="190" width="38" height="114" rx="14" fill={ink} />
          <path d="M170 116C210 86 250 86 286 116" stroke={ink} strokeWidth="14" strokeLinecap="round" />
          <path d="M256 128H328C342 128 354 140 354 154V166" stroke={ink} strokeWidth="14" strokeLinecap="round" />
          <path d="M456 322L474 268C478 254 466 240 452 246L420 260C412 264 408 272 410 280L420 322H456Z" fill={ink} />
          <rect x="238" y="322" width="84" height="18" rx="9" fill={ink} fillOpacity="0.2" />
        </>
      ) : null}

      {type === "hotel" ? (
        <>
          <rect x="98" y="208" width="258" height="88" rx="26" fill={ink} />
          <rect x="118" y="162" width="94" height="66" rx="22" fill={ink} />
          <rect x="208" y="174" width="116" height="46" rx="18" fill={paper} fillOpacity="0.15" />
          <rect x="96" y="296" width="274" height="20" rx="10" fill={ink} fillOpacity="0.24" />
          <rect x="400" y="138" width="22" height="132" rx="11" fill={ink} />
          <path d="M386 138H436C452 138 466 152 466 168V182H386V138Z" fill={ink} />
          <rect x="420" y="258" width="64" height="14" rx="7" fill={ink} />
          <rect x="428" y="110" width="22" height="22" rx="11" fill={ink} fillOpacity="0.26" />
          <rect x="116" y="106" width="132" height="28" rx="14" fill={ink} fillOpacity="0.2" />
        </>
      ) : null}
    </svg>
  );
}

export function BusinessVisualCard({
  type,
  businessName,
  label,
  title,
  description,
  chips,
  mode = "entry"
}: BusinessVisualCardProps) {
  const theme = getBusinessTheme(type);
  const isPhoto = mode === "photo";
  const style = {
    "--visual-primary": theme.primary,
    "--visual-highlight": theme.highlight,
    "--visual-glow": theme.glow,
    "--visual-surface": theme.surface
  } as CSSProperties;

  return (
    <div
      style={style}
      className={`relative overflow-hidden rounded-[34px] border ${
        isPhoto
          ? "border-black/8 bg-[var(--color-paper)] text-[var(--color-ink)]"
          : "border-white/10 bg-white/[0.04] text-white"
      } p-5 sm:p-6`}
    >
      <div
        className={`pointer-events-none absolute inset-0 ${
          isPhoto
            ? "bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.64),transparent_34%),radial-gradient(circle_at_bottom_left,var(--visual-glow),transparent_28%)]"
            : "bg-[radial-gradient(circle_at_top_right,var(--visual-glow),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_26%)]"
        }`}
      />

      <div className="relative z-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-[20rem]">
            <p
              className={`text-[11px] uppercase tracking-[0.24em] ${
                isPhoto ? "text-black/42" : "text-[var(--color-muted)]"
              }`}
            >
              {label}
            </p>
            <h3 className="mt-3 font-display text-[1.9rem] font-semibold leading-[1.02] tracking-[-0.045em]">
              {title}
            </h3>
          </div>

          <span
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
              isPhoto
                ? "bg-black/5 text-black/65"
                : "border border-white/10 bg-white/[0.05] text-white/80"
            }`}
          >
            {businessName}
          </span>
        </div>

        <div
          className={`float-soft mt-5 overflow-hidden rounded-[30px] border ${
            isPhoto
              ? "border-black/8 bg-white p-3 shadow-[0_20px_50px_rgba(20,18,16,0.12)]"
              : "border-white/10 bg-black/20 p-3"
          }`}
        >
          <div
            className={`overflow-hidden rounded-[24px] ${
              isPhoto ? "bg-[var(--visual-surface)]" : "bg-white/[0.04]"
            }`}
          >
            <SceneArt type={type} dark={!isPhoto} />
          </div>
        </div>

        <p
          className={`mt-5 max-w-[32rem] text-sm leading-6 ${
            isPhoto ? "text-black/65" : "text-white/72"
          }`}
        >
          {description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {chips.slice(0, 3).map((chip) => (
            <span
              key={chip}
              className={`rounded-full px-4 py-2 text-sm ${
                isPhoto
                  ? "bg-black/5 text-black/70"
                  : "border border-white/10 bg-white/[0.04] text-white/82"
              }`}
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
