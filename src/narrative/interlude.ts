import type { LocalizedText } from "@/data/characters";

export type InterludeSpeaker = "collins" | "elizabeth" | "narration" | "mrs-bennet";

export type InterludeLine = {
  id: string;
  speaker: InterludeSpeaker;
  text: LocalizedText;
  holdMs: number;
};
