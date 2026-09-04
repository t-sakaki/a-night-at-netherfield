export type LocalizedText = { en: string; ja: string };

export type CharacterId = "elizabeth" | "collins" | "darcy" | "charlotte" | "jane" | "bingley";
export type CharacterKind = "lady" | "gent";

export type CharacterTemplate = {
  id: CharacterId;
  name: LocalizedText;
  title: LocalizedText;
  kind: CharacterKind;
  color: string;
};

export const CHARACTERS: Record<CharacterId, CharacterTemplate> = {
  elizabeth: {
    id: "elizabeth",
    kind: "lady",
    color: "#c98b6a",
    name: { en: "Elizabeth Bennet", ja: "エリザベス・ベネット" },
    title: { en: "A guest of the Bingleys", ja: "ビングリー家の客" },
  },
  collins: {
    id: "collins",
    kind: "gent",
    color: "#7a8a5c",
    name: { en: "Mr. Collins", ja: "コリンズ氏" },
    title: { en: "Cousin, and heir to Longbourn", ja: "いとこ、ロングボーンの相続人" },
  },
  darcy: {
    id: "darcy",
    kind: "gent",
    color: "#3f4a63",
    name: { en: "Mr. Darcy", ja: "ダーシー氏" },
    title: { en: "Mr. Bingley's friend", ja: "ビングリー氏の友人" },
  },
  charlotte: {
    id: "charlotte",
    kind: "lady",
    color: "#9a7f96",
    name: { en: "Charlotte Lucas", ja: "シャーロット・ルーカス" },
    title: { en: "Elizabeth's particular friend", ja: "エリザベスの親友" },
  },
  jane: {
    id: "jane",
    kind: "lady",
    color: "#d9c08a",
    name: { en: "Jane Bennet", ja: "ジェイン・ベネット" },
    title: { en: "Elizabeth's elder sister", ja: "エリザベスの姉" },
  },
  bingley: {
    id: "bingley",
    kind: "gent",
    color: "#a85f4a",
    name: { en: "Mr. Bingley", ja: "ビングリー氏" },
    title: { en: "Master of Netherfield", ja: "ネザーフィールドの主" },
  },
};
