import { useEffect, useRef, useState } from "react";
import type { InterludeLine } from "@/data/collinsInterlude";

type Props = {
  lines: InterludeLine[];
  onComplete: () => void;
};

/**
 * A full-screen, non-dismissible auto-advancing dialogue box: there is no
 * choice offered here, only pacing control (click/focus + Enter/Space
 * shortens the hold, matching the "no real choice yet" beat it renders).
 */
export default function InterludeOverlay({ lines, onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const advancingRef = useRef(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    advancingRef.current = false;
    buttonRef.current?.focus();
    const line = lines[index];
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

  return (
    <div className="absolute inset-0 flex items-end justify-center bg-black/40 p-6">
      <button
        ref={buttonRef}
        type="button"
        onClick={advance}
        className="w-full max-w-lg rounded-lg border border-white/15 bg-[#211712]/95 p-5 text-left shadow-xl"
      >
        {line.speaker !== "narration" && (
          <p className="text-xs uppercase tracking-widest text-white/50">{line.speaker}</p>
        )}
        <p className={`mt-2 text-lg leading-relaxed ${line.speaker === "narration" ? "italic text-white/80" : ""}`}>
          {line.text.en}
        </p>
        <p className="mt-3 text-xs text-white/40">Click, Space, or Enter to continue</p>
      </button>
    </div>
  );
}
