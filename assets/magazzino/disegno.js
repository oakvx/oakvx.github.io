/* Disegno delle carte del Magazzino, in SVG, disegnate da zero.
   Siciliane: denari a sole, coppe, spade ricurve a scimitarra, bastoni nodosi; figure stilizzate.
   Francesi: semi classici, figure con la lettera. Palette del sito: nero, osso, cremisi. */
(() => {
    'use strict';

    const NERO = '#050505', OSSO = '#E8E6E1', CREMISI = '#C81035', CARTA = '#F4F1EA';

    // semi, disegnati in un quadrato 100×100
    const SEMI = {
        denari: c => `<circle cx="50" cy="50" r="22" fill="${c}"/><circle cx="50" cy="50" r="13" fill="none" stroke="${CARTA}" stroke-width="3"/>` +
            Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<path d="M${50 + Math.cos(a) * 27} ${50 + Math.sin(a) * 27} L${50 + Math.cos(a + .13) * 40} ${50 + Math.sin(a + .13) * 40} L${50 + Math.cos(a - .13) * 40} ${50 + Math.sin(a - .13) * 40}Z" fill="${c}"/>`; }).join(''),
        coppe: c => `<path d="M22 16 H78 C78 50 62 62 55 64 V78 C55 81 72 82 72 90 H28 C28 82 45 81 45 78 V64 C38 62 22 50 22 16Z" fill="${c}"/><path d="M30 24 H70" stroke="${CARTA}" stroke-width="3"/>`,
        spade: c => `<path d="M36 80 C58 62 74 40 70 8 C86 34 80 66 44 88 Z" fill="${c}"/><path d="M24 76 L48 94" stroke="${c}" stroke-width="7" stroke-linecap="round"/><circle cx="22" cy="74" r="6" fill="${c}"/>`,
        bastoni: c => `<path d="M43 94 C39 70 36 40 40 16 C43 6 57 6 60 16 C64 40 61 70 57 94 Z" fill="${c}"/>` +
            [[37, 34], [63, 50], [36, 64], [62, 76]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5.5" fill="${c}"/>`).join(''),
        cuori: c => `<path d="M50 88 C12 60 8 26 32 20 C43 17 50 26 50 33 C50 26 57 17 68 20 C92 26 88 60 50 88Z" fill="${c}"/>`,
        quadri: c => `<path d="M50 8 L84 50 L50 92 L16 50Z" fill="${c}"/>`,
        fiori: c => `<circle cx="50" cy="30" r="17" fill="${c}"/><circle cx="31" cy="58" r="17" fill="${c}"/><circle cx="69" cy="58" r="17" fill="${c}"/><path d="M50 50 C50 72 46 84 38 92 H62 C54 84 50 72 50 50Z" fill="${c}"/>`,
        picche: c => `<path d="M50 10 C12 40 10 72 32 76 C42 78 48 70 50 64 C52 70 58 78 68 76 C90 72 88 40 50 10Z" fill="${c}"/><path d="M50 60 C50 76 46 86 38 92 H62 C54 86 50 76 50 60Z" fill="${c}"/>`
    };
    const ROSSI = new Set(['denari', 'coppe', 'cuori', 'quadri']);
    const SICILIANI = new Set(['denari', 'coppe', 'spade', 'bastoni']);
    const colore = seme => ROSSI.has(seme) ? CREMISI : NERO;
    const seme = (nome, x, y, lato) => `<g transform="translate(${x - lato / 2} ${y - lato / 2}) scale(${lato / 100})">${SEMI[nome](colore(nome))}</g>`;

    // disposizione dei semi sulle carte numerate (coordinate nella carta 200×300)
    const POSTI = {
        1: [[100, 150]], 2: [[100, 85], [100, 215]], 3: [[100, 75], [100, 150], [100, 225]],
        4: [[65, 85], [135, 85], [65, 215], [135, 215]], 5: [[65, 85], [135, 85], [100, 150], [65, 215], [135, 215]],
        6: [[65, 80], [135, 80], [65, 150], [135, 150], [65, 220], [135, 220]],
        7: [[65, 75], [135, 75], [100, 115], [65, 160], [135, 160], [65, 225], [135, 225]],
        8: [[65, 70], [135, 70], [65, 125], [135, 125], [65, 180], [135, 180], [65, 235], [135, 235]],
        9: [[65, 70], [135, 70], [65, 125], [135, 125], [100, 150], [65, 180], [135, 180], [65, 235], [135, 235]],
        10: [[65, 65], [135, 65], [100, 100], [65, 125], [135, 125], [65, 180], [135, 180], [100, 205], [65, 240], [135, 240]]
    };

    const NOMI = {
        it: { v: ['', 'Asso', 'Due', 'Tre', 'Quattro', 'Cinque', 'Sei', 'Sette', 'Otto', 'Nove', 'Dieci'],
              sic: { 8: 'Fante', 9: 'Cavallo', 10: 'Re' }, fr: { 11: 'Fante', 12: 'Donna', 13: 'Re' }, di: 'di', jolly: 'Jolly',
              semi: { denari: 'denari', coppe: 'coppe', spade: 'spade', bastoni: 'bastoni', cuori: 'cuori', quadri: 'quadri', fiori: 'fiori', picche: 'picche' } },
        en: { v: ['', 'Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'],
              sic: { 8: 'Jack', 9: 'Knight', 10: 'King' }, fr: { 11: 'Jack', 12: 'Queen', 13: 'King' }, di: 'of', jolly: 'Joker',
              semi: { denari: 'coins', coppe: 'cups', spade: 'swords', bastoni: 'clubs', cuori: 'hearts', quadri: 'diamonds', fiori: 'clubs', picche: 'spades' } }
    };

    function nome(c, lingua = 'it') {
        const N = NOMI[lingua] || NOMI.it;
        if (c.seme === 'jolly') return N.jolly;
        const v = SICILIANI.has(c.seme) ? (N.sic[c.valore] || N.v[c.valore]) : (N.fr[c.valore] || N.v[c.valore]);
        return `${v} ${N.di} ${N.semi[c.seme]}`;
    }

    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const cornice = (titolo, corpo) =>
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" role="img"><title>${esc(titolo)}</title>` +
        `<rect x="2" y="2" width="196" height="296" rx="14" fill="${CARTA}" stroke="${NERO}" stroke-opacity=".25" stroke-width="2"/>${corpo}</svg>`;
    const indice = (testo, c) =>
        `<g font-family="Fraunces, Georgia, serif" font-size="30" font-weight="600" fill="${c}" text-anchor="middle">` +
        `<text x="22" y="38">${testo}</text><text x="178" y="282" transform="rotate(180 178 272)">${testo}</text></g>`;

    // figure: sagome geometriche, con il seme in mano
    function figura(c) {
        const col = colore(c.seme), sic = SICILIANI.has(c.seme);
        const tipo = sic ? { 8: 'fante', 9: 'cavallo', 10: 're' }[c.valore] : { 11: 'fante', 12: 'donna', 13: 're' }[c.valore];
        const testa = tipo === 'cavallo'
            ? `<path d="M70 120 C72 92 96 74 122 80 L136 70 L134 92 C146 104 142 130 128 134 L116 120 C108 132 96 140 92 156 Z" fill="${NERO}"/><circle cx="122" cy="96" r="3.5" fill="${CARTA}"/>`
            : `<circle cx="100" cy="98" r="22" fill="${NERO}"/>`;
        const copricapo = tipo === 're'
            ? `<path d="M76 80 L82 56 L92 70 L100 50 L108 70 L118 56 L124 80 Z" fill="${CREMISI}"/>`
            : tipo === 'donna' ? `<path d="M78 82 C80 62 120 62 122 82 Z" fill="${CREMISI}"/><circle cx="100" cy="60" r="5" fill="${CREMISI}"/>`
            : tipo === 'fante' ? `<path d="M76 84 L124 84 L116 70 L84 70 Z" fill="${CREMISI}"/>` : '';
        const corpo = `<path d="M60 250 C60 170 76 128 100 128 C124 128 140 170 140 250 Z" fill="${NERO}"/>` +
            `<path d="M100 132 L100 250" stroke="${CREMISI}" stroke-width="4"/>`;
        const lettera = sic ? { fante: 'F', cavallo: 'C', re: 'R' }[tipo] : { fante: 'J', donna: 'Q', re: 'K' }[tipo];
        return indice(lettera, col) + corpo + testa + copricapo + `<circle cx="100" cy="196" r="30" fill="${CARTA}"/>` + seme(c.seme, 100, 196, 46);
    }

    function carta(c) {
        const titolo = nome(c, 'it');
        if (c.seme === 'jolly') {
            return cornice(titolo, `<g font-family="Archivo, Arial, sans-serif" font-weight="800" fill="${CREMISI}" text-anchor="middle">` +
                `<text x="100" y="140" font-size="40" letter-spacing="4">JOLLY</text></g>` +
                `<path d="M100 170 L110 196 L138 196 L116 212 L124 240 L100 224 L76 240 L84 212 L62 196 L90 196Z" fill="${NERO}"/>`);
        }
        const sic = SICILIANI.has(c.seme);
        const figuraQui = sic ? c.valore >= 8 : c.valore >= 11;
        if (figuraQui) return cornice(titolo, figura(c));
        const col = colore(c.seme);
        const testo = c.valore === 1 ? (sic ? '1' : 'A') : String(c.valore);
        if (c.valore === 1) return cornice(titolo, indice(testo, col) + seme(c.seme, 100, 150, 120));
        const lato = c.valore >= 8 ? 40 : c.valore >= 6 ? 46 : 52;
        return cornice(titolo, indice(testo, col) + POSTI[c.valore].map(([x, y]) => seme(c.seme, x, y, lato)).join(''));
    }

    function dorso(tipo) {
        const motivo = tipo === 'siciliane'
            ? `<pattern id="d-s" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M12 2 L22 12 L12 22 L2 12Z" fill="none" stroke="${OSSO}" stroke-opacity=".35" stroke-width="1.5"/></pattern>`
            : `<pattern id="d-f" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 8 H16" stroke="${OSSO}" stroke-opacity=".3" stroke-width="2"/></pattern>`;
        const id = tipo === 'siciliane' ? 'd-s' : 'd-f';
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" role="img"><title>${tipo === 'siciliane' ? 'Dorso, carte siciliane' : 'Dorso, carte francesi'}</title><defs>${motivo}</defs>` +
            `<rect x="2" y="2" width="196" height="296" rx="14" fill="${CREMISI}"/><rect x="14" y="14" width="172" height="272" rx="8" fill="url(#${id})" stroke="${OSSO}" stroke-opacity=".5"/>` +
            `<text x="100" y="160" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="34" fill="${OSSO}">oakvx</text></svg>`;
    }

    const OAKVX = window.OAKVX || (window.OAKVX = {});
    OAKVX.disegno = { carta, dorso, nome };
})();
