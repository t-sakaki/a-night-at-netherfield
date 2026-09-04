export type Point = { x: number; y: number };

export function stepToward(
  current: Point,
  target: Point,
  maxStep: number,
): { point: Point; arrived: boolean } {
  const dx = target.x - current.x;
  const dy = target.y - current.y;
  const dist = Math.hypot(dx, dy);
  if (dist <= maxStep) {
    return { point: target, arrived: true };
  }
  const t = maxStep / dist;
  return {
    point: { x: current.x + dx * t, y: current.y + dy * t },
    arrived: false,
  };
}
