"use client";

/**
 * ETHA Quiz Sound Kit
 *
 * Pure Web Audio API synthesis — no audio files.
 * Frequencies drawn from Solfeggio scale + 432Hz tuning (Ayurvedic resonance).
 *
 * Sounds:
 *   intro     — deep 432Hz singing bowl when quiz opens
 *   tick      — 528Hz bell tap for question advancement
 *   select    — 396Hz soft tap for answer selection
 *   layerIn   — low drone sweep for layer transition screens
 *   drawLine  — pink noise bandpass sweep for SVG line draw
 *   complete  — ascending 396→528→639Hz Solfeggio chord
 *   chime     — airy 1760Hz crystal chime for hover states
 */

export type SoundName =
  | "intro"
  | "tick"
  | "select"
  | "layerIn"
  | "drawLine"
  | "complete"
  | "chime"
  | "chimeA"
  | "chimeB"
  | "chimeC";

export interface SoundOptions {
  volume?: number; // 0–1, multiplied with master volume
}

class ETHASoundKit {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private reverbSend: ConvolverNode | null = null;
  private reverbReturn: GainNode | null = null;
  private _enabled = true;
  private _volume = 0.75;

  // ─── Bootstrap ───────────────────────────────────────────────────────────

  /** Call once on first user gesture to unlock AudioContext. */
  init() {
    if (typeof localStorage !== "undefined") {
      const stored = localStorage.getItem("etha-sound-enabled");
      if (stored !== null) this._enabled = stored === "true";
    }
  }

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (
        window.AudioContext ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).webkitAudioContext
      )();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this._volume;
      this.masterGain.connect(this.ctx.destination);

      this.reverbSend = this.buildReverb(this.ctx, 3, 1.8);
      this.reverbReturn = this.ctx.createGain();
      this.reverbReturn.gain.value = 0.28;
      this.reverbSend.connect(this.reverbReturn);
      this.reverbReturn.connect(this.masterGain);
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }

  // ─── Reverb (synthetic impulse response) ─────────────────────────────────

  private buildReverb(
    ctx: AudioContext,
    durationSec: number,
    decay: number
  ): ConvolverNode {
    const sr = ctx.sampleRate;
    const len = Math.floor(sr * durationSec);
    const buf = ctx.createBuffer(2, len, sr);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    const node = ctx.createConvolver();
    node.buffer = buf;
    return node;
  }

  // ─── Core synthesis primitives ────────────────────────────────────────────

  /**
   * Tibetan/crystal singing bowl.
   * Uses inharmonic partials derived from real bowl measurements.
   * Partials: 1×, 2.756×, 5.404× fundamental (not exact harmonics).
   */
  private bowl(
    ctx: AudioContext,
    freq: number,
    duration: number,
    attackSec: number,
    amp: number,
    dryVol = 0.72,
    wetVol = 0.28
  ) {
    const now = ctx.currentTime;

    const partials: [number, number][] = [
      [freq, amp],
      [freq * 2.756, amp * 0.22],
      [freq * 5.404, amp * 0.07],
    ];

    partials.forEach(([f, a]) => {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      const lp = ctx.createBiquadFilter();

      lp.type = "lowpass";
      lp.frequency.value = 5000;

      osc.type = "sine";
      osc.frequency.setValueAtTime(f, now);
      // Real bowls pitch-drop slightly as they decay
      osc.frequency.exponentialRampToValueAtTime(f * 0.9975, now + duration);

      env.gain.setValueAtTime(0.0001, now);
      env.gain.linearRampToValueAtTime(a, now + attackSec);
      env.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(lp);
      lp.connect(env);

      // Dry path
      const dry = ctx.createGain();
      dry.gain.value = dryVol;
      env.connect(dry);
      dry.connect(this.masterGain!);

      // Wet path (reverb)
      const wet = ctx.createGain();
      wet.gain.value = wetVol;
      env.connect(wet);
      wet.connect(this.reverbSend!);

      osc.start(now);
      osc.stop(now + duration + 0.1);
    });
  }

  private whiteNoise(ctx: AudioContext, durationSec: number): AudioBufferSourceNode {
    const sr = ctx.sampleRate;
    const len = Math.floor(sr * durationSec);
    const buf = ctx.createBuffer(1, len, sr);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    return src;
  }

  /**
   * Pink noise buffer source — used for breath/line sounds.
   * Paul Kellet's pink noise approximation.
   */
  private pinkNoise(ctx: AudioContext, durationSec: number): AudioBufferSourceNode {
    const sr = ctx.sampleRate;
    const len = Math.floor(sr * durationSec);
    const buf = ctx.createBuffer(1, len, sr);
    const d = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.96900 * b2 + w * 0.1538520;
      b3 = 0.86650 * b3 + w * 0.3104856;
      b4 = 0.55000 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.0168980;
      d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) / 6.5;
      b6 = w * 0.115926;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    return src;
  }

  // ─── Named sounds ─────────────────────────────────────────────────────────

  private playIntro(ctx: AudioContext, vol: number) {
    // Deep 432Hz (Verdi A) — "cosmic tuning", long resonant strike
    this.bowl(ctx, 432, 6, 0.12, 0.55 * vol);
  }

  private playTick(ctx: AudioContext, vol: number) {
    // 528Hz — Solfeggio "MI", transformation frequency
    this.bowl(ctx, 528, 3.5, 0.006, 0.42 * vol);
  }

  private playSelect(ctx: AudioContext, vol: number) {
    // Pencil tap on paper — short white noise burst, graphite frequency range
    const now = ctx.currentTime;
    const dur = 0.09;

    const src = this.whiteNoise(ctx, dur + 0.05);

    // Bandpass centred on graphite scratch range ~3.5kHz
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 3500;
    bp.Q.value = 1.8;

    // High shelf — paper grain sparkle
    const hs = ctx.createBiquadFilter();
    hs.type = "highshelf";
    hs.frequency.value = 5000;
    hs.gain.value = 4;

    // Fast tremolo at 14Hz — micro scratch texture
    const tremoloLFO = ctx.createOscillator();
    const tremoloDepth = ctx.createGain();
    tremoloLFO.type = "sawtooth";
    tremoloLFO.frequency.value = 14;
    tremoloDepth.gain.value = 0.18;
    tremoloLFO.connect(tremoloDepth);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(0.22 * vol, now + 0.005);
    env.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    tremoloDepth.connect(env.gain);

    src.connect(bp);
    bp.connect(hs);
    hs.connect(env);
    env.connect(this.masterGain!);

    tremoloLFO.start(now);
    tremoloLFO.stop(now + dur + 0.05);
    src.start(now);
    src.stop(now + dur + 0.05);
  }

  private playLayerIn(ctx: AudioContext, vol: number) {
    // Two-note soft ascending chime — 432Hz then 528Hz, quick and clean
    this.bowl(ctx, 432, 1.2, 0.006, 0.3 * vol, 0.7, 0.3);
    setTimeout(() => {
      if (!this.ctx) return;
      this.bowl(this.ctx, 528, 1.0, 0.006, 0.25 * vol, 0.7, 0.3);
    }, 180);
  }

  private playDrawLine(ctx: AudioContext, vol: number) {
    // Pencil dragged across paper — white noise + scratch tremolo + graphite filter sweep
    const now = ctx.currentTime;
    const dur = 0.52;

    const src = this.whiteNoise(ctx, dur + 0.1);

    // Bandpass sweeps slightly as pencil moves (pressure variation)
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(2800, now);
    bp.frequency.linearRampToValueAtTime(3800, now + dur * 0.6);
    bp.frequency.linearRampToValueAtTime(3200, now + dur);
    bp.Q.value = 1.5;

    // High shelf — graphite sparkle
    const hs = ctx.createBiquadFilter();
    hs.type = "highshelf";
    hs.frequency.value = 5000;
    hs.gain.value = 5;

    // Scratch tremolo — 11Hz sawtooth, simulates micro stick-slip of graphite
    const lfo = ctx.createOscillator();
    const lfoDepth = ctx.createGain();
    lfo.type = "sawtooth";
    lfo.frequency.value = 11;
    lfoDepth.gain.value = 0.12;
    lfo.connect(lfoDepth);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(0.13 * vol, now + 0.018);
    env.gain.linearRampToValueAtTime(0.10 * vol, now + dur * 0.5);
    env.gain.linearRampToValueAtTime(0.12 * vol, now + dur * 0.75);
    env.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    lfoDepth.connect(env.gain);

    // Second layer — softer paper friction underneath
    const src2 = this.whiteNoise(ctx, dur + 0.1);
    const lp2 = ctx.createBiquadFilter();
    lp2.type = "lowpass";
    lp2.frequency.value = 900;
    const env2 = ctx.createGain();
    env2.gain.setValueAtTime(0.0001, now);
    env2.gain.linearRampToValueAtTime(0.03 * vol, now + 0.025);
    env2.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    src2.connect(lp2); lp2.connect(env2); env2.connect(this.masterGain!);
    src2.start(now); src2.stop(now + dur + 0.1);

    src.connect(bp);
    bp.connect(hs);
    hs.connect(env);
    env.connect(this.masterGain!);

    lfo.start(now); lfo.stop(now + dur + 0.1);
    src.start(now); src.stop(now + dur + 0.1);
  }

  private playComplete(ctx: AudioContext, vol: number) {
    // Quick ascending Solfeggio triad: 396 → 528 → 639Hz, ~2.5s total
    const sequence = [
      { freq: 396, delay: 0,    duration: 2.5 },
      { freq: 528, delay: 0.25, duration: 2.2 },
      { freq: 639, delay: 0.5,  duration: 2.0 },
    ];
    sequence.forEach(({ freq, delay, duration }) => {
      setTimeout(() => {
        if (!this.ctx) return;
        this.bowl(this.ctx, freq, duration, 0.007, 0.38 * vol, 0.55, 0.45);
      }, delay * 1000);
    });
  }

  private playChime(ctx: AudioContext, vol: number) {
    this.bowl(ctx, 1760, 1.4, 0.003, 0.11 * vol, 0.65, 0.35);
  }

  // A — 2093 Hz (C7): bright, decisive
  private playChimeA(ctx: AudioContext, vol: number) {
    this.bowl(ctx, 2093, 1.2, 0.003, 0.10 * vol, 0.65, 0.35);
  }

  // B — 1760 Hz (A6): warm, centred
  private playChimeB(ctx: AudioContext, vol: number) {
    this.bowl(ctx, 1760, 1.4, 0.003, 0.10 * vol, 0.65, 0.35);
  }

  // C — 1320 Hz (E6): deep, grounded
  private playChimeC(ctx: AudioContext, vol: number) {
    this.bowl(ctx, 1320, 1.6, 0.004, 0.10 * vol, 0.65, 0.35);
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  /** Call on any user gesture (e.g. CTA click) to unlock AudioContext before navigation. */
  prime() {
    if (typeof window === "undefined") return;
    try { this.getCtx(); } catch { /* ignore */ }
  }

  /** True when AudioContext exists and is running (context was primed with a user gesture). */
  isRunning(): boolean {
    return this.ctx?.state === "running";
  }

  /**
   * Intro melody — same single-bowl treatment all 7 screens.
   * A432 pentatonic motif A→C#→E repeats twice, getting gently clearer.
   * Root returns on screen 6 as a quiet homecoming.
   */
  playIntroMelody(screenIdx: number) {
    if (!this._enabled) return;
    if (typeof window === "undefined") return;
    try {
      const ctx = this.getCtx();

      type L = { freq: number; amp: number; decay: number; attack: number };
      const layers: L[] = [
        { freq: 432, amp: 0.020, decay: 4.0, attack: 0.32 }, // 0 A3  — seed, barely there
        { freq: 540, amp: 0.034, decay: 3.8, attack: 0.30 }, // 1 C#4 — third drifts in
        { freq: 648, amp: 0.050, decay: 3.8, attack: 0.30 }, // 2 E4  — fifth opens
        { freq: 432, amp: 0.068, decay: 3.5, attack: 0.28 }, // 3 A3  — root echoes back
        { freq: 540, amp: 0.088, decay: 3.5, attack: 0.26 }, // 4 C#4 — third, warmer
        { freq: 648, amp: 0.112, decay: 3.2, attack: 0.24 }, // 5 E4  — fifth, fuller
        { freq: 432, amp: 0.140, decay: 3.0, attack: 0.22 }, // 6 A3  — root home, arrival
      ];

      const { freq, amp, decay, attack } = layers[Math.min(screenIdx, layers.length - 1)];
      this.bowl(ctx, freq, decay, attack, amp, 0.45, 0.55);
    } catch { /* silent fail */ }
  }

  play(name: SoundName, options: SoundOptions = {}) {
    if (!this._enabled) return;
    if (typeof window === "undefined") return;

    try {
      const ctx = this.getCtx();
      const vol = options.volume ?? 1;

      switch (name) {
        case "intro":    this.playIntro(ctx, vol);    break;
        case "tick":     this.playTick(ctx, vol);     break;
        case "select":   this.playSelect(ctx, vol);   break;
        case "layerIn":  this.playLayerIn(ctx, vol);  break;
        case "drawLine": this.playDrawLine(ctx, vol); break;
        case "complete": this.playComplete(ctx, vol); break;
        case "chime":    this.playChime(ctx, vol);    break;
        case "chimeA":   this.playChimeA(ctx, vol);  break;
        case "chimeB":   this.playChimeB(ctx, vol);  break;
        case "chimeC":   this.playChimeC(ctx, vol);  break;
      }
    } catch {
      // Audio is progressive enhancement — never crash
    }
  }

  setVolume(v: number) {
    this._volume = Math.max(0, Math.min(1, v));
    if (this.masterGain) this.masterGain.gain.value = this._volume;
  }

  setEnabled(enabled: boolean) {
    this._enabled = enabled;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("etha-sound-enabled", String(enabled));
    }
  }

  get enabled() { return this._enabled; }
  get volume()  { return this._volume;  }
}

export const quizSounds = new ETHASoundKit();
