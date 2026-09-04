import type { LocalizedText } from "@/data/characters";

export type LogEntry = { time: string; text: LocalizedText; voiceId?: string };

export function composeEveningNote(input: {
  collins: "done";
  darcy: "accepted" | "declined" | null;
}): LocalizedText {
  if (input.darcy === "accepted") {
    return {
      en: "She had refused him, in her heart, a hundred times before he ever asked; and yet, when the moment came, she found she had said yes.",
      ja: "心の中では、尋ねられるより前に何度も断っていたはずだった。けれどその瞬間、気づけば「はい」と答えていた。",
    };
  }
  if (input.darcy === "declined") {
    return {
      en: "She had declined him, and now must sit out the set, since the custom of the room allowed her no other partner for it.",
      ja: "彼女は断った。この場の作法では、その一曲は誰とも踊れぬまま、座って過ごすほかなかった。",
    };
  }
  return {
    en: "Mr. Collins had secured her hand for the first two dances the evening before — whether she liked it or not.",
    ja: "コリンズ氏は前夜のうちに、最初の二曲の相手を確保していた——彼女の意向にかかわらず。",
  };
}
