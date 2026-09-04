import type { InterludeLine } from "@/narrative/interlude";

/**
 * Ch. 18: Mrs. Bennet, seated near Lady Lucas at supper, speculates loudly
 * — and audibly to Mr. Darcy — that Jane's marriage to Bingley is all but
 * settled. Triggered once, on first entering the supper-room.
 */
export const MRS_BENNET_INTERLUDE: InterludeLine[] = [
  {
    id: "supper-scene-set",
    speaker: "narration",
    holdMs: 2200,
    text: {
      en: "Supper is laid, and the room hums with easy, unguarded talk.",
      ja: "夕食の支度が整い、部屋には遠慮のないおしゃべりが満ちている。",
    },
  },
  {
    id: "mrs-bennet-jane",
    speaker: "mrs-bennet",
    holdMs: 3400,
    text: {
      en: "“My dear Lady Lucas — only think, Jane married to Mr. Bingley! I always said how it would be.”",
      ja: "「ねえ、ルーカス夫人——考えてもごらんなさい、ジェインがビングリーさんと!わたくし、ずっとそうなると思っておりましたのよ」",
    },
  },
  {
    id: "elizabeth-darcy-hears",
    speaker: "elizabeth",
    holdMs: 2800,
    text: {
      en: "Elizabeth catches Mr. Darcy's eye across the table. He has heard every word.",
      ja: "エリザベスはテーブルの向こうでダーシー氏と目が合う。一言残らず聞かれていた。",
    },
  },
  {
    id: "mrs-bennet-sisters",
    speaker: "mrs-bennet",
    holdMs: 3400,
    text: {
      en: "“And once Jane is so nobly settled, it must surely throw her sisters in the way of other rich men!”",
      ja: "「ジェインがそんな立派な家に嫁げば、きっと妹たちにもお金持ちの殿方との縁が回ってまいりますわ!」",
    },
  },
  {
    id: "elizabeth-mortified",
    speaker: "elizabeth",
    holdMs: 2600,
    text: {
      en: "She wished, with all her heart, that the floor might open and swallow her whole.",
      ja: "彼女は心の底から、床が割れて自分を呑み込んでくれればいいのにと願った。",
    },
  },
];
