import type { LocalizedText } from "@/data/characters";
import { COLLINS_INTERLUDE } from "@/data/collinsInterlude";
import { DARCY_ACCEPT_RESULT, DARCY_ASK, DARCY_DECLINE_RESULT } from "@/data/darcyRequest";

/**
 * Single source of truth for every spoken line in the game, keyed by the
 * same id used for both the pre-generated mp3 filename
 * (public/vo/<lang>/<id>.mp3) and the SpeechSynthesis fallback text.
 */
export const VOICE_LINES: Record<string, LocalizedText> = {
  ...Object.fromEntries(COLLINS_INTERLUDE.map((line) => [line.id, line.text])),
  "darcy-ask": DARCY_ASK,
  "darcy-accept-result": DARCY_ACCEPT_RESULT,
  "darcy-decline-result": DARCY_DECLINE_RESULT,
};
