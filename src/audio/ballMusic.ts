export type Note = { beat: number; midi: number; dur: number };

export const BPM = 108;
export const BEAT_SEC = 60 / BPM;
export const LOOP_BEATS = 32;

/**
 * An original Playford-style country-dance tune (D major, 8 bars, AABB
 * phrasing implied by the melody's two 4-bar halves) — a period pastiche,
 * not a transcription of any specific historical piece. `beat` is an
 * offset in quarter-note beats from the start of the loop.
 */
export const MELODY: Note[] = [
  { beat: 0, midi: 62, dur: 1 },
  { beat: 1, midi: 64, dur: 1 },
  { beat: 2, midi: 66, dur: 1 },
  { beat: 3, midi: 67, dur: 1 },
  { beat: 4, midi: 69, dur: 1 },
  { beat: 5, midi: 69, dur: 1 },
  { beat: 6, midi: 67, dur: 1 },
  { beat: 7, midi: 66, dur: 1 },
  { beat: 8, midi: 64, dur: 1 },
  { beat: 9, midi: 66, dur: 1 },
  { beat: 10, midi: 67, dur: 1 },
  { beat: 11, midi: 69, dur: 1 },
  { beat: 12, midi: 67, dur: 1 },
  { beat: 13, midi: 66, dur: 1 },
  { beat: 14, midi: 64, dur: 1 },
  { beat: 15, midi: 62, dur: 1 },
  { beat: 16, midi: 69, dur: 1 },
  { beat: 17, midi: 71, dur: 1 },
  { beat: 18, midi: 69, dur: 1 },
  { beat: 19, midi: 67, dur: 1 },
  { beat: 20, midi: 66, dur: 1 },
  { beat: 21, midi: 67, dur: 1 },
  { beat: 22, midi: 69, dur: 1 },
  { beat: 23, midi: 71, dur: 1 },
  { beat: 24, midi: 73, dur: 1 },
  { beat: 25, midi: 71, dur: 1 },
  { beat: 26, midi: 69, dur: 1 },
  { beat: 27, midi: 67, dur: 1 },
  { beat: 28, midi: 66, dur: 1 },
  { beat: 29, midi: 64, dur: 1 },
  { beat: 30, midi: 62, dur: 2 },
];

/** Simple I-V "oom-pah" walking bass, root notes on the half-bar. */
export const BASS: Note[] = [
  { beat: 0, midi: 38, dur: 2 },
  { beat: 2, midi: 45, dur: 2 },
  { beat: 4, midi: 45, dur: 2 },
  { beat: 6, midi: 52, dur: 2 },
  { beat: 8, midi: 38, dur: 2 },
  { beat: 10, midi: 45, dur: 2 },
  { beat: 12, midi: 45, dur: 2 },
  { beat: 14, midi: 52, dur: 2 },
  { beat: 16, midi: 38, dur: 2 },
  { beat: 18, midi: 45, dur: 2 },
  { beat: 20, midi: 45, dur: 2 },
  { beat: 22, midi: 52, dur: 2 },
  { beat: 24, midi: 38, dur: 2 },
  { beat: 26, midi: 45, dur: 2 },
  { beat: 28, midi: 45, dur: 2 },
  { beat: 30, midi: 38, dur: 2 },
];

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** A fast-attack, exponential-decay plucked tone (detuned unison for width). */
export function playPluck(
  ctx: AudioContext,
  dest: AudioNode,
  when: number,
  dur: number,
  midi: number,
  gainScale = 1,
): void {
  const freq = midiToFreq(midi);
  const noteGain = ctx.createGain();
  noteGain.gain.setValueAtTime(0, when);
  noteGain.gain.linearRampToValueAtTime(0.26 * gainScale, when + 0.008);
  noteGain.gain.exponentialRampToValueAtTime(0.0008, when + dur);
  noteGain.connect(dest);

  for (const detune of [-6, 6]) {
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;
    osc.detune.value = detune;
    osc.connect(noteGain);
    osc.start(when);
    osc.stop(when + dur + 0.05);
  }
}

/** A single sustained, vibrato'd voice — the "solo violin" line. */
export function playSustained(
  ctx: AudioContext,
  dest: AudioNode,
  when: number,
  dur: number,
  midi: number,
  gainScale = 1,
): void {
  const freq = midiToFreq(midi);
  const peak = 0.22 * gainScale;
  const noteGain = ctx.createGain();
  noteGain.gain.setValueAtTime(0, when);
  noteGain.gain.linearRampToValueAtTime(peak, when + dur * 0.25);
  noteGain.gain.setValueAtTime(peak, when + dur * 0.75);
  noteGain.gain.linearRampToValueAtTime(0, when + dur);
  noteGain.connect(dest);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 2200;
  filter.connect(noteGain);

  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.value = freq;
  osc.connect(filter);

  const vibrato = ctx.createOscillator();
  vibrato.frequency.value = 5.5;
  const vibratoGain = ctx.createGain();
  vibratoGain.gain.value = 6;
  vibrato.connect(vibratoGain);
  vibratoGain.connect(osc.detune);

  osc.start(when);
  vibrato.start(when);
  osc.stop(when + dur + 0.05);
  vibrato.stop(when + dur + 0.05);
}
