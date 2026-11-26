// Suoni generati con Web Audio: nessun file, nessuna libreria.
export class Suoni {
  constructor(ctx) {
    this.ctx = ctx;
    this.ac = null;
    this.out = null;
    ctx.suAudio((on) => this.volume(on));
  }

  avvia() {
    if (this.ac) { if (this.ac.state === 'suspended') this.ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ac = (this.ac = new AC());
    this.out = ac.createGain();
    this.out.gain.value = this.ctx.audio ? 1 : 0;
    this.out.connect(ac.destination);
    // ronzio dei neon
    const lp = ac.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 420;
    lp.connect(this.out);
    for (const [f, tipo, g] of [[50, 'sine', 0.03], [100, 'sawtooth', 0.005], [100.4, 'sawtooth', 0.005], [150, 'triangle', 0.003]]) {
      const o = ac.createOscillator();
      o.type = tipo;
      o.frequency.value = f;
      const gg = ac.createGain();
      gg.gain.value = g;
      o.connect(gg).connect(lp);
      o.start();
    }
    // pad lontano e sognante
    const pad = ac.createGain();
    pad.gain.value = 0.011;
    pad.connect(this.out);
    for (const f of [220, 277.18, 329.63, 415.3]) {
      const o = ac.createOscillator();
      o.frequency.value = f;
      const lfo = ac.createOscillator();
      lfo.frequency.value = 0.04 + Math.random() * 0.05;
      const lg = ac.createGain();
      lg.gain.value = 2;
      lfo.connect(lg).connect(o.detune);
      o.connect(pad);
      o.start();
      lfo.start();
    }
  }

  volume(on) {
    if (this.out) this.out.gain.setTargetAtTime(on ? 1 : 0, this.ac.currentTime, 0.1);
  }

  rumore(durata, freq, q, gain) {
    const ac = this.ac;
    if (!ac) return;
    const n = Math.floor(ac.sampleRate * durata);
    const buf = ac.createBuffer(1, n, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = ac.createBufferSource();
    src.buffer = buf;
    const bp = ac.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = freq;
    bp.Q.value = q;
    const g = ac.createGain();
    g.gain.value = gain;
    src.connect(bp).connect(g).connect(this.out);
    src.start();
  }

  // il curatore sfoglia il copione
  fruscio() {
    if (!this.ac) return;
    for (let i = 0; i < 4; i++) setTimeout(() => this.rumore(0.12, 2500 + Math.random() * 1500, 0.8, 0.35), i * 140 + Math.random() * 60);
  }

  nota(f, t0, dur, tipo = 'square', g = 0.05) {
    const ac = this.ac;
    if (!ac) return;
    const o = ac.createOscillator();
    o.type = tipo;
    o.frequency.value = f;
    const gg = ac.createGain();
    gg.gain.setValueAtTime(g, ac.currentTime + t0);
    gg.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + t0 + dur);
    o.connect(gg).connect(this.out);
    o.start(ac.currentTime + t0);
    o.stop(ac.currentTime + t0 + dur + 0.02);
  }

  // finestra aperta: arpeggio a pixel, diverso per le due finestre
  finestra(i) {
    const base = i === 0 ? [523.25, 659.25, 783.99] : [783.99, 659.25, 523.25];
    base.forEach((f, k) => this.nota(f, k * 0.045, 0.09, 'square', 0.035));
  }

  errore() { this.nota(140, 0, 0.18, 'square', 0.04); this.nota(110, 0.09, 0.2, 'square', 0.04); }
  passaggio() { this.rumore(0.35, 900, 0.6, 0.25); }
  presa() { this.nota(330, 0, 0.06, 'triangle', 0.06); }
  finale() { [392, 493.88, 587.33, 783.99].forEach((f, k) => this.nota(f, k * 0.18, 1.2, 'sine', 0.05)); }
}
