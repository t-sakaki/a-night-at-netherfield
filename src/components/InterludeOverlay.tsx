import { useEffect, useRef, useState } from "react";
import type { InterludeLine } from "@/data/collinsInterlude";
import { CharacterPortrait } from "@/components/CharacterPortrait";
import { CHARACTERS, type CharacterId } from "@/data/characters";

type Props = {
  lines: InterludeLine[];
  onComplete: () => void;
  onLineChange?: (line: InterludeLine) => void;
};

/**
 * A full-screen, non-dismissible auto-advancing dialogue box: there is no
 * choice offered here, only pacing control (click/focus + Enter/Space
 * shortens the hold, matching the "no real choice yet" beat it renders).
 */
export default function InterludeOverlay({ lines, onComplete, onLineChange }: Props) {
  const [index, setIndex] = useState(0);
  const advancingRef = useRef(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    advancingRef.current = false;
    buttonRef.current?.focus();
    const line = lines[index];
    onLineChange?.(line);
    const timer = setTimeout(advance, line.holdMs);
    return () => clearTimeout(timer);
  }, [index]);

  function advance() {
    if (advancingRef.current) return;
    advancingRef.current = true;
    if (index + 1 >= lines.length) {
      onComplete();
    } else {
      setIndex((i) => i + 1);
    }
  }

  const line = lines[index];
  const speaker = line.speaker !== "narration" ? CHARACTERS[line.speaker as CharacterId] : null;

  return (
    <div className="absolute inset-0 flex items-end justify-center bg-black/40 p-6">
      <button
        ref={buttonRef}
        type="button"
        onClick={advance}
        className="flex w-full max-w-lg items-start gap-4 rounded-lg border border-white/15 bg-[#211712]/95 p-5 text-left shadow-xl"
      >
        {speaker && (
          <CharacterPortrait
            id={speaker.id}
            kind={speaker.kind}
            color={speaker.color}
            size={56}
            title={speaker.name.en}
          />
        )}
        <div className="min-w-0 flex-1">
          {speaker && <p className="text-xs uppercase tracking-widest text-white/50">{speaker.name.en}</p>}
          <p className={`mt-2 text-lg leading-relaxed ${line.speaker === "narration" ? "italic text-white/80" : ""}`}>
            {line.text.en}
          </p>
          <p className="mt-3 text-xs text-white/40">Click, Space, or Enter to continue</p>
        </div>
      </button>
    </div>
  );
}
