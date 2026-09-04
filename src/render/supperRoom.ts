import { drawFloor, drawSconces, fillQuad, paintFigures, type Bounds, type RoomSceneInput } from "@/render/shared";

export const SUPPER_ROOM_BOUNDS: Bounds = { minX: -7, maxX: 7, minY: -4, maxY: 4 };
/** Doorway back to the ballroom, on this room's own left-hand wall. */
export const BALLROOM_DOORWAY = { minY: -1, maxY: 1 };

const WALL_HEIGHT = 3.2;
const FLOOR_COLORS: [string, string] = ["#3f2b1c", "#4c3423"];

export function drawSupperRoom(input: RoomSceneInput): void {
  const { ctx, w, h, project, scale, figScale, isPhone, figures, time } = input;
  const { minX, maxX, minY, maxY } = SUPPER_ROOM_BOUNDS;

  ctx.fillStyle = "#1a120b";
  ctx.fillRect(0, 0, w, h);

  fillQuad(
    ctx,
    [project(minX, minY, 0), project(maxX, minY, 0), project(maxX, minY, WALL_HEIGHT), project(minX, minY, WALL_HEIGHT)],
    "#3a2618",
  );

  fillQuad(
    ctx,
    [project(minX, minY, 0), project(minX, maxY, 0), project(minX, maxY, WALL_HEIGHT), project(minX, minY, WALL_HEIGHT)],
    "#2a1c12",
  );
  // doorway back to the ballroom
  fillQuad(
    ctx,
    [
      project(minX, BALLROOM_DOORWAY.minY, 0),
      project(minX, BALLROOM_DOORWAY.maxY, 0),
      project(minX, BALLROOM_DOORWAY.maxY, WALL_HEIGHT * 0.7),
      project(minX, BALLROOM_DOORWAY.minY, WALL_HEIGHT * 0.7),
    ],
    "#0f0906",
  );

  fillQuad(
    ctx,
    [project(maxX, minY, 0), project(maxX, maxY, 0), project(maxX, maxY, WALL_HEIGHT), project(maxX, minY, WALL_HEIGHT)],
    "#2a1c12",
  );

  drawFloor(ctx, project, SUPPER_ROOM_BOUNDS, FLOOR_COLORS);
  drawSconces(
    ctx,
    project,
    scale,
    time,
    [
      { x: minX + 1.5, y: minY, z: 2 },
      { x: 0, y: minY, z: 2 },
      { x: maxX - 1.5, y: minY, z: 2 },
    ],
  );

  // the long supper table, laid with white linen
  const p0 = project(-4, -0.9);
  const p1 = project(4, -0.9);
  const p2 = project(4, 0.9);
  const p3 = project(-4, 0.9);
  fillQuad(ctx, [p0, p1, p2, p3], "#e9e2d3");
  for (const x of [-2.6, -0.9, 0.9, 2.6]) {
    const c0 = project(x - 0.35, -0.7, 0.55);
    const c1 = project(x + 0.35, -0.7, 0.55);
    const c2 = project(x + 0.35, 0.7, 0.55);
    const c3 = project(x - 0.35, 0.7, 0.55);
    fillQuad(ctx, [c0, c1, c2, c3], "#c99b4a");
  }

  paintFigures(ctx, project, figures, figScale, isPhone);
}
