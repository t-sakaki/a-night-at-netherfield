import { drawFloor, drawSconces, fillQuad, paintFigures, type Bounds, type Project, type RoomSceneInput } from "@/render/shared";

export type { RoomFigure, RoomSceneInput } from "@/render/shared";

export const BALLROOM_BOUNDS: Bounds = { minX: -9, maxX: 9, minY: -5, maxY: 5 };
/** Where the ballroom's own doorway cutouts sit, for room-transition triggers. */
export const CARD_ROOM_DOORWAY = { minY: -4, maxY: -2 };
export const SUPPER_ROOM_DOORWAY = { minY: 2, maxY: 4 };

const WALL_HEIGHT = 3.4;
const FLOOR_COLORS: [string, string] = ["#5e3d26", "#71472c"];
const SCONCE_X_OFFSETS = [-6, -2.5, 0.5, 4, 7.5];
const CHANDELIER_POS = { x: 0, y: -1.2, z: WALL_HEIGHT * 0.82 };

export function drawBallroom(input: RoomSceneInput): void {
  const { ctx, w, h, project, scale, figScale, isPhone, figures, time } = input;

  ctx.fillStyle = "#2e2015";
  ctx.fillRect(0, 0, w, h);

  drawWalls(ctx, project);
  drawFloor(ctx, project, BALLROOM_BOUNDS, FLOOR_COLORS);
  drawChandelierGlow(ctx, project, scale, time);
  drawSconces(
    ctx,
    project,
    scale,
    time,
    SCONCE_X_OFFSETS.map((x) => ({ x, y: BALLROOM_BOUNDS.minY, z: 2.1 })),
  );
  paintFigures(ctx, project, figures, figScale, isPhone);
  drawChandelier(ctx, project, scale, time);
}

/** A warm pool of light on the floor beneath the chandelier, drawn before the figures so it sits under them. */
function drawChandelierGlow(
  ctx: CanvasRenderingContext2D,
  project: Project,
  scale: number,
  time: number,
): void {
  const flicker = 0.85 + 0.15 * Math.sin(time * 1.4);
  const floorPoint = project(CHANDELIER_POS.x, CHANDELIER_POS.y, 0);
  const r = 7.5 * scale * flicker;
  const pool = ctx.createRadialGradient(floorPoint.x, floorPoint.y, 0, floorPoint.x, floorPoint.y, r);
  pool.addColorStop(0, `rgba(255,224,160,${0.22 * flicker})`);
  pool.addColorStop(1, "rgba(255,224,160,0)");
  ctx.fillStyle = pool;
  ctx.beginPath();
  ctx.arc(floorPoint.x, floorPoint.y, r, 0, Math.PI * 2);
  ctx.fill();
}

/** A crystal chandelier hanging from the ceiling: gilt frame, glowing candle-tiers, and twinkling glints. */
function drawChandelier(
  ctx: CanvasRenderingContext2D,
  project: Project,
  scale: number,
  time: number,
): void {
  const { x, y, z } = CHANDELIER_POS;
  const top = project(x, y, z + 0.5);
  const hub = project(x, y, z);
  const s = scale / 34;

  // chain
  ctx.strokeStyle = "rgba(120,96,58,0.8)";
  ctx.lineWidth = 1.4 * s;
  ctx.beginPath();
  ctx.moveTo(top.x, top.y);
  ctx.lineTo(hub.x, hub.y);
  ctx.stroke();

  const flicker = 0.8 + 0.2 * Math.sin(time * 3.1);

  // outer glow behind the fixture
  const glowR = 70 * s * flicker;
  const glow = ctx.createRadialGradient(hub.x, hub.y, 0, hub.x, hub.y, glowR);
  glow.addColorStop(0, `rgba(255,232,178,${0.55 * flicker})`);
  glow.addColorStop(1, "rgba(255,232,178,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(hub.x, hub.y, glowR, 0, Math.PI * 2);
  ctx.fill();

  // tiers of arms with candle-lights, arranged in a ring
  const tiers = [
    { r: 32 * s, count: 8, drop: 6 * s },
    { r: 19 * s, count: 6, drop: -5 * s },
  ];
  for (const tier of tiers) {
    for (let i = 0; i < tier.count; i += 1) {
      const angle = (i / tier.count) * Math.PI * 2 + time * 0.05;
      const ax = hub.x + Math.cos(angle) * tier.r;
      const ay = hub.y + Math.sin(angle) * tier.r * 0.45 + tier.drop;

      ctx.strokeStyle = "rgba(196,162,95,0.85)";
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(hub.x, hub.y);
      ctx.lineTo(ax, ay);
      ctx.stroke();

      const bulbFlicker = 0.7 + 0.3 * Math.sin(time * 5 + i * 2.1);
      const bulbR = 3.4 * s * bulbFlicker;
      const bulb = ctx.createRadialGradient(ax, ay, 0, ax, ay, bulbR * 3);
      bulb.addColorStop(0, `rgba(255,245,214,${0.95 * bulbFlicker})`);
      bulb.addColorStop(0.4, `rgba(255,214,140,${0.5 * bulbFlicker})`);
      bulb.addColorStop(1, "rgba(255,214,140,0)");
      ctx.fillStyle = bulb;
      ctx.beginPath();
      ctx.arc(ax, ay, bulbR * 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(255,250,230,${0.9 * bulbFlicker})`;
      ctx.beginPath();
      ctx.arc(ax, ay, bulbR * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // gilt central hub
  ctx.fillStyle = "#caa25f";
  ctx.beginPath();
  ctx.ellipse(hub.x, hub.y, 8 * s, 4.6 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // twinkling crystal glints scattered through the fixture
  for (let i = 0; i < 20; i += 1) {
    const seed = i * 37.1;
    const twinkle = Math.sin(time * 4 + seed) * 0.5 + 0.5;
    if (twinkle < 0.7) continue;
    const gx = hub.x + Math.sin(seed) * 34 * s;
    const gy = hub.y + Math.cos(seed * 1.7) * 16 * s + 3 * s;
    ctx.fillStyle = `rgba(255,255,255,${(twinkle - 0.72) * 3.2})`;
    ctx.beginPath();
    ctx.arc(gx, gy, 0.9 * s, 0, Math.PI * 2);
    ctx.fill();
  }
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
    "#4a2e1e",
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
    "#66432a",
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
    "#3e2818",
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
