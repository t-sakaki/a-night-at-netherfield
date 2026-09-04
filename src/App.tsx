import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import BallroomCanvas, { type PlayerFigure } from "@/components/BallroomCanvas";
import { BALLROOM_BOUNDS } from "@/render/ballroom";

const PLAYER_SPEED = 3.2; // world units per second
const PLAYER_MARGIN = 0.4;

export default function App() {
  const [player, setPlayer] = useState<PlayerFigure>({ x: 0, y: 3, facing: 0, moving: false });
  const playerRef = useRef(player);
  const keysRef = useRef<Record<string, boolean>>({});
  const joystickRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const k = keysRef.current;
      let dx = (k["d"] || k["arrowright"] ? 1 : 0) - (k["a"] || k["arrowleft"] ? 1 : 0);
      let dy = (k["s"] || k["arrowdown"] ? 1 : 0) - (k["w"] || k["arrowup"] ? 1 : 0);
      dx += joystickRef.current.x;
      dy += joystickRef.current.y;

      const mag = Math.hypot(dx, dy);
      if (mag > 0.05) {
        dx /= mag;
        dy /= mag;
        const current = playerRef.current;
        playerRef.current = {
          x: clamp(
            current.x + dx * PLAYER_SPEED * dt,
            BALLROOM_BOUNDS.minX + PLAYER_MARGIN,
            BALLROOM_BOUNDS.maxX - PLAYER_MARGIN,
          ),
          y: clamp(
            current.y + dy * PLAYER_SPEED * dt,
            BALLROOM_BOUNDS.minY + PLAYER_MARGIN,
            BALLROOM_BOUNDS.maxY - PLAYER_MARGIN,
          ),
          facing: dx === 0 ? current.facing : Math.sign(dx),
          moving: true,
        };
        setPlayer(playerRef.current);
      } else if (playerRef.current.moving) {
        playerRef.current = { ...playerRef.current, moving: false };
        setPlayer(playerRef.current);
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const onJoystickMove = useCallback((vec: { x: number; y: number }) => {
    joystickRef.current = vec;
  }, []);

  return (
    <div className="relative h-full w-full">
      <BallroomCanvas player={player} npcs={[]} />
      <TouchJoystick onMove={onJoystickMove} />
    </div>
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

const JOYSTICK_RADIUS = 44;

function TouchJoystick({ onMove }: { onMove: (vec: { x: number; y: number }) => void }) {
  const activeRef = useRef<number | null>(null);
  const originRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const updateFromPoint = (clientX: number, clientY: number) => {
    const dx = clientX - originRef.current.x;
    const dy = clientY - originRef.current.y;
    const dist = Math.min(JOYSTICK_RADIUS, Math.hypot(dx, dy));
    const angle = Math.atan2(dy, dx);
    const kx = Math.cos(angle) * dist;
    const ky = Math.sin(angle) * dist;
    setKnob({ x: kx, y: ky });
    onMove({ x: kx / JOYSTICK_RADIUS, y: ky / JOYSTICK_RADIUS });
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    activeRef.current = e.pointerId;
    originRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromPoint(e.clientX, e.clientY);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (activeRef.current !== e.pointerId) return;
    updateFromPoint(e.clientX, e.clientY);
  };
  const endTouch = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (activeRef.current !== e.pointerId) return;
    activeRef.current = null;
    setKnob({ x: 0, y: 0 });
    onMove({ x: 0, y: 0 });
  };

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endTouch}
      onPointerCancel={endTouch}
      className="absolute bottom-6 left-6 h-28 w-28 touch-none rounded-full border border-white/20 bg-black/20 md:hidden"
    >
      <div
        className="absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40"
        style={{ left: `calc(50% + ${knob.x}px)`, top: `calc(50% + ${knob.y}px)` }}
      />
    </div>
  );
}
