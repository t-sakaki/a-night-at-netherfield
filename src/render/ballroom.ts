export type BallroomFigure = {
  id: string;
  x: number;
  y: number;
  kind: "lady" | "gent";
  color: string;
  label?: string;
  face?: number; // -1 left, 0 forward, 1 right
  moving?: boolean;
};

export type Project = (x: number, y: number, z?: number) => { x: number; y: number };

export type BallroomSceneInput = {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  project: Project;
  scale: number;
  figScale: number;
  isPhone: boolean;
  figures: BallroomFigure[];
  time: number; // seconds, drives sconce flicker
};

export const BALLROOM_BOUNDS = { minX: -9, maxX: 9, minY: -5, maxY: 5 };

const WALL_HEIGHT = 3.4;
const FLOOR_COLORS: [string, string] = ["#4a2f1d", "#5b3a24"];

export function drawBallroom(input: BallroomSceneInput): void {
  const { ctx, w, h, project, scale, figScale, isPhone, figures, time } = input;

  ctx.fillStyle = "#1c130d";
  ctx.fillRect(0, 0, w, h);

  drawWalls(ctx, project);
  drawFloor(ctx, project);
  drawSconces(ctx, project, scale, time);

  const sorted = [...figures].sort((a, b) => a.x + a.y - (b.x + b.y));
  for (const fig of sorted) {
    paintFigure(ctx, project, fig, figScale, isPhone);
  }
}

function fillQuad(
  ctx: CanvasRenderingContext2D,
  pts: Array<{ x: number; y: number }>,
  color: string,
): void {
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
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

  // left wall, toward the card-room
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
      project(minX, minY + 1, 0),
      project(minX, minY + 3, 0),
      project(minX, minY + 3, WALL_HEIGHT * 0.7),
      project(minX, minY + 1, WALL_HEIGHT * 0.7),
    ],
    "#150d09",
  );

  // right wall, toward the supper-room
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
      project(maxX, maxY - 3, 0),
      project(maxX, maxY - 1, 0),
      project(maxX, maxY - 1, WALL_HEIGHT * 0.7),
      project(maxX, maxY - 3, WALL_HEIGHT * 0.7),
    ],
    "#150d09",
  );
}

function drawFloor(ctx: CanvasRenderingContext2D, project: Project): void {
  const { minX, maxX, minY, maxY } = BALLROOM_BOUNDS;
  for (let gx = minX; gx < maxX; gx++) {
    for (let gy = minY; gy < maxY; gy++) {
      const p0 = project(gx, gy);
      const p1 = project(gx + 1, gy);
      const p2 = project(gx + 1, gy + 1);
      const p3 = project(gx, gy + 1);
      const parity = (gx + gy) % 2 === 0;
      fillQuad(ctx, [p0, p1, p2, p3], parity ? FLOOR_COLORS[0] : FLOOR_COLORS[1]);
    }
  }
}

const SCONCE_X_OFFSETS = [-6, -2.5, 0.5, 4, 7.5];

function drawSconces(
  ctx: CanvasRenderingContext2D,
  project: Project,
  scale: number,
  time: number,
): void {
  const { minY } = BALLROOM_BOUNDS;
  for (const x of SCONCE_X_OFFSETS) {
    const p = project(x, minY, 2.1);
    const flicker = 0.75 + 0.25 * Math.sin(time * 6 + x * 3);
    const r = 20 * flicker * (scale / 34);
    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
    grad.addColorStop(0, `rgba(255,214,140,${0.5 * flicker})`);
    grad.addColorStop(1, "rgba(255,214,140,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function paintFigure(
  ctx: CanvasRenderingContext2D,
  project: Project,
  fig: BallroomFigure,
  figScale: number,
  isPhone: boolean,
): void {
  const base = project(fig.x, fig.y, 0);
  const bodyH = (fig.kind === "lady" ? 34 : 30) * figScale;
  const bob = fig.moving ? Math.sin(performance.now() / 130) * 1.5 : 0;
  const face = fig.face ?? 0;

  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(base.x, base.y + 2, 9 * figScale, 3.5 * figScale, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = fig.color;
  ctx.beginPath();
  if (fig.kind === "lady") {
    ctx.moveTo(base.x, base.y + bob);
    ctx.quadraticCurveTo(
      base.x - 11 * figScale,
      base.y - bodyH * 0.15 + bob,
      base.x - 6 * figScale,
      base.y - bodyH * 0.75 + bob,
    );
    ctx.quadraticCurveTo(base.x, base.y - bodyH + bob, base.x + 6 * figScale, base.y - bodyH * 0.75 + bob);
    ctx.quadraticCurveTo(base.x + 11 * figScale, base.y - bodyH * 0.15 + bob, base.x, base.y + bob);
  } else {
    ctx.moveTo(base.x - 5 * figScale, base.y + bob);
    ctx.lineTo(base.x - 4 * figScale, base.y - bodyH + bob);
    ctx.lineTo(base.x + 4 * figScale, base.y - bodyH + bob);
    ctx.lineTo(base.x + 5 * figScale, base.y + bob);
  }
  ctx.closePath();
  ctx.fill();

  const headCenter = {
    x: base.x + face * 2 * figScale,
    y: base.y - bodyH - 6 * figScale + bob,
  };
  ctx.fillStyle = "#e9c9a3";
  ctx.beginPath();
  ctx.arc(headCenter.x, headCenter.y, 4.4 * figScale, 0, Math.PI * 2);
  ctx.fill();

  if (fig.label) {
    ctx.font = `${isPhone ? 10 : 11}px Georgia, serif`;
    ctx.fillStyle = "rgba(242,233,216,0.9)";
    ctx.textAlign = "center";
    ctx.fillText(fig.label, headCenter.x, headCenter.y - 10 * figScale);
  }
}
