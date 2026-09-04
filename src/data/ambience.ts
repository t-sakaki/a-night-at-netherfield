import type { LocalizedText } from "@/data/characters";
import type { NpcTarget } from "@/systems/room";

export type Hotspot = { id: string; x: number; y: number; radius: number; text: LocalizedText };

/** Charlotte Lucas stands near the card-room doorway for the whole evening. */
export const CHARLOTTE_POSITION = { x: -5.5, y: -3.2 };

export const CHARLOTTE_HOTSPOT: Hotspot = {
  id: "charlotte-chance",
  ...CHARLOTTE_POSITION,
  radius: 1.6,
  text: {
    en: "“Happiness in marriage is entirely a matter of chance,” Charlotte says, watching the dancers. “I begin to think you agree with me more than you let on.”",
    ja: "「結婚の幸福なんて、まったくの運次第よ」シャーロットは踊る人々を眺めながら言う。「あなたも、口では否定しても本当はそう思っているんじゃなくて?」",
  },
};

export const CARD_ROOM_HOTSPOT: Hotspot = {
  id: "card-room-whist",
  x: 0,
  y: 0,
  radius: 2.6,
  text: {
    en: "The whist players barely look up. Away from the noise of the ballroom, this corner of the evening moves at its own unhurried pace.",
    ja: "ホイストに興じる面々は顔も上げない。舞踏室の喧騒から離れたこの一角だけは、夜がゆっくりと流れているようだった。",
  },
};

export const CARD_ROOM_NPCS: NpcTarget[] = [
  { id: "card-guest-1", kind: "gent", color: "#5a4a3a", x: -2.5, y: -1.9, seated: true },
  { id: "card-guest-2", kind: "gent", color: "#4a5a4a", x: 2.2, y: 2.0, seated: true },
];

/** Where Jane and Bingley dance, a little apart from the rest of the floor. */
export const JANE_BINGLEY_POSITION = { x: 4.5, y: -1.8 };

export const JANE_BINGLEY_GOSSIP: { id: string; text: LocalizedText } = {
  id: "jane-bingley-twice",
  text: {
    en: "Your sister has danced with Mr. Bingley twice now. In a room this size, that is not a thing anyone fails to notice.",
    ja: "お姉さまはビングリーさんと、もう二度も踊っていらっしゃるわ。これほどの人数の中では、誰も気づかずにいられないでしょうね。",
  },
};
