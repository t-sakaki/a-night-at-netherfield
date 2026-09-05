import { BASS, BEAT_SEC, LOOP_BEATS, MELODY, playPluck, playSustained } from "@/audio/ballMusic";

export type MusicMood =
  | "title"
  | "free-roam"
  | "collins-interlude"
  | "mingling"
  | "darcy-approach"
  | "darcy-prompt"
  | "resolved-accept"
  | "resolved-decline";

type MoodTarget = { ensemble: number; solo: number; cutoff: number; wobble: number };

const RAMP_SEC = 1.4;
const MASTER_VOLUME = 0.5;
const MUTE_RAMP_SEC = 0.15;

const MOOD_TARGETS: Record<MusicMood, MoodTarget> = {
  title: { ensemble: 0.35, solo: 0, cutoff: 700, wobble: 0 },
  "free-roam": { ensemble: 0.4, solo: 0, cutoff: 800, wobble: 0 },
  "collins-interlude": { ensemble: 0.85, solo: 0, cutoff: 6000, wobble: 1 },
  mingling: { ensemble: 0.95, solo: 0.1, cutoff: 9000, wobble: 0 },
  "darcy-approach": { ensemble: 0.35, solo: 0.75, cutoff: 3500, wobble: 0 },
  "darcy-prompt": { ensemble: 0.22, solo: 0.9, cutoff: 2600, wobble: 0 },
  "resolved-accept": { ensemble: 0.9, solo: 0.35, cutoff: 8500, wobble: 0 },
  "resolved-decline": { ensemble: 0.5, solo: 0.5, cutoff: 3000, wobble: 0 },
};

/**
 * Fully synthesized ballroom score: the same 8-bar tune loops for the
 * whole evening on two always-running "stems" (a plucked ensemble bus and
 * a sustained solo-violin bus). setMood() only crossfades their mix and a
 * filter cutoff per beat — the classic film-score trick of thinning an
 * arrangement down to one instrument for an intimate moment, rather than
 * swapping what's playing.
 */
export class AudioManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private ensembleGain: GainNode | null = null;
  private ensembleFilter: BiquadFilterNode | null = null;
  private soloGain: GainNode | null = null;
  private wobbleDepth: GainNode | null = null;
  private muted = false;

  start(): void {
    if (this.ctx) {
      void this.ctx.resume();
      return;
    }
    const ctx = new AudioContext();
    this.ctx = ctx;
    void ctx.resume();

    const master = ctx.createGain();
    master.gain.value = this.muted ? 0 : MASTER_VOLUME;
    master.connect(ctx.destination);

    const ensembleFilter = ctx.createBiquadFilter();
    ensembleFilter.type = "lowpass";
    ensembleFilter.Q.value = 0.7;
    ensembleFilter.frequency.value = MOOD_TARGETS["free-roam"].cutoff;
    ensembleFilter.connect(master);

    const ensembleGain = ctx.createGain();
    ensembleGain.gain.value = MOOD_TARGETS["free-roam"].ensemble;
    ensembleGain.connect(ensembleFilter);

    const soloGain = ctx.createGain();
    soloGain.gain.value = 0;
    soloGain.connect(master);

    const wobbleLfo = ctx.createOscillator();
    wobbleLfo.frequency.value = 4.2;
    const wobbleDepth = ctx.createGain();
    wobbleDepth.gain.value = 0;
    wobbleLfo.connect(wobbleDepth);
    wobbleDepth.connect(ensembleFilter.frequency);
    wobbleLfo.start();

    this.master = master;
    this.ensembleGain = ensembleGain;
    this.ensembleFilter = ensembleFilter;
    this.soloGain = soloGain;
    this.wobbleDepth = wobbleDepth;

    this.scheduleLoopChunk();
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(muted ? 0 : MASTER_VOLUME, t + MUTE_RAMP_SEC);
  }

  setMood(mood: MusicMood): void {
    const ctx = this.ctx;
    const ensembleGain = this.ensembleGain;
    const ensembleFilter = this.ensembleFilter;
    const soloGain = this.soloGain;
    const wobbleDepth = this.wobbleDepth;
    if (!ctx || !ensembleGain || !ensembleFilter || !soloGain || !wobbleDepth) return;

    const target = MOOD_TARGETS[mood];
    const t = ctx.currentTime;

    rampTo(ensembleGain.gain, t, target.ensemble);
    rampTo(soloGain.gain, t, target.solo);
    rampTo(ensembleFilter.frequency, t, target.cutoff);
    rampTo(wobbleDepth.gain, t, target.wobble * 220);

    if (mood === "resolved-accept") this.playAccent("bright");
    if (mood === "resolved-decline") this.playAccent("wistful");
  }

  private playAccent(variant: "bright" | "wistful"): void {
    const ctx = this.ctx;
    const soloGain = this.soloGain;
    if (!ctx || !soloGain) return;
    const start = ctx.currentTime + 0.05;
    const phrase = variant === "bright" ? [62, 66, 69, 74] : [74, 72, 69, 65];
    phrase.forEach((midi, i) => {
      playSustained(ctx, soloGain, start + i * 0.32, 0.5, midi, 0.8);
    });
  }

  private scheduleLoopChunk(): void {
    const ctx = this.ctx;
    const ensembleGain = this.ensembleGain;
    const soloGain = this.soloGain;
    if (!ctx || !ensembleGain || !soloGain) return;

    const startTime = ctx.currentTime + 0.05;
    for (const n of MELODY) {
      playPluck(ctx, ensembleGain, startTime + n.beat * BEAT_SEC, n.dur * BEAT_SEC * 0.92, n.midi);
      playSustained(ctx, soloGain, startTime + n.beat * BEAT_SEC, n.dur * BEAT_SEC * 0.98, n.midi, 0.9);
    }
    for (const n of BASS) {
      playPluck(ctx, ensembleGain, startTime + n.beat * BEAT_SEC, n.dur * BEAT_SEC * 0.92, n.midi, 0.65);
    }

    window.setTimeout(() => this.scheduleLoopChunk(), LOOP_BEATS * BEAT_SEC * 1000 - 30);
  }
}

function rampTo(param: AudioParam, now: number, value: number): void {
  param.cancelScheduledValues(now);
  param.setValueAtTime(param.value, now);
  param.linearRampToValueAtTime(value, now + RAMP_SEC);
}
