// Musica liminale generativa: 44 BPM, pad lenti, campanelli radi, fruscio di nastro.
// A ogni cambio di stanza il "nastro rallenta" (calo di intonazione, filtro che si chiude,
// saturazione) e poi torna. Nessun file audio. Senza AudioContext l'orologio va lo stesso.
import { accordo, curvaTransizione } from './logica/armonia.js';

const BPM = 44;
const BATTITO = 60 / BPM;
const BATTUTA = BATTITO * 4;
const mtof = (n) => 440 * Math.pow(2, (n - 69) / 12);

function curvaSpinta(k) {
  const n = 1024;
  const c = new Float32Array(n);
  const a = 1 + k * 30;
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    c[i] = Math.tanh(a * x) / Math.tanh(a);
  }
  return c;
}

export class Musica {
  constructor(ac = null, uscita = null) {
    this.t0 = performance.now() / 1000;
    this.alaAttuale = 'ingresso';
    this.tipoLetto = null;
    this.isCalmo = false;
    this.inMelodia = false;
    this.prossima = 0;
    this.transInizio = -1;
    if (ac) this.collega(ac, uscita);
  }

  collega(ac, uscita) {
    if (this.ac) return;
    this.ac = ac;
    this.filtro = ac.createBiquadFilter();
    this.filtro.type = 'lowpass';
    this.filtro.frequency.value = 18000;
    this.spinta = ac.createWaveShaper();
    this.curve = Array.from({ length: 7 }, (_, i) => curvaSpinta(i / 10));
    this.spinta.curve = this.curve[0];
    this.master = ac.createGain();
    this.master.gain.value = 0.9;
    this.gPad = ac.createGain();
    this.gPad.gain.value = 1;
    this.gPad.connect(this.filtro);
    this.filtro.connect(this.spinta).connect(this.master).connect(uscita);
    // un'unica sorgente di detune per tutte le voci: ci passano sia il wow del nastro sia la transizione
    this.detune = ac.createConstantSource();
    this.detune.offset.value = 0;
    this.detune.start();
    this.wow = ac.createOscillator();
    this.wow.frequency.value = 0.31;
    this.wowG = ac.createGain();
    this.wowG.gain.value = 7;
    this.wow.connect(this.wowG);
    this.wow.start();
    // fruscio di nastro
    const n = ac.sampleRate * 2;
    const buf = ac.createBuffer(1, n, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * 0.5;
    const src = ac.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const hp = ac.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 4000;
    const g = ac.createGain();
    g.gain.value = 0.006;
    src.connect(hp).connect(g).connect(this.filtro);
    src.start();
    // l'orologio continua da dove era arrivato senza audio: chi segue il ritmo non salta
    this.t0 = ac.currentTime - (performance.now() / 1000 - this.t0);
    this.prossima = ac.currentTime + 0.2;
  }

  avvia() {
    if (this.timer) return;
    this.timer = setInterval(() => this.programma(), 120);
    this.anima = setInterval(() => this.aggiornaTransizione(), 30);
  }

  ferma() { clearInterval(this.timer); clearInterval(this.anima); this.timer = this.anima = null; }

  ala(nome) { if (nome) this.alaAttuale = nome; }

  calmo(on) {
    this.isCalmo = !!on;
    if (this.wowG) this.wowG.gain.value = on ? 0 : 7;
  }

  letto(tipo) { this.tipoLetto = tipo || null; }

  melodia(on) { this.inMelodia = !!on; }

  transizione() { if (this.ac) this.transInizio = this.ac.currentTime; }

  tempo() { return this.ac ? this.ac.currentTime - this.t0 : performance.now() / 1000 - this.t0; }

  battuta() { return Math.floor(this.tempo() / BATTUTA); }

  battito() { return BATTITO; }

  voce(f, quando, durata, { tipo = 'sine', g = 0.02, attacco = 1.6, uscita = this.gPad } = {}) {
    const ac = this.ac;
    const o = ac.createOscillator();
    o.type = tipo;
    o.frequency.value = f;
    this.detune.connect(o.detune);
    this.wowG.connect(o.detune);
    const gg = ac.createGain();
    gg.gain.setValueAtTime(0.0001, quando);
    gg.gain.exponentialRampToValueAtTime(g, quando + attacco);
    gg.gain.setValueAtTime(g, quando + Math.max(attacco, durata - attacco));
    gg.gain.exponentialRampToValueAtTime(0.0001, quando + durata);
    o.connect(gg).connect(uscita);
    o.start(quando);
    o.stop(quando + durata + 0.05);
    o.onended = () => {
      try { this.detune.disconnect(o.detune); this.wowG.disconnect(o.detune); } catch { /* già scollegato */ }
      gg.disconnect();
    };
  }

  // programma la battuta successiva con un po' di anticipo
  programma() {
    const ac = this.ac;
    if (!ac || ac.state !== 'running') return;
    while (this.prossima < ac.currentTime + 0.6) {
      const b = Math.round((this.prossima - this.t0) / BATTUTA);
      const q = this.prossima;
      const note = accordo(this.alaAttuale, b);
      const livello = this.tipoLetto ? 0.35 : 1;
      this.gPad.gain.setTargetAtTime(livello, q, 0.8);
      note.forEach((n, i) => this.voce(mtof(n), q + i * 0.05, BATTUTA * 1.25, { tipo: i ? 'sine' : 'triangle', g: i ? 0.012 : 0.018, attacco: 1.8 }));
      if (Math.random() < 0.45) {
        const n = note[1 + Math.floor(Math.random() * 3)] + 24;
        this.voce(mtof(n), q + BATTITO * (1 + Math.floor(Math.random() * 3)), 3.2, { g: 0.008, attacco: 0.01 });
      }
      for (let k = 0; k < 4; k++) this.lettoBattito(q + k * BATTITO);
      if (this.inMelodia) this.melodiaBattuta(q, note);
      this.prossima += BATTUTA;
    }
  }

  lettoBattito(q) {
    const ac = this.ac;
    if (this.tipoLetto === 'battito') {
      for (const off of [0, BATTITO / 2]) {
        const o = ac.createOscillator();
        o.frequency.setValueAtTime(110, q + off);
        o.frequency.exponentialRampToValueAtTime(45, q + off + 0.18);
        const g = ac.createGain();
        g.gain.setValueAtTime(0.09, q + off);
        g.gain.exponentialRampToValueAtTime(0.0001, q + off + 0.25);
        o.connect(g).connect(this.master);
        o.start(q + off);
        o.stop(q + off + 0.3);
      }
    } else if (this.tipoLetto === 'notifiche' && Math.random() < 0.18) {
      this.voce(987.77, q, 0.3, { tipo: 'triangle', g: 0.015, attacco: 0.01, uscita: this.master });
      this.voce(1318.5, q + 0.1, 0.35, { tipo: 'triangle', g: 0.012, attacco: 0.01, uscita: this.master });
    } else if (this.tipoLetto === 'rete' && Math.random() < 0.5) {
      for (let i = 0; i < 6; i++) this.voce(1200 + Math.random() * 2400, q + i * 0.05, 0.05, { tipo: 'square', g: 0.004, attacco: 0.005, uscita: this.master });
    }
  }

  // carillon per il jukebox della stanza di oakvx quando non ci sono brani
  melodiaBattuta(q, note) {
    const passi = [0, 2, 1, 3, 2, 1, 0, 2];
    passi.forEach((p, i) => {
      if (Math.random() < 0.2) return;
      this.voce(mtof(note[p % 4] + 24), q + i * (BATTITO / 2), 1.2, { g: 0.02, attacco: 0.005, uscita: this.master });
    });
  }

  aggiornaTransizione() {
    if (!this.ac) return;
    const t = this.transInizio < 0 ? 99 : this.ac.currentTime - this.transInizio;
    const c = curvaTransizione(t, this.isCalmo);
    const ora = this.ac.currentTime;
    this.detune.offset.setTargetAtTime(c.detune, ora, 0.02);
    this.filtro.frequency.setTargetAtTime(c.taglio, ora, 0.02);
    const i = Math.min(6, Math.round(c.spinta * 10));
    if (this.spinta.curve !== this.curve[i]) this.spinta.curve = this.curve[i];
  }
}
