import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { AudioManager } from "@/audio/AudioManager";
import { VoiceManager } from "@/audio/VoiceManager";
import RoomCanvas, { type NpcTarget, type PlayerFigure, type RoomId } from "@/components/RoomCanvas";
import DanceRequestPrompt from "@/components/DanceRequestPrompt";
import InterludeOverlay from "@/components/InterludeOverlay";
import TitleScreen from "@/components/TitleScreen";
import {
  CARD_ROOM_HOTSPOT,
  CARD_ROOM_NPCS,
  CHARLOTTE_HOTSPOT,
  CHARLOTTE_POSITION,
  JANE_BINGLEY_GOSSIP,
  JANE_BINGLEY_POSITION,
  type Hotspot,
} from "@/data/ambience";
import { CHARACTERS, type LocalizedText } from "@/data/characters";
import { COLLINS_INTERLUDE, type InterludeLine } from "@/data/collinsInterlude";
import {
  DARCY_ACCEPT_RESULT,
  DARCY_ASK,
  DARCY_DECLINE_RESULT,
  DARCY_RESPONSE_MS,
  MINGLING_MS,
} from "@/data/darcyRequest";
import { MRS_BENNET_INTERLUDE } from "@/data/mrsBennetInterlude";
import { composeEveningNote, type LogEntry } from "@/narrative/log";
import { BALLROOM_BOUNDS, CARD_ROOM_DOORWAY, SUPPER_ROOM_DOORWAY } from "@/render/ballroom";
import { CARD_ROOM_BOUNDS, BALLROOM_DOORWAY as CARD_TO_BALLROOM_DOORWAY } from "@/render/cardRoom";
import { SUPPER_ROOM_BOUNDS, BALLROOM_DOORWAY as SUPPER_TO_BALLROOM_DOORWAY } from "@/render/supperRoom";
import type { Point } from "@/systems/movement";
import { DanceSystem } from "@/systems/DanceSystem";

type Phase = "title" | "ball";
type Beat = "free-roam" | "collins-interlude" | "mingling" | "darcy-approach" | "darcy-prompt" | "resolved";

const PLAYER_SPEED = 3.2; // world units per second
const PLAYER_MARGIN = 0.4;
const DOORWAY_MARGIN = 0.55;
const COLLINS_TRIGGER_MINUTE = 2;
const MOVABLE_BEATS: Beat[] = ["free-roam", "mingling", "resolved"];

const ROOM_BOUNDS = {
  ballroom: BALLROOM_BOUNDS,
  "card-room": CARD_ROOM_BOUNDS,
  "supper-room": SUPPER_ROOM_BOUNDS,
};

const HOTSPOTS: Record<RoomId, Hotspot[]> = {
  ballroom: [CHARLOTTE_HOTSPOT],
  "card-room": [CARD_ROOM_HOTSPOT],
  "supper-room": [],
};

export default function App() {
  const [phase, setPhase] = useState<Phase>("title");
  const [beat, setBeat] = useState<Beat>("free-roam");
  const beatRef = useRef<Beat>(beat);
  beatRef.current = beat;

  const [currentRoom, setCurrentRoom] = useState<RoomId>("ballroom");
  const currentRoomRef = useRef<RoomId>(currentRoom);
  currentRoomRef.current = currentRoom;

  const [player, setPlayer] = useState<PlayerFigure>({ x: 0, y: 3, facing: 0, moving: false });
  const playerRef = useRef(player);

  const [anchor, setAnchor] = useState<Point>({ x: 0, y: 3 });
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [minglingRemainingMs, setMinglingRemainingMs] = useState(MINGLING_MS);
  const [darcyRemainingMs, setDarcyRemainingMs] = useState(DARCY_RESPONSE_MS);
  // Kept for the evening's diary/voice-line trail; not read back in Phase A/B.
  const [, setLog] = useState<LogEntry[]>([]);
  const [reveal, setReveal] = useState<LocalizedText | null>(null);

  const [fading, setFading] = useState(false);
  const [toast, setToast] = useState<{ id: string; text: LocalizedText } | null>(null);
  const [supperInterludeActive, setSupperInterludeActive] = useState(false);
  const supperInterludeActiveRef = useRef(false);
  supperInterludeActiveRef.current = supperInterludeActive;

  const danceSystemRef = useRef(new DanceSystem());
  const audioRef = useRef<AudioManager | null>(null);
  if (!audioRef.current) audioRef.current = new AudioManager();
  const voiceRef = useRef<VoiceManager | null>(null);
  if (!voiceRef.current) voiceRef.current = new VoiceManager();
  const keysRef = useRef<Record<string, boolean>>({});
  const joystickRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const transitioningRef = useRef(false);
  const visitedSupperRef = useRef(false);
  const triggeredHotspotsRef = useRef<Set<string>>(new Set());

  const showToast = useCallback((id: string, text: LocalizedText) => {
    setToast({ id, text });
    voiceRef.current?.play(id, "en", text.en);
    window.setTimeout(() => {
      setToast((t) => (t?.id === id ? null : t));
    }, 4500);
  }, []);

  const transitionToRoom = useCallback(
    (newRoom: RoomId, spawnPoint: Point, onArrived?: () => void) => {
      if (transitioningRef.current) return;
      transitioningRef.current = true;
      setFading(true);
      window.setTimeout(() => {
        currentRoomRef.current = newRoom;
        setCurrentRoom(newRoom);
        playerRef.current = { x: spawnPoint.x, y: spawnPoint.y, facing: 0, moving: false };
        setPlayer(playerRef.current);
        window.setTimeout(() => {
          setFading(false);
          transitioningRef.current = false;
          onArrived?.();
        }, 80);
      }, 240);
    },
    [],
  );

  // Player movement: a separate RAF loop. Also handles doorway transitions
  // and proximity hotspots, since both need the same per-frame position.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const checkDoorways = () => {
      const room = currentRoomRef.current;
      const pos = playerRef.current;
      if (room === "ballroom") {
        if (
          pos.x <= BALLROOM_BOUNDS.minX + PLAYER_MARGIN + DOORWAY_MARGIN &&
          pos.y >= CARD_ROOM_DOORWAY.minY &&
          pos.y <= CARD_ROOM_DOORWAY.maxY
        ) {
          transitionToRoom("card-room", { x: CARD_ROOM_BOUNDS.maxX - 1.4, y: 0 });
        } else if (
          pos.x >= BALLROOM_BOUNDS.maxX - PLAYER_MARGIN - DOORWAY_MARGIN &&
          pos.y >= SUPPER_ROOM_DOORWAY.minY &&
          pos.y <= SUPPER_ROOM_DOORWAY.maxY
        ) {
          transitionToRoom("supper-room", { x: SUPPER_ROOM_BOUNDS.minX + 1.4, y: 0 }, () => {
            if (!visitedSupperRef.current) {
              visitedSupperRef.current = true;
              setSupperInterludeActive(true);
            }
          });
        }
      } else if (room === "card-room") {
        if (
          pos.x >= CARD_ROOM_BOUNDS.maxX - PLAYER_MARGIN - DOORWAY_MARGIN &&
          pos.y >= CARD_TO_BALLROOM_DOORWAY.minY &&
          pos.y <= CARD_TO_BALLROOM_DOORWAY.maxY
        ) {
          transitionToRoom("ballroom", { x: BALLROOM_BOUNDS.minX + 1.4, y: -3 });
        }
      } else if (room === "supper-room") {
        if (
          pos.x <= SUPPER_ROOM_BOUNDS.minX + PLAYER_MARGIN + DOORWAY_MARGIN &&
          pos.y >= SUPPER_TO_BALLROOM_DOORWAY.minY &&
          pos.y <= SUPPER_TO_BALLROOM_DOORWAY.maxY
        ) {
          transitionToRoom("ballroom", { x: BALLROOM_BOUNDS.maxX - 1.4, y: 3 });
        }
      }
    };

    const checkHotspots = () => {
      const room = currentRoomRef.current;
      const pos = playerRef.current;
      for (const spot of HOTSPOTS[room]) {
        if (triggeredHotspotsRef.current.has(spot.id)) continue;
        if (Math.hypot(pos.x - spot.x, pos.y - spot.y) <= spot.radius) {
          triggeredHotspotsRef.current.add(spot.id);
          showToast(spot.id, spot.text);
        }
      }
    };

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const canMove =
        MOVABLE_BEATS.includes(beatRef.current) && !supperInterludeActiveRef.current && !transitioningRef.current;
      const k = keysRef.current;
      let dx = (k["d"] || k["arrowright"] ? 1 : 0) - (k["a"] || k["arrowleft"] ? 1 : 0);
      let dy = (k["s"] || k["arrowdown"] ? 1 : 0) - (k["w"] || k["arrowup"] ? 1 : 0);
      dx += joystickRef.current.x;
      dy += joystickRef.current.y;

      const mag = Math.hypot(dx, dy);
      if (canMove && mag > 0.05) {
        dx /= mag;
        dy /= mag;
        const bounds = ROOM_BOUNDS[currentRoomRef.current];
        const current = playerRef.current;
        playerRef.current = {
          x: clamp(current.x + dx * PLAYER_SPEED * dt, bounds.minX + PLAYER_MARGIN, bounds.maxX - PLAYER_MARGIN),
          y: clamp(current.y + dy * PLAYER_SPEED * dt, bounds.minY + PLAYER_MARGIN, bounds.maxY - PLAYER_MARGIN),
          facing: dx === 0 ? current.facing : Math.sign(dx),
          moving: true,
        };
        setPlayer(playerRef.current);
      } else if (playerRef.current.moving) {
        playerRef.current = { ...playerRef.current, moving: false };
        setPlayer(playerRef.current);
      }

      if (canMove) {
        checkDoorways();
        checkHotspots();
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [transitionToRoom, showToast]);

  // Evening clock: only runs once the ball has begun.
  useEffect(() => {
    if (phase !== "ball") return;
    const id = setInterval(() => setElapsedMinutes((m) => m + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Mr. Collins's pre-secured dance arrives inevitably, a couple of
  // in-game minutes into the evening -- waits for the player to be back in
  // the ballroom if they've wandered off (unlikely this early, but cheap
  // to guard against).
  useEffect(() => {
    if (
      phase === "ball" &&
      beat === "free-roam" &&
      elapsedMinutes >= COLLINS_TRIGGER_MINUTE &&
      currentRoom === "ballroom"
    ) {
      setAnchor(playerRef.current);
      setBeat("collins-interlude");
      audioRef.current?.setMood("collins-interlude");
    }
  }, [phase, beat, elapsedMinutes, currentRoom]);

  const handleCollinsComplete = useCallback(() => {
    danceSystemRef.current.recordAuto("set-1", "collins");
    danceSystemRef.current.recordAuto("set-2", "bingley");
    setLog((prev) => [
      ...prev,
      { time: "the two first dances", text: composeEveningNote({ collins: "done", darcy: null }) },
    ]);
    setMinglingRemainingMs(MINGLING_MS);
    setBeat("mingling");
    audioRef.current?.setMood("mingling");
  }, []);

  // Mingling: a real-time countdown to the next set, player still free to
  // roam the house. If they've wandered off, the next set calls them back
  // to the ballroom before Darcy approaches.
  useEffect(() => {
    if (beat !== "mingling") return;
    const start = performance.now();
    let settled = false;
    const id = setInterval(() => {
      const remaining = Math.max(0, MINGLING_MS - (performance.now() - start));
      setMinglingRemainingMs(remaining);
      if (remaining <= 0 && !settled) {
        settled = true;
        const startDarcyApproach = () => {
          danceSystemRef.current.recordAuto("set-3", "bingley");
          if (danceSystemRef.current.dancedTwiceWith("bingley")) {
            showToast(JANE_BINGLEY_GOSSIP.id, JANE_BINGLEY_GOSSIP.text);
          }
          setAnchor(playerRef.current);
          setBeat("darcy-approach");
          audioRef.current?.setMood("darcy-approach");
        };
        if (currentRoomRef.current !== "ballroom") {
          transitionToRoom("ballroom", { x: 0, y: 3 }, startDarcyApproach);
        } else {
          startDarcyApproach();
        }
      }
    }, 100);
    return () => clearInterval(id);
  }, [beat, transitionToRoom, showToast]);

  const resolveDarcy = useCallback((decision: "accept" | "decline") => {
    danceSystemRef.current.recordDecision("set-4", "darcy", decision);
    const outcome = decision === "accept" ? "accepted" : "declined";
    setReveal(decision === "accept" ? DARCY_ACCEPT_RESULT : DARCY_DECLINE_RESULT);
    setLog((prev) => [
      ...prev,
      { time: "the fourth dance", text: composeEveningNote({ collins: "done", darcy: outcome }) },
    ]);
    setBeat("resolved");
    audioRef.current?.setMood(decision === "accept" ? "resolved-accept" : "resolved-decline");
    voiceRef.current?.play(
      decision === "accept" ? "darcy-accept-result" : "darcy-decline-result",
      "en",
      decision === "accept" ? DARCY_ACCEPT_RESULT.en : DARCY_DECLINE_RESULT.en,
    );
  }, []);

  const handleNpcArrived = useCallback((id: string) => {
    if (id === "darcy" && beatRef.current === "darcy-approach") {
      setDarcyRemainingMs(DARCY_RESPONSE_MS);
      setBeat("darcy-prompt");
      audioRef.current?.setMood("darcy-prompt");
      voiceRef.current?.play("darcy-ask", "en", DARCY_ASK.en);
    }
  }, []);

  const handleCollinsLineChange = useCallback((line: InterludeLine) => {
    voiceRef.current?.play(line.id, "en", line.text.en);
  }, []);

  const handleMrsBennetLineChange = useCallback((line: InterludeLine) => {
    voiceRef.current?.play(line.id, "en", line.text.en);
  }, []);

  const handleMrsBennetComplete = useCallback(() => {
    setSupperInterludeActive(false);
  }, []);

  // Darcy's response window: silence resolves to "accept", matching the
  // novel's "she found she had said yes" beat.
  useEffect(() => {
    if (beat !== "darcy-prompt") return;
    const start = performance.now();
    let settled = false;
    const id = setInterval(() => {
      const remaining = Math.max(0, DARCY_RESPONSE_MS - (performance.now() - start));
      setDarcyRemainingMs(remaining);
      if (remaining <= 0 && !settled) {
        settled = true;
        resolveDarcy("accept");
      }
    }, 100);
    return () => clearInterval(id);
  }, [beat, resolveDarcy]);

  const npcTargets = useMemo<NpcTarget[]>(() => {
    if (currentRoom === "card-room") return CARD_ROOM_NPCS;
    if (currentRoom === "supper-room") return [];

    const list: NpcTarget[] = [];
    if (beat === "collins-interlude") {
      list.push({
        id: "collins",
        kind: "gent",
        color: CHARACTERS.collins.color,
        label: CHARACTERS.collins.name.en,
        x: anchor.x - 1.3,
        y: anchor.y - 0.3,
        spawnAt: { x: anchor.x - 1.3, y: anchor.y - 2.2 },
      });
    }
    if (beat === "darcy-approach" || beat === "darcy-prompt" || beat === "resolved") {
      list.push({
        id: "darcy",
        kind: "gent",
        color: CHARACTERS.darcy.color,
        label: CHARACTERS.darcy.name.en,
        x: anchor.x + 1.3,
        y: anchor.y - 0.3,
        spawnAt: { x: BALLROOM_BOUNDS.minX + 1, y: BALLROOM_BOUNDS.minY + 1 },
      });
    }
    if (beat !== "collins-interlude") {
      list.push(
        {
          id: "charlotte",
          kind: "lady",
          color: CHARACTERS.charlotte.color,
          label: CHARACTERS.charlotte.name.en,
          x: CHARLOTTE_POSITION.x,
          y: CHARLOTTE_POSITION.y,
        },
        {
          id: "jane",
          kind: "lady",
          color: CHARACTERS.jane.color,
          x: JANE_BINGLEY_POSITION.x - 0.5,
          y: JANE_BINGLEY_POSITION.y,
          forceMoving: true,
        },
        {
          id: "bingley",
          kind: "gent",
          color: CHARACTERS.bingley.color,
          x: JANE_BINGLEY_POSITION.x + 0.5,
          y: JANE_BINGLEY_POSITION.y,
          forceMoving: true,
        },
      );
    }
    return list;
  }, [beat, anchor, currentRoom]);

  const onJoystickMove = useCallback((vec: { x: number; y: number }) => {
    joystickRef.current = vec;
  }, []);

  const beginEvening = useCallback(() => {
    audioRef.current?.start();
    audioRef.current?.setMood("free-roam");
    setPhase("ball");
  }, []);

  if (phase === "title") {
    return <TitleScreen onBegin={beginEvening} />;
  }

  return (
    <div className="relative h-full w-full">
      <RoomCanvas roomId={currentRoom} player={player} npcTargets={npcTargets} onNpcArrived={handleNpcArrived} />
      <TouchJoystick onMove={onJoystickMove} />

      <div
        className="pointer-events-none absolute inset-0 bg-black transition-opacity duration-200"
        style={{ opacity: fading ? 1 : 0 }}
      />

      {beat === "mingling" && (
        <div className="absolute left-1/2 top-6 -translate-x-1/2 rounded-full border border-white/15 bg-black/40 px-4 py-1.5 text-xs uppercase tracking-widest text-white/70">
          The next set begins in {Math.ceil(minglingRemainingMs / 1000)}s
        </div>
      )}

      {toast && (
        <div className="absolute inset-x-0 bottom-24 mx-auto max-w-sm rounded-lg border border-white/15 bg-black/70 p-3 text-center text-xs leading-relaxed text-white/85 md:bottom-8">
          {toast.text.en}
        </div>
      )}

      {beat === "collins-interlude" && (
        <InterludeOverlay
          lines={COLLINS_INTERLUDE}
          onComplete={handleCollinsComplete}
          onLineChange={handleCollinsLineChange}
        />
      )}

      {supperInterludeActive && (
        <InterludeOverlay
          lines={MRS_BENNET_INTERLUDE}
          onComplete={handleMrsBennetComplete}
          onLineChange={handleMrsBennetLineChange}
        />
      )}

      {beat === "darcy-prompt" && (
        <DanceRequestPrompt
          askText={DARCY_ASK}
          remainingMs={darcyRemainingMs}
          totalMs={DARCY_RESPONSE_MS}
          onDecide={resolveDarcy}
        />
      )}

      {beat === "resolved" && reveal && !supperInterludeActive && (
        <div className="absolute inset-x-0 bottom-8 mx-auto max-w-md rounded-lg border border-white/15 bg-black/60 p-4 text-center text-sm leading-relaxed text-white/90">
          {reveal.en}
        </div>
      )}
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
