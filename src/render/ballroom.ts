import { drawFloor, drawSconces, fillQuad, paintFigures, type Bounds, type Project, type RoomSceneInput } from "@/render/shared";

export type { RoomFigure, RoomSceneInput } from "@/render/shared";

export const BALLROOM_BOUNDS: Bounds = { minX: -9, maxX: 9, minY: -5, maxY: 5 };
/** Where the ballroom's own doorway cutouts sit, for room-transition triggers. */
export const CARD_ROOM_DOORWAY = { minY: -4, maxY: -2 };
export const SUPPER_ROOM_DOORWAY = { minY: 2, maxY: 4 };

const WALL_HEIGHT = 3.4;
const FLOOR_COLORS: [string, string] = ["#4a2f1d", "#5b3a24"];
const SCONCE_X_OFFSETS = [-6, -2.5, 0.5, 4, 7.5];

export function drawBallroom(input: RoomSceneInput): void {
  const { ctx, w, h, project, scale, figScale, isPhone, figures, time } = input;

  ctx.fillStyle = "#1c130d";
  ctx.fillRect(0, 0, w, h);

  drawWalls(ctx, project);
  drawFloor(ctx, project, BALLROOM_BOUNDS, FLOOR_COLORS);
  drawSconces(
    ctx,
    project,
    scale,
    time,
    SCONCE_X_OFFSETS.map((x) => ({ x, y: BALLROOM_BOUNDS.minY, z: 2.1 })),
  );
  paintFigures(ctx, project, figures, figScale, isPhone);
}

function drawWalls(ctx: CanvasRenderingContext2D, project: Project): void {
  const { minX, maxX, minY, maxY } = BALLROOM_BOUNDS;

  fillQuad(
    ctx,
    [
      project(minX, minY, 0),
      project(maxX, minY, 0),
      project(maxX, minY, WALL_HEIGHT),
      project(minX, minY, WALL_HEIGHT),
    ],
    "#3a2418",
  );

  // musicians' gallery: a raised strip across the upper back wall
  fillQuad(
    ctx,
    [
      project(minX + 2, minY, WALL_HEIGHT * 0.55),
      project(maxX - 2, minY, WALL_HEIGHT * 0.55),
      project(maxX - 2, minY, WALL_HEIGHT * 0.85),
      project(minX + 2, minY, WALL_HEIGHT * 0.85),
    ],
    "#4d3220",
  );

  // left wall, doorway to the card-room
  fillQuad(
    ctx,
    [
      project(minX, minY, 0),
      project(minX, maxY, 0),
      project(minX, maxY, WALL_HEIGHT),
      project(minX, minY, WALL_HEIGHT),
    ],
    "#2f1e14",
  );
  fillQuad(
    ctx,
    [
      project(minX, CARD_ROOM_DOORWAY.minY, 0),
      project(minX, CARD_ROOM_DOORWAY.maxY, 0),
      project(minX, CARD_ROOM_DOORWAY.maxY, WALL_HEIGHT * 0.7),
      project(minX, CARD_ROOM_DOORWAY.minY, WALL_HEIGHT * 0.7),
    ],
    "#150d09",
  );

  // right wall, doorway to the supper-room
  fillQuad(
    ctx,
    [
      project(maxX, minY, 0),
      project(maxX, maxY, 0),
      project(maxX, maxY, WALL_HEIGHT),
      project(maxX, minY, WALL_HEIGHT),
    ],
    "#2f1e14",
  );
  fillQuad(
    ctx,
    [
      project(maxX, SUPPER_ROOM_DOORWAY.minY, 0),
      project(maxX, SUPPER_ROOM_DOORWAY.maxY, 0),
      project(maxX, SUPPER_ROOM_DOORWAY.maxY, WALL_HEIGHT * 0.7),
      project(maxX, SUPPER_ROOM_DOORWAY.minY, WALL_HEIGHT * 0.7),
    ],
    "#150d09",
  );
}
