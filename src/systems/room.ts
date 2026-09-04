import type { Point } from "@/systems/movement";

/**
 * Pure game-state types shared between App.tsx and data files (e.g.
 * src/data/ambience.ts). Deliberately DOM-free -- unlike src/render/shared.ts,
 * this module is reachable from scripts/generate-vo.ts (run under Node via
 * tsx), which has no `lib: ["DOM"]` and so can't resolve canvas types.
 */
export type RoomId = "ballroom" | "card-room" | "supper-room";

export type PlayerFigure = Point & { facing: number; moving: boolean };

export type NpcTarget = {
  id: string;
  x: number;
  y: number;
  kind: "lady" | "gent";
  color: string;
  label?: string;
  seated?: boolean;
  /** Keeps the idle sway/bob animation on even once the figure has arrived (e.g. a dancing pair that never "arrives" anywhere new). */
  forceMoving?: boolean;
  /** Starting position the first time this id appears; ignored afterwards. */
  spawnAt?: Point;
};
