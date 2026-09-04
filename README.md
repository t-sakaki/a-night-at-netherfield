# A Night at Netherfield

A real-time browser game set at the Netherfield Ball (*Pride and Prejudice*, ch. 18). You are Elizabeth Bennet. Mr. Collins has already secured you for the first two dances, whether you like it or not — and later in the evening, Mr. Darcy asks for the next one, and you have a few real seconds to decide how you answer.

Built with React 19, TypeScript, Vite, and Tailwind v4. Rendering is a hand-rolled isometric Canvas 2D scene (no game engine, no three.js). Music and narration are fully synthesized/generated locally — no licensed audio, no cloud APIs at runtime.

## Running it

```bash
pnpm install
pnpm dev
```

Other scripts: `pnpm build` / `pnpm preview`, `pnpm typecheck`, `pnpm test:e2e` (Playwright).

`PORT` and `BASE_PATH` are required env vars for `vite`/`vite build`/`vite preview` (the `dev`/`build`/`preview` scripts already set sensible defaults).

## Voice lines (optional)

Dialogue plays through the browser's built-in speech synthesis by default, so the game is fully playable right after `pnpm install`. For higher-quality pre-recorded narration:

```bash
uv tool install piper-tts --with pyopenjtalk
PIPER_VOICE_EN=/path/to/en_voice.onnx PIPER_VOICE_JA=/path/to/ja_voice.onnx pnpm vo
```

This renders every line in `src/audio/voiceLines.ts` through [Piper](https://github.com/rhasspy/piper) (offline TTS) and `ffmpeg`, writing `public/vo/<lang>/<id>.mp3`. Voice models: https://huggingface.co/rhasspy/piper-voices. Generated files are meant to be committed — regenerate only when dialogue text changes. See `scripts/generate-vo.ts` for details.

## Project structure

- `src/data/` — bilingual (en/ja) character and dialogue data
- `src/systems/DanceSystem.ts` — Regency ballroom-etiquette rules (accept commits you to a set, decline obligates sitting it out, two dances with one partner reads as a public sign of interest)
- `src/render/ballroom.ts` + `src/components/BallroomCanvas.tsx` — the isometric scene and its render loop
- `src/components/LivingPortrait.tsx` — procedural SVG character faces (no art assets required to start; drop `src/assets/portraits/<id>-<expression>.png` in later and it's picked up automatically)
- `src/audio/` — the synthesized score (`AudioManager.ts`, `ballMusic.ts`) and the voice pipeline (`VoiceManager.ts`, `voiceLines.ts`)
- `src/App.tsx` — the evening's beat state machine (title → free-roam → Collins's interlude → mingling countdown → Darcy's approach and request → resolution)

## Scope

This is **Phase A**: one playable vertical slice (title through Darcy's request and its resolution), not the full ball. Deliberately not built yet:

- The rest of the evening's dance sets, and the card-room / supper-room as their own activity spaces (the ballroom already has doorway cutouts hinting at both)
- Cast beyond Elizabeth, Collins, Darcy, and Charlotte Lucas (present in `src/data/characters.ts` but not yet in-scene)
- Real portrait art (procedural faces only for now)
- A language toggle (all on-screen text is currently English; Japanese text already exists throughout the data layer)
- Capacitor/mobile packaging, monetization
