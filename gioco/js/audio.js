// Suoni generati con Web Audio: nessun file, nessuna libreria.
export class Suoni {
  constructor(ctx) {
    this.ctx = ctx;
    this.ac = null;
    this.out = null;
    this.livelli = { ronzio: 1, acqua: 0, pioggia: 0, gocce: 0, legno: 0 };
    this.obiettivo = { ...this.livelli };
    this.prossimaGoccia = 0;
    this.prossimoLegno = 0;
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
    this.gRonzio = ac.createGain();
    this.gRonzio.connect(this.out);
    lp.connect(this.gRonzio);
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

  // rumore in loop filtrato, con un gain controllabile
  loop(tipo, freq, q, lfoFreq = 0, lfoProf = 0) {
    const ac = this.ac;
    const n = ac.sampleRate * 3;
    const buf = ac.createBuffer(2, n, ac.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      let b = 0;
      for (let i = 0; i < n; i++) { b = 0.97 * b + 0.03 * (Math.random() * 2 - 1); d[i] = tipo === 'marrone' ? b * 6 : Math.random() * 2 - 1; }
    }
    const src = ac.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const f = ac.createBiquadFilter();
    f.type = tipo === 'acuto' ? 'highpass' : 'bandpass';
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ac.createGain();
    g.gain.value = 0;
    src.connect(f).connect(g).connect(this.out);
    if (lfoFreq) {
      const lfo = ac.createOscillator();
      lfo.frequency.value = lfoFreq;
      const lg = ac.createGain();
      lg.gain.value = lfoProf;
      lfo.connect(lg).connect(f.frequency);
      lfo.start();
    }
    src.start();
    return g;
  }

  // livelli d'ambiente della stanza corrente: { ronzio, acqua, pioggia, gocce, legno }
  ambiente(liv) { this.obiettivo = { ronzio: 1, acqua: 0, pioggia: 0, gocce: 0, legno: 0, ...liv }; }

  aggiorna(dt) {
    if (!this.ac) return;
    if (!this.gAcqua) {
      this.gAcqua = this.loop('marrone', 700, 0.7, 0.35, 260);
      this.gAcqua2 = this.loop('bianco', 2200, 1.4, 0.8, 600);
      this.gPioggia = this.loop('acuto', 1500, 0.5);
    }
    const k = 1 - Math.exp(-1.5 * dt);
    for (const c of Object.keys(this.livelli)) this.livelli[c] += (this.obiettivo[c] - this.livelli[c]) * k;
    const L = this.livelli;
    const t = this.ac.currentTime;
    this.gRonzio.gain.setTargetAtTime(L.ronzio, t, 0.1);
    this.gAcqua.gain.setTargetAtTime(L.acqua * 0.5, t, 0.1);
    this.gAcqua2.gain.setTargetAtTime(L.acqua * 0.06, t, 0.1);
    this.gPioggia.gain.setTargetAtTime(L.pioggia * 0.12, t, 0.1);
    if (L.gocce > 0.05 && t > this.prossimaGoccia) {
      this.prossimaGoccia = t + 0.4 + Math.random() * 2.2;
      const f = 900 + Math.random() * 900;
      this.nota(f, 0, 0.12, 'sine', 0.05 * L.gocce);
      this.nota(f * 1.5, 0.02, 0.08, 'sine', 0.02 * L.gocce);
    }
    if (L.legno > 0.05 && t > this.prossimoLegno) {
      this.prossimoLegno = t + 3 + Math.random() * 6;
      this.rumore(0.6, 180 + Math.random() * 120, 4, 0.5 * L.legno);
    }
  }

  tonfo() { this.rumore(0.5, 500, 0.8, 0.5); this.rumore(0.9, 1600, 0.6, 0.25); }

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

  // passi: un timbro per materiale, con un po' di variazione per non suonare meccanici
  passo(materiale = 'cemento') {
    if (!this.ac) return;
    const v = () => 0.94 + Math.random() * 0.12;
    switch (materiale) {
      case 'metallo': this.rumore(0.12, 2400 * v(), 6, 0.13); this.nota(310 * v(), 0, 0.07, 'triangle', 0.025); break;
      case 'piastrelle': this.rumore(0.07, 1800 * v(), 2, 0.15); this.nota(120 * v(), 0, 0.05, 'sine', 0.04); break;
      case 'moquette': this.rumore(0.1, 420 * v(), 0.8, 0.07); break;
      case 'acqua': this.rumore(0.26, 1100 * v(), 0.5, 0.2); this.rumore(0.12, 2600 * v(), 1.5, 0.06); break;
      case 'legno': this.rumore(0.12, 300 * v(), 3, 0.2); this.nota(140 * v(), 0, 0.08, 'sine', 0.05); break;
      default: this.rumore(0.09, 900 * v(), 1.2, 0.16); this.nota(80 * v(), 0, 0.07, 'sine', 0.05);
    }
  }

  // urto di un cubo: più forte, più grave e più lungo
  urto(forza) {
    const k = Math.max(0, Math.min(1, forza));
    this.rumore(0.18 + k * 0.2, 320 + Math.random() * 80, 1.4, 0.45 * k);
    this.nota(70 + Math.random() * 20, 0, 0.12 + k * 0.1, 'sine', 0.08 * k);
  }

  leva() { this.rumore(0.05, 3000, 4, 0.2); this.nota(180, 0.06, 0.05, 'square', 0.04); this.rumore(0.08, 700, 2, 0.25); }

  porta(apre = true) {
    this.rumore(1.1, apre ? 130 : 110, 0.8, 0.35);
    this.nota(55, 0, 1.1, 'sawtooth', 0.02);
    if (this.ac) setTimeout(() => this.rumore(0.2, 260, 1.5, 0.4), 1050);
  }

  lampada() { this.nota(880, 0, 0.5, 'sine', 0.05); this.nota(1318.5, 0.12, 0.7, 'sine', 0.04); this.rumore(0.05, 5000, 3, 0.08); }
  notifica() { this.nota(659.25, 0, 0.12, 'triangle', 0.05); this.nota(987.77, 0.1, 0.18, 'triangle', 0.05); }

  errore() { this.nota(140, 0, 0.18, 'square', 0.04); this.nota(110, 0.09, 0.2, 'square', 0.04); }
  passaggio() { this.rumore(0.35, 900, 0.6, 0.25); }
  presa() { this.nota(330, 0, 0.06, 'triangle', 0.06); }
  finale() { [392, 493.88, 587.33, 783.99].forEach((f, k) => this.nota(f, k * 0.18, 1.2, 'sine', 0.05)); }
}
