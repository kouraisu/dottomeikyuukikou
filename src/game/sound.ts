// 8-bit Web Audio API sound effects & dynamic scene BGM synthesizer

export type BgmTrack =
  | 'TOWN'
  | 'DUNGEON_EARLY'
  | 'DUNGEON_DEEP'
  | 'BOSS'
  | 'BOSS_RUSH'
  | 'VICTORY'
  | 'DEFEAT';

interface BgmTrackData {
  stepMs: number;
  stepsPerLoop: number;
  leadType: OscillatorType;
  arpType: OscillatorType;
  bassType: OscillatorType;
  leadVol: number;
  arpVol: number;
  bassVol: number;
  drumVol: number;
  /** Note name (e.g. 'C5', 'F#4') or null for rest, per 16th/8th step */
  lead: (string | null)[];
  arp: (string | null)[];
  bass: (string | null)[];
  /** 'K' = kick, 'S' = snare/hat, null = silent */
  drums?: ('K' | 'S' | null)[];
}

const NOTE_FREQ: Record<string, number> = {
  D2: 73.42,
  E2: 82.41,
  F2: 87.31,
  'F#2': 92.5,
  G2: 98.0,
  'G#2': 103.83,
  A2: 110.0,
  Bb2: 116.54,
  B2: 123.47,
  C3: 130.81,
  'C#3': 138.59,
  D3: 146.83,
  Eb3: 155.56,
  E3: 164.81,
  F3: 174.61,
  'F#3': 185.0,
  G3: 196.0,
  'G#3': 207.65,
  A3: 220.0,
  Bb3: 233.08,
  B3: 246.94,
  C4: 261.63,
  'C#4': 277.18,
  D4: 293.66,
  Eb4: 311.13,
  E4: 329.63,
  F4: 349.23,
  'F#4': 369.99,
  G4: 392.0,
  'G#4': 415.3,
  A4: 440.0,
  Bb4: 466.16,
  B4: 493.88,
  C5: 523.25,
  'C#5': 554.37,
  D5: 587.33,
  Eb5: 622.25,
  E5: 659.25,
  F5: 698.46,
  'F#5': 739.99,
  G5: 783.99,
  'G#5': 830.61,
  A5: 880.0,
  Bb5: 932.33,
  B5: 987.77,
  C6: 1046.5,
};

// 32-step (2-bar or 4-bar 8th/16th patterns) chiptune compositions
const BGM_TRACKS: Record<BgmTrack, BgmTrackData> = {
  // Warm cozy RPG town / guild hall (C major / A minor)
  TOWN: {
    stepMs: 225,
    stepsPerLoop: 32,
    leadType: 'triangle',
    arpType: 'triangle',
    bassType: 'triangle',
    leadVol: 0.095,
    arpVol: 0.04,
    bassVol: 0.075,
    drumVol: 0,
    lead: [
      'E5', null, 'G5', null, 'C5', null, 'D5', null,
      'E5', null, 'D5', 'C5', 'D5', null, null, null,
      'F5', null, 'E5', null, 'D5', null, 'C5', null,
      'B4', null, 'C5', 'D5', 'C5', null, null, null,
    ],
    arp: [
      'C4', 'E4', 'G4', 'E4', 'A3', 'C4', 'E4', 'C4',
      'F3', 'A3', 'C4', 'A3', 'G3', 'B3', 'D4', 'B3',
      'F3', 'A3', 'C4', 'A3', 'E3', 'G3', 'C4', 'G3',
      'G3', 'B3', 'D4', 'B3', 'C4', 'E4', 'G4', 'E4',
    ],
    bass: [
      'C3', null, null, 'G2', 'A2', null, null, 'E2',
      'F2', null, null, 'C3', 'G2', null, 'D3', null,
      'F2', null, null, 'C3', 'E2', null, null, 'C3',
      'G2', null, null, 'G2', 'C3', null, 'G2', null,
    ],
  },

  // Brisk adventurous dungeon crawl (Stages 1-3, D minor)
  DUNGEON_EARLY: {
    stepMs: 170,
    stepsPerLoop: 32,
    leadType: 'square',
    arpType: 'triangle',
    bassType: 'triangle',
    leadVol: 0.048,
    arpVol: 0.04,
    bassVol: 0.075,
    drumVol: 0.025,
    lead: [
      'D5', null, 'A4', 'C5', 'D5', null, 'F5', null,
      'E5', null, 'C5', 'A4', 'C5', null, null, null,
      'D5', null, 'F5', 'G5', 'A5', null, 'G5', 'F5',
      'E5', null, 'D5', 'C#5', 'D5', null, null, null,
    ],
    arp: [
      'D4', 'F4', 'A4', 'F4', 'D4', 'F4', 'A4', 'F4',
      'C4', 'E4', 'G4', 'E4', 'A3', 'C4', 'E4', 'C4',
      'Bb3', 'D4', 'F4', 'D4', 'C4', 'E4', 'G4', 'E4',
      'A3', 'C#4', 'E4', 'A4', 'D4', 'F4', 'A4', null,
    ],
    bass: [
      'D3', null, 'D3', null, 'D3', null, 'A2', null,
      'C3', null, 'C3', null, 'A2', null, 'E2', null,
      'Bb2', null, 'Bb2', null, 'C3', null, 'C3', null,
      'A2', null, 'A2', null, 'D3', null, 'A2', null,
    ],
    drums: [
      'K', null, 'S', null, 'K', null, 'S', null,
      'K', null, 'S', null, 'K', 'K', 'S', null,
      'K', null, 'S', null, 'K', null, 'S', null,
      'K', null, 'S', null, 'K', null, 'S', 'S',
    ],
  },

  // Mysterious deep abyss / secret stages / Endless corridor (E minor)
  DUNGEON_DEEP: {
    stepMs: 155,
    stepsPerLoop: 32,
    leadType: 'square',
    arpType: 'square',
    bassType: 'triangle',
    leadVol: 0.045,
    arpVol: 0.024,
    bassVol: 0.08,
    drumVol: 0.028,
    lead: [
      'E5', null, 'B4', 'C5', 'D5', null, 'B4', null,
      'C5', 'B4', 'A4', 'G4', 'F#4', null, 'B4', null,
      'E5', null, 'F#5', 'G5', 'F#5', 'E5', 'D5', 'C5',
      'B4', null, 'Eb5', 'F#5', 'E5', null, null, null,
    ],
    arp: [
      'E3', 'G3', 'B3', 'E4', 'B3', 'G3', 'E3', 'B3',
      'C3', 'E3', 'G3', 'C4', 'B2', 'Eb3', 'F#3', 'B3',
      'E3', 'G3', 'B3', 'E4', 'D3', 'F#3', 'A3', 'D4',
      'B2', 'Eb3', 'F#3', 'B3', 'E3', 'B3', 'G3', 'E3',
    ],
    bass: [
      'E2', null, 'E3', null, 'E2', null, 'B2', null,
      'C3', null, 'G2', null, 'B2', null, 'F#2', null,
      'E2', null, 'B2', null, 'D3', null, 'A2', null,
      'B2', null, 'B2', 'F#2', 'E2', null, 'B2', null,
    ],
    drums: [
      'K', null, 'S', null, 'K', 'S', null, 'S',
      'K', null, 'S', null, 'K', null, 'S', 'S',
      'K', null, 'S', null, 'K', 'S', null, 'S',
      'K', 'K', 'S', null, 'K', null, 'S', 'S',
    ],
  },

  // Urgent boss battle theme (C minor)
  BOSS: {
    stepMs: 132,
    stepsPerLoop: 32,
    leadType: 'sawtooth',
    arpType: 'square',
    bassType: 'sawtooth',
    leadVol: 0.042,
    arpVol: 0.028,
    bassVol: 0.042,
    drumVol: 0.036,
    lead: [
      'C5', null, 'Eb5', 'G5', 'F5', null, 'Eb5', 'D5',
      'Eb5', null, 'C5', 'G4', 'Bb4', null, 'B4', null,
      'C5', 'D5', 'Eb5', 'G5', 'G#5', null, 'G5', 'F5',
      'Eb5', 'D5', 'C5', 'B4', 'C5', null, null, null,
    ],
    arp: [
      'C4', 'Eb4', 'G4', 'Eb4', 'C4', 'Eb4', 'G4', 'Eb4',
      'G#3', 'C4', 'Eb4', 'C4', 'G3', 'B3', 'D4', 'B3',
      'C4', 'Eb4', 'G4', 'Eb4', 'F3', 'G#3', 'C4', 'G#3',
      'G3', 'B3', 'D4', 'G4', 'C4', 'Eb4', 'G4', 'C5',
    ],
    bass: [
      'C3', 'C3', 'G2', 'C3', 'C3', 'C3', 'Eb3', 'D3',
      'G#2', 'G#2', 'Eb2', 'G#2', 'G2', 'G2', 'B2', 'D3',
      'C3', 'C3', 'G2', 'C3', 'F2', 'F2', 'C3', 'F2',
      'G2', 'G2', 'B2', 'D3', 'C3', null, 'G2', null,
    ],
    drums: [
      'K', 'S', 'K', 'S', 'K', 'S', 'K', 'S',
      'K', 'S', 'K', 'S', 'K', 'K', 'S', 'S',
      'K', 'S', 'K', 'S', 'K', 'S', 'K', 'S',
      'K', 'K', 'S', 'K', 'K', 'S', 'S', 'S',
    ],
  },

  // Hyper-intense Enhanced Boss Rush / Deep Endless Boss (B minor)
  BOSS_RUSH: {
    stepMs: 118,
    stepsPerLoop: 32,
    leadType: 'sawtooth',
    arpType: 'square',
    bassType: 'sawtooth',
    leadVol: 0.045,
    arpVol: 0.032,
    bassVol: 0.046,
    drumVol: 0.04,
    lead: [
      'B4', 'F#5', 'E5', 'D5', 'C#5', 'D5', 'E5', 'F#5',
      'G5', null, 'F#5', 'E5', 'D5', 'C#5', 'B4', 'F#4',
      'B4', 'D5', 'F#5', 'B5', 'A5', 'G5', 'F#5', 'E5',
      'F#5', 'G5', 'A5', 'Bb5', 'B5', null, null, null,
    ],
    arp: [
      'B3', 'D4', 'F#4', 'B4', 'B3', 'D4', 'F#4', 'B4',
      'G3', 'B3', 'D4', 'G4', 'A3', 'C#4', 'E4', 'A4',
      'B3', 'D4', 'F#4', 'B4', 'E3', 'G3', 'B3', 'E4',
      'F#3', 'Bb3', 'C#4', 'F#4', 'B3', 'F#4', 'D4', 'B3',
    ],
    bass: [
      'B2', 'B2', 'F#2', 'B2', 'B2', 'B2', 'D3', 'C#3',
      'G2', 'G2', 'D2', 'G2', 'A2', 'A2', 'E2', 'A2',
      'B2', 'B2', 'F#2', 'B2', 'E2', 'E2', 'B2', 'E2',
      'F#2', 'F#2', 'C#3', 'F#2', 'B2', 'F#2', 'B2', null,
    ],
    drums: [
      'K', 'S', 'K', 'S', 'K', 'S', 'K', 'S',
      'K', 'S', 'K', 'S', 'K', 'S', 'K', 'S',
      'K', 'S', 'K', 'S', 'K', 'S', 'K', 'S',
      'K', 'K', 'S', 'K', 'K', 'K', 'S', 'S',
    ],
  },

  // Celebratory clear/summary loop (C major)
  VICTORY: {
    stepMs: 195,
    stepsPerLoop: 32,
    leadType: 'triangle',
    arpType: 'triangle',
    bassType: 'triangle',
    leadVol: 0.09,
    arpVol: 0.045,
    bassVol: 0.075,
    drumVol: 0.018,
    lead: [
      'C5', null, 'E5', 'G5', 'C6', null, 'B5', 'A5',
      'G5', null, 'E5', 'F5', 'G5', null, null, null,
      'F5', null, 'G5', 'A5', 'G5', null, 'E5', 'C5',
      'D5', null, 'E5', 'D5', 'C5', null, null, null,
    ],
    arp: [
      'C4', 'E4', 'G4', 'C5', 'A3', 'C4', 'E4', 'A4',
      'E3', 'G3', 'B3', 'E4', 'G3', 'B3', 'D4', 'G4',
      'F3', 'A3', 'C4', 'F4', 'C4', 'E4', 'G4', 'C5',
      'G3', 'B3', 'D4', 'G4', 'C4', 'E4', 'G4', 'C5',
    ],
    bass: [
      'C3', null, 'G2', null, 'A2', null, 'E2', null,
      'E2', null, 'B2', null, 'G2', null, 'D3', null,
      'F2', null, 'C3', null, 'C3', null, 'G2', null,
      'G2', null, 'D3', null, 'C3', null, 'G2', null,
    ],
    drums: [
      'K', null, 'S', null, 'K', null, 'S', null,
      'K', null, 'S', null, 'K', null, 'S', null,
      'K', null, 'S', null, 'K', null, 'S', null,
      'K', null, 'S', null, 'K', null, 'S', null,
    ],
  },

  // Gentle somber inn / regroup loop on defeat (A minor)
  DEFEAT: {
    stepMs: 265,
    stepsPerLoop: 16,
    leadType: 'triangle',
    arpType: 'triangle',
    bassType: 'triangle',
    leadVol: 0.08,
    arpVol: 0.038,
    bassVol: 0.065,
    drumVol: 0,
    lead: [
      'E5', null, 'C5', 'B4', 'A4', null, 'E4', null,
      'F4', null, 'G4', 'F4', 'E4', null, null, null,
    ],
    arp: [
      'A3', 'C4', 'E4', 'C4', 'E3', 'G3', 'B3', 'G3',
      'F3', 'A3', 'C4', 'A3', 'E3', 'G#3', 'B3', 'E4',
    ],
    bass: [
      'A2', null, null, 'E2', 'E2', null, null, 'B2',
      'F2', null, null, 'C3', 'E2', null, 'B2', null,
    ],
  },
};

export const BGM_TRACK_LABELS: Record<BgmTrack, string> = {
  TOWN: '拠点の酒場',
  DUNGEON_EARLY: '迷宮探索',
  DUNGEON_DEEP: '深淵の回廊',
  BOSS: '強敵ボス戦',
  BOSS_RUSH: '極限連戦',
  VICTORY: '勝利の凱旋',
  DEFEAT: '休息と再起',
};

const BGM_MUTE_STORAGE_KEY = 'pixel_labyrinth_bgm_muted_v1';

function loadInitialBgmMuted(): boolean {
  try {
    return localStorage.getItem(BGM_MUTE_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

class RetroSound {
  private ctx: AudioContext | null = null;
  private bgmMasterGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  public muted = false;
  public bgmMuted = loadInitialBgmMuted();
  private bgmDucked = false;
  private lastPlayed: Record<string, number> = {};

  private desiredTrack: BgmTrack | null = null;
  private activeTrack: BgmTrack | null = null;
  private schedulerTimer: number | null = null;
  private nextStepTime = 0;
  private stepIndex = 0;
  private bgmEpoch = 0;
  private bgmNodes = new Set<AudioNode>();

  private canPlay(key: string, minIntervalMs: number): boolean {
    const now = performance.now();
    const prev = this.lastPlayed[key] ?? 0;
    if (now - prev < minIntervalMs) return false;
    this.lastPlayed[key] = now;
    return true;
  }

  private ensureContext(allowWhenMuted = false): AudioContext | null {
    if (!allowWhenMuted && this.muted) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (!this.bgmMasterGain && this.ctx) {
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 3400; // Soften harsh square harmonics
      gain.gain.value = this.getTargetBgmGain();
      gain.connect(filter);
      filter.connect(this.ctx.destination);
      this.bgmMasterGain = gain;
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private getTargetBgmGain(): number {
    if (this.muted || this.bgmMuted) return 0;
    return this.bgmDucked ? 0.32 : 0.85;
  }

  private updateBgmGain() {
    if (!this.ctx || !this.bgmMasterGain) return;
    const now = this.ctx.currentTime;
    this.bgmMasterGain.gain.cancelScheduledValues(now);
    this.bgmMasterGain.gain.setTargetAtTime(this.getTargetBgmGain(), now, 0.06);
  }

  /** Called on first user interaction so browser AudioContext unlocks cleanly */
  public unlockAudio() {
    const ctx = this.ensureContext(true);
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    this.syncBgmLoop();
  }

  public setMuted(nextMuted: boolean) {
    this.muted = nextMuted;
    this.updateBgmGain();
    this.syncBgmLoop();
  }

  public setBgmMuted(nextBgmMuted: boolean) {
    this.bgmMuted = nextBgmMuted;
    try {
      localStorage.setItem(BGM_MUTE_STORAGE_KEY, nextBgmMuted ? '1' : '0');
    } catch {
      // Ignore storage errors
    }
    this.updateBgmGain();
    this.syncBgmLoop();
  }

  public setBgmDucked(ducked: boolean) {
    if (this.bgmDucked === ducked) return;
    this.bgmDucked = ducked;
    this.updateBgmGain();
  }

  public setBgmTrack(track: BgmTrack | null) {
    if (this.desiredTrack === track && (track === null || this.schedulerTimer !== null)) {
      return;
    }
    this.desiredTrack = track;
    this.syncBgmLoop();
  }

  private stopScheduler() {
    this.bgmEpoch += 1;
    if (this.schedulerTimer !== null) {
      window.clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
    this.bgmNodes.forEach((node) => {
      try {
        if ('stop' in node && typeof (node as OscillatorNode).stop === 'function') {
          (node as OscillatorNode).stop();
        }
        node.disconnect();
      } catch {
        // Node may already be stopped
      }
    });
    this.bgmNodes.clear();
    this.activeTrack = null;
  }

  private syncBgmLoop() {
    if (!this.desiredTrack || this.muted || this.bgmMuted) {
      this.stopScheduler();
      return;
    }
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      // Wait for user interaction via unlockAudio()
      return;
    }
    if (this.activeTrack === this.desiredTrack && this.schedulerTimer !== null) {
      return;
    }

    this.stopScheduler();
    const track = this.desiredTrack;
    this.activeTrack = track;
    const epoch = this.bgmEpoch;
    this.stepIndex = 0;
    this.nextStepTime = ctx.currentTime + 0.05;

    const scheduleAheadSec = 0.16;
    const tick = () => {
      if (epoch !== this.bgmEpoch || !this.ctx || !this.bgmMasterGain) return;
      if (this.muted || this.bgmMuted || this.ctx.state !== 'running') return;
      const data = BGM_TRACKS[track];
      const stepSec = data.stepMs / 1000;

      // Guard against huge catchup after tab backgrounding
      if (this.ctx.currentTime - this.nextStepTime > 0.5) {
        this.nextStepTime = this.ctx.currentTime + 0.04;
      }

      while (this.nextStepTime < this.ctx.currentTime + scheduleAheadSec) {
        this.scheduleBgmStep(this.ctx, this.bgmMasterGain, data, this.stepIndex, this.nextStepTime);
        this.nextStepTime += stepSec;
        this.stepIndex = (this.stepIndex + 1) % data.stepsPerLoop;
      }
    };

    tick();
    this.schedulerTimer = window.setInterval(tick, 55);
  }

  private scheduleBgmTone(
    ctx: AudioContext,
    dest: AudioNode,
    freq: number,
    startTime: number,
    durationSec: number,
    type: OscillatorType,
    volume: number
  ) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec);

    osc.connect(gain);
    gain.connect(dest);

    this.bgmNodes.add(osc);
    osc.onended = () => {
      this.bgmNodes.delete(osc);
      try {
        osc.disconnect();
        gain.disconnect();
      } catch {
        // Ignore cleanup errors
      }
    };
    osc.start(startTime);
    osc.stop(startTime + durationSec + 0.015);
  }

  private getNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.noiseBuffer) return this.noiseBuffer;
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * 0.08);
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
    return buffer;
  }

  private scheduleBgmDrum(
    ctx: AudioContext,
    dest: AudioNode,
    kind: 'K' | 'S',
    startTime: number,
    volume: number
  ) {
    if (kind === 'K') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(125, startTime);
      osc.frequency.exponentialRampToValueAtTime(42, startTime + 0.07);
      gain.gain.setValueAtTime(volume * 1.4, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.075);
      osc.connect(gain);
      gain.connect(dest);
      this.bgmNodes.add(osc);
      osc.onended = () => {
        this.bgmNodes.delete(osc);
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {
          // Ignore
        }
      };
      osc.start(startTime);
      osc.stop(startTime + 0.085);
      return;
    }

    const src = ctx.createBufferSource();
    src.buffer = this.getNoiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1800;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.75, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.045);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    this.bgmNodes.add(src);
    src.onended = () => {
      this.bgmNodes.delete(src);
      try {
        src.disconnect();
        filter.disconnect();
        gain.disconnect();
      } catch {
        // Ignore
      }
    };
    src.start(startTime);
    src.stop(startTime + 0.055);
  }

  private scheduleBgmStep(
    ctx: AudioContext,
    dest: AudioNode,
    data: BgmTrackData,
    step: number,
    startTime: number
  ) {
    const stepSec = data.stepMs / 1000;
    const leadNote = data.lead[step];
    if (leadNote && NOTE_FREQ[leadNote]) {
      // Sustain across following rests up to 3 steps for lyrical phrasing
      let span = 1;
      while (
        span < 3 &&
        step + span < data.stepsPerLoop &&
        data.lead[step + span] === null
      ) {
        span += 1;
      }
      this.scheduleBgmTone(
        ctx,
        dest,
        NOTE_FREQ[leadNote],
        startTime,
        Math.max(0.08, stepSec * span * 0.88),
        data.leadType,
        data.leadVol
      );
    }

    const arpNote = data.arp[step];
    if (arpNote && NOTE_FREQ[arpNote]) {
      this.scheduleBgmTone(
        ctx,
        dest,
        NOTE_FREQ[arpNote],
        startTime,
        stepSec * 0.75,
        data.arpType,
        data.arpVol
      );
    }

    const bassNote = data.bass[step];
    if (bassNote && NOTE_FREQ[bassNote]) {
      this.scheduleBgmTone(
        ctx,
        dest,
        NOTE_FREQ[bassNote],
        startTime,
        stepSec * 1.1,
        data.bassType,
        data.bassVol
      );
    }

    const drum = data.drums?.[step];
    if (drum && data.drumVol > 0) {
      this.scheduleBgmDrum(ctx, dest, drum, startTime, data.drumVol);
    }
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'square',
    volume = 0.06,
    freqEnd?: number,
    delay = 0
  ) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (freqEnd !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, freqEnd), now + duration);
    }

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.01);
  }

  click() {
    this.playTone(540, 0.05, 'square', 0.04, 680);
  }

  buy() {
    this.playTone(523, 0.07, 'square', 0.05);
    this.playTone(784, 0.1, 'square', 0.05, undefined, 0.07);
  }

  equip() {
    this.playTone(420, 0.06, 'triangle', 0.06, 560);
  }

  hit(isCrit = false) {
    if (!this.canPlay('hit', 50)) return;
    if (isCrit) {
      this.playTone(260, 0.09, 'sawtooth', 0.06, 90);
      this.playTone(880, 0.08, 'square', 0.04, 440, 0.02);
    } else {
      this.playTone(190, 0.06, 'square', 0.04, 95);
    }
  }

  heal() {
    if (!this.canPlay('heal', 75)) return;
    this.playTone(523, 0.09, 'triangle', 0.05);
    this.playTone(659, 0.09, 'triangle', 0.05, undefined, 0.08);
    this.playTone(784, 0.14, 'triangle', 0.05, undefined, 0.16);
  }

  coin() {
    if (!this.canPlay('coin', 65)) return;
    this.playTone(988, 0.06, 'square', 0.04);
    this.playTone(1319, 0.12, 'square', 0.04, undefined, 0.06);
  }

  bomb() {
    if (!this.canPlay('bomb', 80)) return;
    this.playTone(130, 0.22, 'sawtooth', 0.07, 45);
  }

  victory() {
    const notes = [523, 659, 784, 1046];
    notes.forEach((n, idx) => {
      this.playTone(n, idx === 3 ? 0.28 : 0.11, 'square', 0.05, undefined, idx * 0.11);
    });
  }

  defeat() {
    const notes = [392, 349, 311, 261];
    notes.forEach((n, idx) => {
      this.playTone(n, idx === 3 ? 0.3 : 0.14, 'triangle', 0.06, undefined, idx * 0.14);
    });
  }

  bossWarning(enhanced = false) {
    if (!this.canPlay('bossWarning', 380)) return;
    this.playTone(196, 0.24, 'sawtooth', 0.06, 130, 0);
    this.playTone(196, 0.28, 'sawtooth', 0.065, 115, 0.34);
    if (enhanced) {
      this.playTone(98, 0.28, 'square', 0.05, 72, 0);
      this.playTone(98, 0.32, 'square', 0.055, 65, 0.34);
    }
  }
}

export const sound = new RetroSound();
