import { drawFloor, drawSconces, fillQuad, paintFigures, type Bounds, type RoomSceneInput } from "@/render/shared";

export const CARD_ROOM_BOUNDS: Bounds = { minX: -6, maxX: 6, minY: -4, maxY: 4 };
/** Doorway back to the ballroom, on this room's own right-hand wall. */
export const BALLROOM_DOORWAY = { minY: -1, maxY: 1 };

const WALL_HEIGHT = 3.2;
const FLOOR_COLORS: [string, string] = ["#3a2116", "#472a1c"];
const TABLE_POINTS = [
  { x: -2.5, y: -1.5 },
  { x: 2.2, y: 1.6 },
];

export function drawCardRoom(input: RoomSceneInput): void {
  const { ctx, w, h, project, scale, figScale, isPhone, figures, time } = input;
  const { minX, maxX, minY, maxY } = CARD_ROOM_BOUNDS;

  ctx.fillStyle = "#160f0a";
  ctx.fillRect(0, 0, w, h);

  fillQuad(
    ctx,
    [project(minX, minY, 0), project(maxX, minY, 0), project(maxX, minY, WALL_HEIGHT), project(minX, minY, WALL_HEIGHT)],
    "#332015",
  );
  // fireplace
  fillQuad(
    ctx,
    [project(-1.2, minY, 0), project(1.2, minY, 0), project(1.2, minY, WALL_HEIGHT * 0.55), project(-1.2, minY, WALL_HEIGHT * 0.55)],
    "#1a1210",
  );

  fillQuad(
    ctx,
    [project(minX, minY, 0), project(minX, maxY, 0), project(minX, maxY, WALL_HEIGHT), project(minX, minY, WALL_HEIGHT)],
    "#241811",
  );

  fillQuad(
    ctx,
    [project(maxX, minY, 0), project(maxX, maxY, 0), project(maxX, maxY, WALL_HEIGHT), project(maxX, minY, WALL_HEIGHT)],
    "#241811",
  );
  // doorway back to the ballroom
  fillQuad(
    ctx,
    [
      project(maxX, BALLROOM_DOORWAY.minY, 0),
      project(maxX, BALLROOM_DOORWAY.maxY, 0),
      project(maxX, BALLROOM_DOORWAY.maxY, WALL_HEIGHT * 0.7),
      project(maxX, BALLROOM_DOORWAY.minY, WALL_HEIGHT * 0.7),
    ],
    "#0f0906",
  );

  drawFloor(ctx, project, CARD_ROOM_BOUNDS, FLOOR_COLORS);

  // fireplace glow
  const fireGlow = project(0, minY, 1);
  const flicker = 0.7 + 0.3 * Math.sin(time * 9);
  const r = 34 * flicker * (scale / 34);
  const grad = ctx.createRadialGradient(fireGlow.x, fireGlow.y, 0, fireGlow.x, fireGlow.y, r);
  grad.addColorStop(0, `rgba(255,140,70,${0.55 * flicker})`);
  grad.addColorStop(1, "rgba(255,140,70,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(fireGlow.x, fireGlow.y, r, 0, Math.PI * 2);
  ctx.fill();

  drawSconces(
    ctx,
    project,
    scale,
    time,
    [
      { x: minX + 1.5, y: minY, z: 2 },
      { x: maxX - 1.5, y: minY, z: 2 },
    ],
  );

  for (const t of TABLE_POINTS) {
    const p0 = project(t.x - 1, t.y - 1);
    const p1 = project(t.x + 1, t.y - 1);
    const p2 = project(t.x + 1, t.y + 1);
    const p3 = project(t.x - 1, t.y + 1);
    fillQuad(ctx, [p0, p1, p2, p3], "#1f4a33");
  }

  paintFigures(ctx, project, figures, figScale, isPhone);
}
