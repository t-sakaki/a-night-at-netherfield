import { useEffect, useRef } from "react";
import { drawBallroom } from "@/render/ballroom";
import { drawCardRoom } from "@/render/cardRoom";
import { drawSupperRoom } from "@/render/supperRoom";
import type { RoomFigure } from "@/render/shared";
import { stepToward } from "@/systems/movement";
import type { NpcTarget, PlayerFigure, RoomId } from "@/systems/room";

export type { NpcTarget, PlayerFigure, RoomId } from "@/systems/room";

type Props = {
  roomId: RoomId;
  player: PlayerFigure;
  npcTargets: NpcTarget[];
  onNpcArrived?: (id: string) => void;
};

const ISO_ANGLE = Math.PI / 6;
const ZOOM_MIN = 0.72;
const ZOOM_MAX = 1.42;
const NPC_SPEED = 2.4; // world units per second

const ROOM_DRAWERS = {
  ballroom: drawBallroom,
  "card-room": drawCardRoom,
  "supper-room": drawSupperRoom,
} as const;

export default function RoomCanvas({ roomId, player, npcTargets, onNpcArrived }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const zoomRef = useRef(1);
  const propsRef = useRef({ roomId, player, npcTargets, onNpcArrived });
  propsRef.current = { roomId, player, npcTargets, onNpcArrived };

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

    // Keyed by room so a figure re-spawns (rather than teleporting in) if
    // the same id reappears after the player has changed rooms.
    let npcState = new Map<string, { x: number; y: number; face: number; arrived: boolean }>();
    let lastRoomId = propsRef.current.roomId;
    let lastTick = performance.now();

    let raf = 0;
    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - lastTick) / 1000);
      lastTick = now;

      const { roomId: room, player: p, npcTargets: targets, onNpcArrived: onArrived } = propsRef.current;
      if (room !== lastRoomId) {
        npcState = new Map();
        lastRoomId = room;
      }

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

      const npcFigures: RoomFigure[] = targets.map((t) => {
        let s = npcState.get(t.id);
        if (!s) {
          const start = t.spawnAt ?? { x: t.x, y: t.y };
          s = { x: start.x, y: start.y, face: 0, arrived: false };
          npcState.set(t.id, s);
        }
        const { point, arrived } = stepToward(
          { x: s.x, y: s.y },
          { x: t.x, y: t.y },
          NPC_SPEED * dt,
        );
        if (point.x - s.x > 0.001) s.face = 1;
        else if (point.x - s.x < -0.001) s.face = -1;
        s.x = point.x;
        s.y = point.y;
        if (arrived && !s.arrived) {
          s.arrived = true;
          onArrived?.(t.id);
        } else if (!arrived) {
          s.arrived = false;
        }
        return {
          id: t.id,
          x: s.x,
          y: s.y,
          kind: t.kind,
          color: t.color,
          label: t.label,
          seated: t.seated,
          face: s.face,
          moving: t.forceMoving || !arrived,
        };
      });

      const figures: RoomFigure[] = [
        ...npcFigures,
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

      ROOM_DRAWERS[room]({
        ctx,
        w: width,
        h: height,
        project,
        scale: baseScale,
        figScale,
        isPhone,
        figures,
        time: now / 1000,
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
