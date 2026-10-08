/**
 * Audio utilities.
 *
 *  - A single shared AudioContext (browsers allow only a handful).
 *  - `AmbientScore`: a generative, royalty-free score (tanpura drone, slow pad and
 *    sparse pentatonic "sitar" plucks with reverb) so the invitation has music
 *    without shipping a copyrighted track. Swap in a real file via `music.src`.
 *  - `playChime`: the sparkle played when the scratch card is revealed.
 */

let ctx: AudioContext | null = null;
let sfxEnabled = true;

export const setSfxEnabled = (v: boolean) => {
  sfxEnabled = v;
};

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor: typeof AudioContext | undefined =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      ctx = new Ctor();
    } catch {
      return null;
    }
  }
  return ctx;
}

/** Call from a user gesture. */
export async function unlockAudio(): Promise<AudioContext | null> {
  const c = getAudioContext();
  if (c && c.state === 'suspended') {
    try {
      await c.resume();
    } catch {
      /* ignore */
    }
  }
  return c;
}

export function playChime(volume = 0.16) {
  const c = getAudioContext();
  if (!c || !sfxEnabled || c.state !== 'running') return;
  const now = c.currentTime;
  const out = c.createGain();
  out.gain.value = volume;
  out.connect(c.destination);
  [783.99, 1174.66, 1567.98, 2349.32, 3135.96].forEach((f, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'sine';
    o.frequency.value = f;
    const t = now + i * 0.085;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(1 / (i + 1.4), t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + 2.6);
  });
}

/* ───────────────────────────── Ambient score ───────────────────────────── */

const SA = 146.83; // D3
const SCALE = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3]; // Sa Re Ga Pa Dha  (Bhoopali-like, very consonant)
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const noteFreq = (degree: number) => SA * 2 * SCALE[((degree % 5) + 5) % 5] * Math.pow(2, Math.floor(degree / 5));

export class AmbientScore {
  private c: AudioContext;
  private master: GainNode;
  private dry: GainNode;
  private send: GainNode;
  private delaySend: GainNode;
  private padNodes: { osc: OscillatorNode[]; gain: GainNode; lfo: OscillatorNode } | null = null;
  private timers = new Set<number>();
  private running = false;
  private volume: number;
  private tanpuraStep = 0;
  private degree = 7;

  constructor(c: AudioContext, volume = 0.6) {
    this.c = c;
    this.volume = volume;

    this.master = c.createGain();
    this.master.gain.value = 0;
    const tone = c.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = 5200;
    const comp = c.createDynamicsCompressor();
    comp.threshold.value = -20;
    comp.ratio.value = 3;
    this.master.connect(tone).connect(comp).connect(c.destination);

    this.dry = c.createGain();
    this.dry.gain.value = 0.9;
    this.dry.connect(this.master);

    // lush reverb from a synthesised impulse response
    const len = Math.floor(c.sampleRate * 3.8);
    const ir = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    const conv = c.createConvolver();
    conv.buffer = ir;
    const wet = c.createGain();
    wet.gain.value = 0.85;
    this.send = c.createGain();
    this.send.gain.value = 1;
    this.send.connect(conv).connect(wet).connect(this.master);

    // soft feedback echo
    const delay = c.createDelay(1.5);
    delay.delayTime.value = 0.46;
    const fb = c.createGain();
    fb.gain.value = 0.33;
    const dl = c.createBiquadFilter();
    dl.type = 'lowpass';
    dl.frequency.value = 2200;
    this.delaySend = c.createGain();
    this.delaySend.gain.value = 1;
    this.delaySend.connect(delay);
    delay.connect(dl).connect(fb).connect(delay);
    dl.connect(this.master);
    dl.connect(this.send);
  }

  setVolume(v: number) {
    this.volume = v;
    if (this.running) this.master.gain.setTargetAtTime(v * 0.9, this.c.currentTime, 0.4);
  }

  start() {
    if (this.running) return;
    this.running = true;
    const t = this.c.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setValueAtTime(this.master.gain.value, t);
    this.master.gain.linearRampToValueAtTime(this.volume * 0.9, t + 3.5);
    this.startPad();
    this.tanpura();
    this.later(() => this.phrase(), 2200);
  }

  stop(fade = 1.2) {
    if (!this.running) return;
    this.running = false;
    const t = this.c.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setValueAtTime(this.master.gain.value, t);
    this.master.gain.linearRampToValueAtTime(0, t + fade);
    this.timers.forEach((id) => window.clearTimeout(id));
    this.timers.clear();
    const pad = this.padNodes;
    this.padNodes = null;
    window.setTimeout(() => {
      if (!pad) return;
      pad.osc.forEach((o) => {
        try {
          o.stop();
        } catch {
          /* already stopped */
        }
      });
      try {
        pad.lfo.stop();
      } catch {
        /* already stopped */
      }
    }, fade * 1000 + 100);
  }

  private later(fn: () => void, ms: number) {
    const id = window.setTimeout(() => {
      this.timers.delete(id);
      if (this.running) fn();
    }, ms);
    this.timers.add(id);
  }

  /* slow evolving pad: Sa · Pa · Sa' */
  private startPad() {
    const c = this.c;
    const g = c.createGain();
    g.gain.value = 0.055;
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    lfo.frequency.value = 0.07;
    lfoGain.gain.value = 0.03;
    lfo.connect(lfoGain).connect(g.gain);
    lfo.start();
    const oscs = [SA, SA * 1.5, SA * 2, SA * 3].map((f, i) => {
      const o = c.createOscillator();
      o.type = i === 3 ? 'sine' : 'triangle';
      o.frequency.value = f;
      o.detune.value = rand(-6, 6);
      const og = c.createGain();
      og.gain.value = i === 3 ? 0.25 : 1;
      o.connect(og).connect(g);
      o.start();
      return o;
    });
    g.connect(this.dry);
    g.connect(this.send);
    this.padNodes = { osc: oscs, gain: g, lfo };
  }

  /* tanpura: Pa(low) – Sa – Sa – Sa(low) */
  private tanpura() {
    const ratios = [0.75, 1, 1, 0.5];
    const f = SA * ratios[this.tanpuraStep % 4];
    this.tanpuraStep++;
    const c = this.c;
    const t = c.currentTime;
    const g = c.createGain();
    const filt = c.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(1400, t);
    filt.frequency.exponentialRampToValueAtTime(380, t + 3.2);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.13, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 4.6);
    [-3, 3].forEach((det) => {
      const o = c.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = f;
      o.detune.value = det;
      o.connect(filt);
      o.start(t);
      o.stop(t + 4.8);
    });
    filt.connect(g);
    g.connect(this.dry);
    g.connect(this.send);
    this.later(() => this.tanpura(), 1250 + rand(-60, 90));
  }

  /* a short melodic phrase followed by silence */
  private phrase() {
    const count = Math.floor(rand(3, 8));
    let at = 0;
    for (let i = 0; i < count; i++) {
      const step = [-2, -1, -1, 1, 1, 2][Math.floor(Math.random() * 6)];
      this.degree = Math.min(13, Math.max(3, this.degree + step));
      const d = this.degree;
      this.later(() => this.pluck(noteFreq(d - 5)), at);
      at += rand(520, 1150) * (Math.random() < 0.18 ? 1.8 : 1);
    }
    if (Math.random() < 0.55) {
      // an octave above the last plucked note
      this.later(() => this.bell(noteFreq(this.degree)), at * 0.5);
    }
    this.later(() => this.phrase(), at + rand(3200, 6500));
  }

  private pluck(freq: number) {
    const c = this.c;
    const t = c.currentTime;
    const g = c.createGain();
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.Q.value = 2;
    f.frequency.setValueAtTime(3600, t);
    f.frequency.exponentialRampToValueAtTime(520, t + 1.1);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.17, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 3.0);
    const o1 = c.createOscillator();
    o1.type = 'triangle';
    o1.frequency.value = freq;
    const o2 = c.createOscillator();
    o2.type = 'sawtooth';
    o2.frequency.value = freq * 2.003;
    const o2g = c.createGain();
    o2g.gain.value = 0.18;
    o1.connect(f);
    o2.connect(o2g).connect(f);
    f.connect(g);
    g.connect(this.dry);
    g.connect(this.send);
    g.connect(this.delaySend);
    o1.start(t);
    o2.start(t);
    o1.stop(t + 3.2);
    o2.stop(t + 3.2);
  }

  private bell(freq: number) {
    const c = this.c;
    const t = c.currentTime;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 4.5);
    [1, 2.76, 5.4].forEach((m, i) => {
      const o = c.createOscillator();
      o.type = 'sine';
      o.frequency.value = freq * m;
      const og = c.createGain();
      og.gain.value = 1 / (i + 1) ** 2;
      o.connect(og).connect(g);
      o.start(t);
      o.stop(t + 4.6);
    });
    g.connect(this.send);
    g.connect(this.dry);
  }
}
