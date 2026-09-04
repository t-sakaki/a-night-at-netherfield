import type { LocalizedText } from "@/data/characters";

export const MINGLING_MS = 15_000;
export const DARCY_RESPONSE_MS = 8_000;

/**
 * Darcy's surprise mid-ball request — the slice's one real decision point.
 * In the novel Elizabeth accepts almost before deciding to; a timed prompt
 * is how that "said yes before she meant to" quality becomes a mechanic.
 */
export const DARCY_ASK: LocalizedText = {
  en: "“Miss Bennet, I have been meaning to ask — might I have the next dance?”",
  ja: "「ベネットさん、先ほどからお伺いしようと思っておりました——次の一曲、お相手願えますか」",
};

export const DARCY_ACCEPT_RESULT: LocalizedText = {
  en: "The words were out before she had quite decided to say them.",
  ja: "決めるより先に、その言葉は口をついて出ていた。",
};

export const DARCY_DECLINE_RESULT: LocalizedText = {
  en: "She declined, as steadily as she could manage, and watched him bow and withdraw.",
  ja: "できる限り落ち着いた声で、彼女は断った。彼は一礼し、去っていった。",
};
