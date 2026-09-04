export type VoiceLang = "en" | "ja";

/**
 * Plays a pre-generated narration mp3 (public/vo/<lang>/<id>.mp3) if one
 * exists; otherwise falls back to the browser's SpeechSynthesis so the
 * game is fully playable before anyone runs the offline TTS step.
 */
export class VoiceManager {
  private current: HTMLAudioElement | null = null;

  play(id: string, lang: VoiceLang, text: string): void {
    this.stop();

    let fellBack = false;
    const fallback = () => {
      if (fellBack) return;
      fellBack = true;
      this.speak(text, lang);
    };

    const audio = new Audio(`/vo/${lang}/${id}.mp3`);
    audio.onerror = fallback;
    audio.play().catch(fallback);
    this.current = audio;
  }

  stop(): void {
    if (this.current) {
      this.current.pause();
      this.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  private speak(text: string, lang: VoiceLang): void {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "ja" ? "ja-JP" : "en-US";
    window.speechSynthesis.speak(utterance);
  }
}
