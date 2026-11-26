// Il Curatore: primo turno di notte. Le stanze emettono eventi, solo il narratore
// decide cosa dire. Ogni battuta ha un ID (dati/narratore.json) a cui collegare un audio.
const $ = (id) => document.getElementById(id);

export class Narratore {
  constructor(dati, ctx, suoni) {
    this.dati = dati;
    this.ctx = ctx;
    this.suoni = suoni;
    this.coda = [];
    this.attuale = null;
    this.tempo = 0;
    this.pausa = 0;
    this.attese = [];
    this.detto = new Set();
    this.voce = null;
    this.box = $('sottotitoli');
    ctx.suLingua(() => this.mostra());
  }

  testo(id, vars = {}) {
    const r = this.dati.righe[id];
    if (!r) return id;
    return (r[this.ctx.lingua] || r.it).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
  }

  di(id, { subito = false, vars = {}, una = true } = {}) {
    if (una && this.detto.has(id)) return;
    this.detto.add(id);
    const riga = { id, vars };
    if (subito) {
      this.coda = [riga];
      this.attuale = null;
      this.pausa = 0;
    } else {
      this.coda.push(riga);
    }
  }

  // esegue fn quando il narratore ha finito di parlare
  poi(fn) { this.attese.push(fn); }

  occupato() { return !!this.attuale || this.coda.length > 0; }

  durata(riga) { return 1.8 + this.testo(riga.id, riga.vars).length * 0.058; }

  mostra() {
    const r = this.attuale;
    if (!r) { this.box.hidden = true; return; }
    const panico = !!this.dati.righe[r.id]?.panico;
    $('sott-nome').textContent = this.dati.nome[this.ctx.lingua];
    $('sott-testo').textContent = this.testo(r.id, r.vars);
    $('sott-pagine').hidden = !panico;
    this.box.classList.toggle('panico', panico);
    this.box.hidden = false;
  }

  avviaRiga(r) {
    this.attuale = r;
    this.tempo = this.durata(r);
    this.mostra();
    this.box.classList.remove('nuova');
    void this.box.offsetWidth;
    this.box.classList.add('nuova');
    if (this.dati.righe[r.id]?.panico) this.suoni?.fruscio();
    if (this.voce) { this.voce.pause(); this.voce = null; }
    if (this.dati.voce?.includes(r.id) && this.ctx.audio) {
      this.voce = new Audio(`voce/${this.ctx.lingua}/${r.id}.mp3`);
      this.voce.play().catch(() => {});
    }
  }

  aggiorna(dt) {
    if (this.attuale) {
      this.tempo -= dt;
      if (this.tempo <= 0) { this.attuale = null; this.pausa = 0.45; this.mostra(); }
      return;
    }
    if (this.pausa > 0) { this.pausa -= dt; return; }
    if (this.coda.length) { this.avviaRiga(this.coda.shift()); return; }
    if (this.attese.length) {
      const fns = this.attese;
      this.attese = [];
      fns.forEach((fn) => fn());
    }
  }

  // ---------------------------------------------------------------- copione
  // dati.eventi: { "nome-evento": ["N-001", { "id": "N-002", "subito": true }] }
  evento(nome, d = {}) {
    for (const voce of this.dati.eventi?.[nome] || []) {
      const v = typeof voce === 'string' ? { id: voce } : voce;
      this.di(v.id, { subito: !!v.subito, vars: { ...d, ...(v.vars || {}) }, una: v.una !== false });
    }
  }
}
