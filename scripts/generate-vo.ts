#!/usr/bin/env tsx
/**
 * Offline TTS generation: renders every line in src/audio/voiceLines.ts
 * through Piper (https://github.com/rhasspy/piper) and re-encodes to mp3
 * via ffmpeg, writing public/vo/<lang>/<id>.mp3. Output is committed, so
 * this only needs to run again when dialogue text changes.
 *
 * Setup:
 *   uv tool install piper-tts --with pyopenjtalk
 *   PIPER_VOICE_EN=/path/to/en_voice.onnx PIPER_VOICE_JA=/path/to/ja_voice.onnx pnpm vo
 *
 * Voice models: https://huggingface.co/rhasspy/piper-voices
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { VOICE_LINES } from "../src/audio/voiceLines";

const OUT_ROOT = path.resolve(import.meta.dirname, "..", "public", "vo");

const LANGS = ["en", "ja"] as const;
type Lang = (typeof LANGS)[number];

const VOICE_MODEL: Record<Lang, string | undefined> = {
  en: process.env.PIPER_VOICE_EN,
  ja: process.env.PIPER_VOICE_JA,
};

for (const lang of LANGS) {
  const voice = VOICE_MODEL[lang];
  if (!voice) {
    console.warn(`Skipping ${lang}: set PIPER_VOICE_${lang.toUpperCase()} to an onnx voice model path.`);
    continue;
  }

  const outDir = path.join(OUT_ROOT, lang);
  mkdirSync(outDir, { recursive: true });

  for (const [id, text] of Object.entries(VOICE_LINES)) {
    const line = text[lang];
    const wavPath = path.join(outDir, `${id}.wav`);
    const mp3Path = path.join(outDir, `${id}.mp3`);

    console.log(`[${lang}] ${id}`);
    execFileSync("piper", ["--model", voice, "--output_file", wavPath], { input: line });
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", wavPath, "-codec:a", "libmp3lame", "-qscale:a", "4", mp3Path]);
    rmSync(wavPath);
  }
}

console.log("Done. Generated files are committed under public/vo/.");
