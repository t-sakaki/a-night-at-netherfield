import { useEffect, useRef } from "react";
import { CHARACTERS, type LocalizedText } from "@/data/characters";
import { CharacterPortrait } from "@/components/CharacterPortrait";

type Props = {
  askText: LocalizedText;
  remainingMs: number;
  totalMs: number;
  onDecide: (decision: "accept" | "decline") => void;
};

export default function DanceRequestPrompt({ askText, remainingMs, totalMs, onDecide }: Props) {
  const acceptRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    acceptRef.current?.focus();
  }, []);

  const pct = Math.max(0, Math.min(100, (remainingMs / totalMs) * 100));

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 p-6">
      <div className="w-full max-w-md rounded-lg border border-white/15 bg-[#211712]/95 p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <CharacterPortrait
            id={CHARACTERS.darcy.id}
            kind={CHARACTERS.darcy.kind}
            color={CHARACTERS.darcy.color}
            size={56}
            title={CHARACTERS.darcy.name.en}
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-widest text-white/50">{CHARACTERS.darcy.name.en}</p>
            <p className="mt-1 text-lg leading-relaxed">{askText.en}</p>
          </div>
        </div>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full bg-amber-400/80 transition-[width] duration-100 ease-linear"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onDecide("decline")}
            className="rounded border border-white/20 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            Decline
          </button>
          <button
            ref={acceptRef}
            type="button"
            onClick={() => onDecide("accept")}
            className="rounded bg-amber-500/90 px-4 py-2 text-sm font-medium text-[#211712] hover:bg-amber-400"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
