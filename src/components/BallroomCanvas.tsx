import { useEffect, useRef } from "react";
import { drawBallroom, type BallroomFigure } from "@/render/ballroom";
import type { Point } from "@/systems/movement";

export type PlayerFigure = Point & { facing: number; moving: boolean };

type Props = {
  player: PlayerFigure;
  npcs: BallroomFigure[];
};

const ISO_ANGLE = Math.PI / 6;
const ZOOM_MIN = 0.72;
const ZOOM_MAX = 1.42;

export default function BallroomCanvas({ player, npcs }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const zoomRef = useRef(1);
  const propsRef = useRef({ player, npcs });
  propsRef.current = { player, npcs };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomRef.current = Math.min(
        ZOOM_MAX,
        Math.max(ZOOM_MIN, zoomRef.current - e.deltaY * 0.001),
      );
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });

    let raf = 0;
    const draw = () => {
      const { player: p, npcs: n } = propsRef.current;
      const isPhone = width < 700;
      const baseScale = (isPhone ? 30 : 38) * zoomRef.current;
      const figScale = Math.max(isPhone ? 1.05 : 0.9, baseScale / 34);

      const cx = width / 2 - (p.x - p.y) * Math.cos(ISO_ANGLE) * baseScale;
      const cy = height * 0.5 - (p.x + p.y) * Math.sin(ISO_ANGLE) * baseScale * 0.58;

      const project = (x: number, y: number, z = 0) => ({
        x: cx + (x - y) * Math.cos(ISO_ANGLE) * baseScale,
        y: cy + (x + y) * Math.sin(ISO_ANGLE) * baseScale * 0.58 - z * baseScale * 0.9,
      });

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const figures: BallroomFigure[] = [
        ...n,
        {
          id: "elizabeth",
          x: p.x,
          y: p.y,
          kind: "lady",
          color: "#c98b6a",
          face: p.facing,
          moving: p.moving,
          label: "Elizabeth",
        },
      ];

      drawBallroom({
        ctx,
        w: width,
        h: height,
        project,
        scale: baseScale,
        figScale,
        isPhone,
        figures,
        time: performance.now() / 1000,
      });

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      canvas.removeEventListener("wheel", onWheel);
    };
  }, []);

  return <canvas ref={canvasRef} className="block h-full w-full touch-none" />;
}
