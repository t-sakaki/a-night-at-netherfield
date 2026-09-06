export type RoomFigure = {
  id: string;
  x: number;
  y: number;
  kind: "lady" | "gent";
  color: string;
  label?: string;
  face?: number; // -1 left, 0 forward, 1 right
  moving?: boolean;
  seated?: boolean;
};

export type Project = (x: number, y: number, z?: number) => { x: number; y: number };
export type Bounds = { minX: number; maxX: number; minY: number; maxY: number };

export type RoomSceneInput = {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  project: Project;
  scale: number;
  figScale: number;
  isPhone: boolean;
  figures: RoomFigure[];
  time: number; // seconds, drives sconce/fire flicker
};

export function fillQuad(
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

export function drawFloor(
  ctx: CanvasRenderingContext2D,
  project: Project,
  bounds: Bounds,
  colors: [string, string],
): void {
  const { minX, maxX, minY, maxY } = bounds;
  for (let gx = minX; gx < maxX; gx++) {
    for (let gy = minY; gy < maxY; gy++) {
      const p0 = project(gx, gy);
      const p1 = project(gx + 1, gy);
      const p2 = project(gx + 1, gy + 1);
      const p3 = project(gx, gy + 1);
      const parity = (gx + gy) % 2 === 0;
      fillQuad(ctx, [p0, p1, p2, p3], parity ? colors[0] : colors[1]);
    }
  }
}

export function drawSconces(
  ctx: CanvasRenderingContext2D,
  project: Project,
  scale: number,
  time: number,
  points: Array<{ x: number; y: number; z: number }>,
): void {
  for (const pt of points) {
    const p = project(pt.x, pt.y, pt.z);
    const flicker = 0.75 + 0.25 * Math.sin(time * 6 + pt.x * 3);
    const r = 26 * flicker * (scale / 34);
    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
    grad.addColorStop(0, `rgba(255,222,160,${0.65 * flicker})`);
    grad.addColorStop(1, "rgba(255,214,140,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function paintFigure(
  ctx: CanvasRenderingContext2D,
  project: Project,
  fig: RoomFigure,
  figScale: number,
  isPhone: boolean,
): void {
  const base = project(fig.x, fig.y, 0);
  const seatedScale = fig.seated ? 0.72 : 1;
  const bodyH = (fig.kind === "lady" ? 34 : 30) * figScale * seatedScale;
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

export function paintFigures(
  ctx: CanvasRenderingContext2D,
  project: Project,
  figures: RoomFigure[],
  figScale: number,
  isPhone: boolean,
): void {
  const sorted = [...figures].sort((a, b) => a.x + a.y - (b.x + b.y));
  for (const fig of sorted) {
    paintFigure(ctx, project, fig, figScale, isPhone);
  }
}
