import type { CharacterId, LocalizedText } from "@/data/characters";

export type DanceSetId = string;
export type PartnerId = CharacterId;
export type DanceRequestOutcome = "auto" | "accepted" | "declined";

export type DanceSet = { id: DanceSetId; index: number; label: LocalizedText };

export type DanceRecord = {
  setId: DanceSetId;
  partnerId: PartnerId | null;
  outcome: DanceRequestOutcome;
};

export type DanceObligation = { setId: DanceSetId; decliningPartnerId: PartnerId };

export const DANCE_SETS: DanceSet[] = [
  { id: "set-1", index: 0, label: { en: "The two first dances", ja: "最初の二曲" } },
  { id: "set-4", index: 3, label: { en: "The fourth dance", ja: "四曲目" } },
];

/**
 * Regency ballroom etiquette, encoded: accepting a partner commits you for
 * the whole set; declining one obligates you (by the custom of the room) to
 * sit out that same set rather than dance it with anyone else; dancing
 * twice with one partner in an evening was read as a public sign of
 * particular interest.
 */
export class DanceSystem {
  history: DanceRecord[] = [];
  private obligations: DanceObligation[] = [];

  reset(): void {
    this.history = [];
    this.obligations = [];
  }

  /** Collins-style: secured in advance, no real choice at the ball itself. */
  recordAuto(setId: DanceSetId, partnerId: PartnerId): DanceRecord {
    const record: DanceRecord = { setId, partnerId, outcome: "auto" };
    this.history.push(record);
    return record;
  }

  /** Darcy-style: a real accept/decline made in the moment. */
  recordDecision(
    setId: DanceSetId,
    partnerId: PartnerId,
    decision: "accept" | "decline",
  ): DanceRecord {
    if (decision === "decline") {
      this.obligations.push({ setId, decliningPartnerId: partnerId });
      const record: DanceRecord = { setId, partnerId: null, outcome: "declined" };
      this.history.push(record);
      return record;
    }
    const record: DanceRecord = { setId, partnerId, outcome: "accepted" };
    this.history.push(record);
    return record;
  }

  isObligatedToSitOut(setId: DanceSetId): boolean {
    return this.obligations.some((o) => o.setId === setId);
  }

  dancedTwiceWith(partnerId: PartnerId): boolean {
    return (
      this.history.filter((r) => r.partnerId === partnerId && r.outcome !== "declined")
        .length >= 2
    );
  }
}
