// Il Curatore: primo giorno di lavoro. Le stanze emettono eventi, solo il narratore
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
    this.stato = { obbediente: true, porta: null, indietro: 0, scatola: 0, lanci: 0 };
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
  evento(nome, d = {}) {
    const s = this.stato;
    switch (nome) {
      case 'inizio':
        if (d.visti >= 5) this.di('N-101');
        else if (d.visti > 0) this.di('N-100', { vars: { n: d.visti } });
        this.di('N-001');
        this.di('N-002');
        break;
      case 'stanza:corridoio1':
        if (!this.detto.has('N-020')) this.di('N-003');
        break;
      case 'oggetto:scatola':
        s.scatola++;
        this.di(s.scatola === 1 ? 'N-010' : 'N-011');
        break;
      case 'oggetto:monitor': this.di('N-012'); break;
      case 'oggetto:targa': this.di('N-013'); break;
      case 'stanza:bivio':
        if (!s.porta) this.di('N-020', { subito: true });
        break;
      case 'porta:sinistra':
        if (!s.porta) { s.porta = 'sinistra'; this.di('N-021', { subito: true }); }
        break;
      case 'porta:destra':
        if (!s.porta) { s.porta = 'destra'; s.obbediente = false; this.di('N-022', { subito: true }); }
        break;
      case 'indietro':
        s.indietro++;
        s.obbediente = false;
        this.di(['N-030', 'N-031', 'N-032'][Math.min(2, s.indietro - 1)], { subito: true });
        break;
      case 'stanza:laboratorio': this.di('N-040', { subito: true }); break;
      case 'gesto': this.di('N-041'); break;
      case 'portale:ok':
        this.di('N-042');
        this.di('N-043');
        break;
      case 'portale:proibito':
        s.obbediente = false;
        this.di('N-046', { subito: true });
        break;
      case 'lancia':
        s.lanci++;
        this.di('N-045');
        break;
      case 'balconata': this.di('N-044', { subito: true }); break;
      case 'stanza:magazzino':
        if (s.porta === 'destra') this.di('N-023');
        this.di('N-070');
        this.di('N-071');
        break;
      case 'fuori':
        this.di('N-050', { subito: true });
        this.di('N-051');
        break;
      case 'stanza:archivio':
        this.di('N-060', { subito: true });
        if (s.obbediente) this.di('N-061');
        this.di('N-062');
        break;
      case 'fermo:15': this.di('N-080'); break;
      case 'fermo:30': this.di('N-081'); break;
      case 'fermo:45': this.di('N-082'); break;
      case 'fermo:60': this.di('N-083'); break;
      case 'finale:dipendente': this.di(s.obbediente ? 'N-095' : 'N-096', { subito: true }); break;
      case 'finale:magazzino': this.di('N-072', { subito: true }); break;
      case 'finale:corridoio': this.di('N-090', { subito: true }); break;
      case 'finale:attesa': this.di('N-084', { subito: true }); break;
      default: break;
    }
  }
}
