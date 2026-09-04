import type { LocalizedText } from "@/data/characters";

export type InterludeLine = {
  id: string;
  speaker: "collins" | "elizabeth" | "narration";
  text: LocalizedText;
  holdMs: number;
};

/**
 * In the novel, Mr. Collins secures Elizabeth for "the two first" dances
 * the evening before the ball. This interlude dramatizes his reminding her
 * of it at Netherfield itself — there is no real choice offered here.
 */
export const COLLINS_INTERLUDE: InterludeLine[] = [
  {
    id: "collins-approach",
    speaker: "narration",
    holdMs: 2200,
    text: {
      en: "Mr. Collins approaches, bowing low.",
      ja: "コリンズ氏が深々とお辞儀をしながら近づいてくる。",
    },
  },
  {
    id: "collins-secured",
    speaker: "collins",
    holdMs: 3400,
    text: {
      en: "“You will remember, Cousin Elizabeth, that I have already had the honour of engaging you for the two first dances.”",
      ja: "「覚えておいででしょう、いとこのエリザベス。すでに最初の二曲を踊る栄誉をいただいております」",
    },
  },
  {
    id: "elizabeth-forgotten",
    speaker: "elizabeth",
    holdMs: 2600,
    text: {
      en: "She had, in fact, forgotten nothing of the sort — and wished she had.",
      ja: "実のところ、彼女はそれを何ひとつ忘れてなどいなかった——むしろ忘れていたかった。",
    },
  },
  {
    id: "collins-flatter",
    speaker: "collins",
    holdMs: 3000,
    text: {
      en: "“I flatter myself the honour will not be lost on those who observe us.”",
      ja: "「この栄誉が、見る者の目に留まらぬはずはないと自負しております」",
    },
  },
  {
    id: "collins-offers-arm",
    speaker: "narration",
    holdMs: 2400,
    text: {
      en: "He offers his arm. There is, this once, no possibility of refusal.",
      ja: "彼が腕を差し出す。今この時ばかりは、断る術などなかった。",
    },
  },
];
