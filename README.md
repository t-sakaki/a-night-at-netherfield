# A Night at Netherfield

A real-time browser game set at the Netherfield Ball (*Pride and Prejudice*, ch. 18). You are Elizabeth Bennet. Mr. Collins has already secured you for the first two dances, whether you like it or not — and later in the evening, Mr. Darcy asks for the next one, and you have a few real seconds to decide how you answer. Walk through the doorways off the ballroom to find the card-room and the supper-room, each with its own life going on.

Built with React 19, TypeScript, Vite, and Tailwind v4. Rendering is a hand-rolled isometric Canvas 2D scene (no game engine, no three.js). Music is fully synthesized locally (Web Audio); narration is pre-generated offline via Piper — no licensed audio, no cloud APIs at runtime.

## Running it

```bash
pnpm install
pnpm dev
```

Other scripts: `pnpm build` / `pnpm preview`, `pnpm typecheck`, `pnpm test:e2e` (Playwright).

`PORT` and `BASE_PATH` are required env vars for `vite`/`vite build`/`vite preview` (the `dev`/`build`/`preview` scripts already set sensible defaults).

## Voice lines

Every line already has pre-generated narration committed under `public/vo/<lang>/<id>.mp3` (Piper `en_US-lessac-medium` / `ja_JA-hi_fi_captain-medium` + ffmpeg — one voice per language, not yet per character). Dialogue falls back to the browser's built-in speech synthesis for any line whose file is missing, so the game stays playable even if audio is stripped out.

To regenerate after editing dialogue text:

```bash
uv tool install piper-tts --with pyopenjtalk
PIPER_VOICE_EN=/path/to/en_voice.onnx PIPER_VOICE_JA=/path/to/ja_voice.onnx pnpm vo
```

This renders every line in `src/audio/voiceLines.ts` through [Piper](https://github.com/rhasspy/piper) and `ffmpeg`. Voice models: https://huggingface.co/rhasspy/piper-voices. See `scripts/generate-vo.ts` for details.

## Project structure

- `src/data/` — bilingual (en/ja) character and dialogue data
- `src/systems/DanceSystem.ts` — Regency ballroom-etiquette rules (accept commits you to a set, decline obligates sitting it out, two dances with one partner reads as a public sign of interest — this last one drives the Jane/Bingley subplot)
- `src/systems/room.ts` — DOM-free room/NPC types shared between game logic and data files
- `src/render/` — `shared.ts` (canvas helpers), `ballroom.ts` / `cardRoom.ts` / `supperRoom.ts` (the three rooms), consumed by `src/components/RoomCanvas.tsx`'s render loop
- `src/components/LivingPortrait.tsx` — procedural SVG character faces (no art assets required to start; drop `src/assets/portraits/<id>-<expression>.png` in later and it's picked up automatically)
- `src/audio/` — the synthesized score (`AudioManager.ts`, `ballMusic.ts`) and the voice pipeline (`VoiceManager.ts`, `voiceLines.ts`)
- `src/App.tsx` — the evening's beat state machine (title → free-roam → Collins's interlude → mingling countdown → Darcy's approach and request → a walkable resolution) plus room navigation, doorway transitions, and the proximity-hotspot system

## Scope

**Phase A** shipped the core vertical slice: title through Darcy's request and its resolution. **Phase B** added the card-room and supper-room as real navigable spaces (with Mrs. Bennet's ch.18 supper-table outburst), Charlotte Lucas and a card-room ambient line as proximity-triggered commentary, Jane and Bingley dancing in the background as a subplot, and real generated narration audio throughout.

Deliberately not built yet:

- The rest of the evening's dance sets — right now the plot only exercises the first and fourth
- Cast beyond Elizabeth, Collins, Darcy, Charlotte, Jane, and Bingley
- Real portrait art (procedural faces only for now)
- A language toggle (all on-screen text is currently English; Japanese text and narration already exist throughout)
- Per-character voice models (everyone in a given language currently shares one Piper voice)
- Capacitor/mobile packaging, monetization
