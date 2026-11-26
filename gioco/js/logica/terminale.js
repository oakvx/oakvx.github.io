// portfolio.sh: il terminale della scrivania. Riceve una riga, restituisce righe da stampare
// e, se serve, un'azione per la stanza ('apri' | 'esci' | 'pulisci' | 'segreto').
const AIUTO = {
  it: ['comandi: help · whoami · skills · principi · percorso · contatti · git log --oneline · clear · exit', 'per aprire la porta: apri'],
  en: ['commands: help · whoami · skills · principles · journey · contacts · git log --oneline · clear · exit', 'to open the door: apri'],
};

export function esegui(riga, { lingua, dati }) {
  const cmd = riga.trim().toLowerCase().replace(/\s+/g, ' ');
  const en = lingua === 'en';
  if (!cmd) return { righe: [], azione: null };
  switch (cmd) {
    case 'help': case 'aiuto': return { righe: AIUTO[en ? 'en' : 'it'], azione: null };
    case 'whoami': return { righe: [...dati.chi], azione: null };
    case 'skills': case 'strumenti': case 'tools':
      return { righe: dati.strumenti.map(([area, cosa]) => `${area.padEnd(22)} ${cosa}`), azione: null };
    case 'principi': case 'principles': return { righe: [...dati.principi], azione: null };
    case 'percorso': case 'journey': return { righe: [...dati.percorso], azione: null };
    case 'contatti': case 'contacts': return { righe: [...dati.contatti], azione: null };
    case 'git log --oneline': case 'git log':
      return { righe: dati.log.map((r, i) => `${(0x9f3a1c0 + i * 0x1d7).toString(16).slice(0, 7)} ${r}`), azione: null };
    case 'clear': return { righe: [], azione: 'pulisci' };
    case 'exit': return { righe: [], azione: 'esci' };
    case 'apri': case 'open': return { righe: [en ? 'door: open' : 'porta: aperta'], azione: 'apri' };
    case 'sudo make me a sandwich': return { righe: [en ? 'okay. 🥪' : 'va bene. 🥪'], azione: 'segreto' };
    default: {
      const nome = cmd.split(' ')[0];
      return { righe: [en ? `command not found: ${nome} — try help` : `comando non trovato: ${nome} — prova help`], azione: null };
    }
  }
}
