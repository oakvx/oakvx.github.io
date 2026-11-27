/* Blackjack 3D del Magazzino: tavolo vero, mazziere di carta a fermacampioni, carte e fiches animate.
   Tutte le texture sono disegnate qui su canvas (niente immagini esterne); le carte vengono da disegno.js.
   Pose e voli arrivano da regia.js (funzioni pure, testate). */
import * as THREE from 'three';

const R = () => window.OAKVX.regia;
const calmo = () => document.documentElement.classList.contains('calm');
const ora = () => performance.now();
const liscia = t => t * t * (3 - 2 * t);
const aspetta = ms => new Promise(r => setTimeout(r, ms));

/* ------------------------------------------------------------------ texture disegnate */
function tela(w, h, disegna) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    disegna(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    return t;
}
function grana(g, w, h, forza = 10, n = 9000) {
    for (let i = 0; i < n; i++) {
        const v = (Math.random() - .5) * forza;
        g.fillStyle = v > 0 ? `rgba(255,255,255,${v / 100})` : `rgba(0,0,0,${-v / 100})`;
        g.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5);
    }
}
const ORO = '#d8b45a', PANNO = '#0d5236';

function textureFelt(raggio) {
    return tela(2048, 2048, (g, W, H) => {
        // il cerchio intero; si vede la metà bassa (lato del giocatore)
        const grad = g.createRadialGradient(W / 2, H * .62, 50, W / 2, H / 2, W * .62);
        grad.addColorStop(0, '#15704a'); grad.addColorStop(1, '#093d28');
        g.fillStyle = grad; g.fillRect(0, 0, W, H);
        grana(g, W, H, 9, 60000);
        const cx = W / 2, cy = H / 2, s = W / 2 / raggio;            // metri → pixel
        const arco = (r, testo, size, colore) => {
            g.save(); g.fillStyle = colore; g.font = `600 ${size}px "Nero Serif", Georgia, serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
            const lettere = [...testo], ampio = lettere.reduce((a, l) => a + g.measureText(l).width, 0) + (lettere.length - 1) * size * .12;
            let ang = Math.PI / 2 + (ampio / 2) / (r * s);
            for (const l of lettere) {
                const lw = g.measureText(l).width;
                ang -= (lw / 2) / (r * s);
                g.save(); g.translate(cx + Math.cos(ang) * r * s, cy + Math.sin(ang) * r * s); g.rotate(ang - Math.PI / 2); g.fillText(l, 0, 0); g.restore();
                ang -= (lw / 2 + size * .12) / (r * s);
            }
            g.restore();
        };
        g.strokeStyle = ORO; g.lineWidth = 6; g.globalAlpha = .85;
        g.beginPath(); g.arc(cx, cy, 1.18 * s, 0, Math.PI); g.stroke();
        g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, 1.0 * s, 0, Math.PI); g.stroke();
        g.globalAlpha = 1;
        arco(1.09, 'BLACKJACK PAGA 3 A 2', 64, ORO);
        arco(.9, 'IL BANCO STA SU 17', 40, 'rgba(232,230,225,.75)');
        arco(1.32, 'oakvx · magazzino', 34, 'rgba(232,230,225,.35)');
        // cerchio della puntata
        const bx = cx + .55 * s, by = cy + (.62 + .9) * s;
        g.strokeStyle = 'rgba(232,230,225,.8)'; g.lineWidth = 5; g.beginPath(); g.arc(bx, by, .13 * s, 0, Math.PI * 2); g.stroke();
        g.lineWidth = 2; g.beginPath(); g.arc(bx, by, .105 * s, 0, Math.PI * 2); g.stroke();
    });
}
function textureLegno() {
    return tela(1024, 256, (g, W, H) => {
        g.fillStyle = '#4a2815'; g.fillRect(0, 0, W, H);
        for (let i = 0; i < 90; i++) {
            g.strokeStyle = `rgba(${20 + Math.random() * 40},${8 + Math.random() * 18},0,${.25 + Math.random() * .3})`;
            g.lineWidth = 1 + Math.random() * 3; g.beginPath();
            const y = Math.random() * H; g.moveTo(0, y);
            for (let x = 0; x <= W; x += 32) g.lineTo(x, y + Math.sin(x / 90 + i) * 6 + (Math.random() - .5) * 3);
            g.stroke();
        }
        grana(g, W, H, 12, 8000);
    });
}
function textureSfondo() {
    return tela(1024, 512, (g, W, H) => {
        const gr = g.createLinearGradient(0, 0, 0, H);
        gr.addColorStop(0, '#120a06'); gr.addColorStop(.6, '#2a1309'); gr.addColorStop(1, '#0a0503');
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
        // luci sfocate del locale
        for (let i = 0; i < 26; i++) {
            const x = Math.random() * W, y = H * (.15 + Math.random() * .45), r = 8 + Math.random() * 26;
            const b = g.createRadialGradient(x, y, 0, x, y, r);
            const col = Math.random() < .3 ? '200,16,53' : '255,190,110';
            b.addColorStop(0, `rgba(${col},.55)`); b.addColorStop(1, `rgba(${col},0)`);
            g.fillStyle = b; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
        }
    });
}

/* ------------------------------------------------------------------ mazziere di carta */
const PELLE = '#e9b98e', PELLE_OMBRA = '#c98f66', CAMICIA = '#f2efe8', GILET = '#16161a', CARTONE = '#c8ae7d';

// un pezzo di cartoncino: sagoma disegnata, bordo tagliato, spessore finto dietro
function pezzo(w, h, disegna, { px = .5, py = 1 } = {}) {
    const S = 512, aspetto = w / h, cw = aspetto >= 1 ? S : Math.round(S * aspetto), ch = aspetto >= 1 ? Math.round(S / aspetto) : S;
    const fronte = tela(cw, ch, (g, W, H) => {
        g.save(); disegna(g, W, H); g.restore();
        g.globalCompositeOperation = 'source-atop'; grana(g, W, H, 14, 5000); g.globalCompositeOperation = 'source-over';
    });
    const geo = new THREE.PlaneGeometry(w, h);
    geo.translate(w * (.5 - px), h * (.5 - py), 0);               // il perno nell'origine
    const mat = new THREE.MeshStandardMaterial({ map: fronte, transparent: true, alphaTest: .5, roughness: .92, side: THREE.DoubleSide });
    const m = new THREE.Mesh(geo, mat); m.castShadow = true;
    const retro = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: fronte, color: CARTONE, transparent: true, alphaTest: .5, roughness: 1 }));
    retro.position.set(.004, -.004, -.004); retro.scale.setScalar(1.015); retro.castShadow = true;
    const g = new THREE.Group(); g.add(retro, m);
    return { g, mat };
}
function fermacampione() {
    const g = new THREE.Group();
    const ottone = new THREE.MeshStandardMaterial({ color: '#c9a24a', metalness: 1, roughness: .28 });
    const testa = new THREE.Mesh(new THREE.SphereGeometry(.022, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), ottone);
    testa.rotation.x = Math.PI / 2; testa.scale.set(1, .45, 1);
    const anello = new THREE.Mesh(new THREE.CylinderGeometry(.026, .026, .004, 24), ottone); anello.rotation.x = Math.PI / 2;
    g.add(anello, testa); g.position.z = .012;
    return g;
}
const tondo = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };

function facce() {
    const testa = (bocca, occhi) => (g, W, H) => {
        g.lineJoin = 'round';
        // orecchie
        g.fillStyle = PELLE_OMBRA; g.beginPath(); g.ellipse(W * .1, H * .55, W * .07, H * .08, 0, 0, 7); g.ellipse(W * .9, H * .55, W * .07, H * .08, 0, 0, 7); g.fill();
        // viso
        g.fillStyle = PELLE; g.beginPath(); g.ellipse(W / 2, H * .55, W * .4, H * .42, 0, 0, 7); g.fill();
        g.strokeStyle = 'rgba(80,40,20,.55)'; g.lineWidth = 6; g.stroke();
        // capelli impomatati con la riga
        g.fillStyle = '#1b120c'; g.beginPath();
        g.moveTo(W * .1, H * .5); g.bezierCurveTo(W * .08, H * .05, W * .92, H * .02, W * .9, H * .5);
        g.bezierCurveTo(W * .86, H * .3, W * .7, H * .24, W * .38, H * .26); g.bezierCurveTo(W * .22, H * .28, W * .14, H * .38, W * .1, H * .5); g.fill();
        g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 4; g.beginPath(); g.moveTo(W * .36, H * .1); g.quadraticCurveTo(W * .5, H * .16, W * .8, H * .2); g.stroke();
        // sopracciglia
        g.strokeStyle = '#1b120c'; g.lineWidth = 9; g.lineCap = 'round';
        g.beginPath(); g.moveTo(W * .27, H * .42); g.quadraticCurveTo(W * .35, H * .38, W * .43, H * .41); g.stroke();
        g.beginPath(); g.moveTo(W * .57, H * .41); g.quadraticCurveTo(W * .65, H * .38, W * .73, H * .42); g.stroke();
        // occhi
        g.fillStyle = '#1b120c';
        if (occhi) { g.beginPath(); g.ellipse(W * .35, H * .5, W * .04, H * .045, 0, 0, 7); g.ellipse(W * .65, H * .5, W * .04, H * .045, 0, 0, 7); g.fill();
            g.fillStyle = '#fff'; g.beginPath(); g.arc(W * .36, H * .49, W * .012, 0, 7); g.arc(W * .66, H * .49, W * .012, 0, 7); g.fill(); }
        else { g.lineWidth = 6; g.beginPath(); g.moveTo(W * .3, H * .5); g.quadraticCurveTo(W * .35, H * .53, W * .4, H * .5); g.moveTo(W * .6, H * .5); g.quadraticCurveTo(W * .65, H * .53, W * .7, H * .5); g.stroke(); }
        // naso e baffi
        g.strokeStyle = PELLE_OMBRA; g.lineWidth = 6; g.beginPath(); g.moveTo(W * .5, H * .52); g.quadraticCurveTo(W * .46, H * .62, W * .51, H * .64); g.stroke();
        g.fillStyle = '#1b120c'; g.beginPath(); g.moveTo(W * .5, H * .68);
        g.bezierCurveTo(W * .42, H * .64, W * .32, H * .66, W * .3, H * .72); g.bezierCurveTo(W * .38, H * .7, W * .45, H * .71, W * .5, H * .7);
        g.bezierCurveTo(W * .55, H * .71, W * .62, H * .7, W * .7, H * .72); g.bezierCurveTo(W * .68, H * .66, W * .58, H * .64, W * .5, H * .68); g.fill();
        // bocca
        if (bocca === 'aperta') {
            g.fillStyle = '#5a1418'; g.beginPath(); g.ellipse(W * .5, H * .79, W * .09, H * .055, 0, 0, 7); g.fill();
            g.fillStyle = '#fff'; g.fillRect(W * .44, H * .745, W * .12, H * .022);
        } else {
            g.strokeStyle = '#7a3324'; g.lineWidth = 7; g.beginPath(); g.moveTo(W * .42, H * .78); g.quadraticCurveTo(W * .5, H * .82, W * .58, H * .78); g.stroke();
        }
        // guance
        g.fillStyle = 'rgba(200,16,53,.12)'; g.beginPath(); g.arc(W * .26, H * .66, W * .07, 0, 7); g.arc(W * .74, H * .66, W * .07, 0, 7); g.fill();
    };
    const out = {};
    for (const b of ['chiusa', 'aperta']) for (const o of [true, false]) out[`${b}-${o ? 'aperti' : 'chiusi'}`] = tela(400, 480, testa(b, o));
    return out;
}

function creaMazziere() {
    const radice = new THREE.Group();
    const busto = pezzo(.62, .74, (g, W, H) => {
        // sagoma: spalle arrotondate che scendono
        const sagoma = () => { g.beginPath(); g.moveTo(W * .12, H); g.lineTo(W * .06, H * .2); g.quadraticCurveTo(W * .08, H * .05, W * .28, H * .03); g.lineTo(W * .72, H * .03); g.quadraticCurveTo(W * .92, H * .05, W * .94, H * .2); g.lineTo(W * .88, H); g.closePath(); };
        sagoma(); g.fillStyle = CAMICIA; g.fill();
        g.save(); sagoma(); g.clip();
        // gilet a V
        g.fillStyle = GILET; g.beginPath(); g.moveTo(0, H * .1); g.lineTo(W * .4, H * .08); g.lineTo(W * .5, H * .62); g.lineTo(W * .6, H * .08); g.lineTo(W, H * .1); g.lineTo(W, H); g.lineTo(0, H); g.fill();
        g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 4; g.stroke();
        // bottoni e taschino
        g.fillStyle = ORO; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(W * .5, H * (.7 + i * .1), W * .016, 0, 7); g.fill(); }
        g.fillStyle = '#e8e6e1'; g.beginPath(); g.moveTo(W * .7, H * .38); g.lineTo(W * .82, H * .36); g.lineTo(W * .76, H * .3); g.fill();
        // targhetta
        tondo(g, W * .18, H * .4, W * .2, H * .06, 6); g.fillStyle = ORO; g.fill();
        g.fillStyle = GILET; g.font = `700 ${W * .035}px "Nero Sans", Arial, sans-serif`; g.textAlign = 'center'; g.fillText('OAKVX', W * .28, H * .445);
        g.restore();
        // colletto e papillon
        g.fillStyle = '#fff'; g.beginPath(); g.moveTo(W * .38, H * .02); g.lineTo(W * .5, H * .12); g.lineTo(W * .44, H * .16); g.closePath(); g.moveTo(W * .62, H * .02); g.lineTo(W * .5, H * .12); g.lineTo(W * .56, H * .16); g.closePath(); g.fill();
        g.fillStyle = '#c81035'; g.beginPath(); g.moveTo(W * .5, H * .13); g.lineTo(W * .38, H * .07); g.lineTo(W * .38, H * .19); g.closePath(); g.moveTo(W * .5, H * .13); g.lineTo(W * .62, H * .07); g.lineTo(W * .62, H * .19); g.closePath(); g.fill();
        g.beginPath(); g.arc(W * .5, H * .13, W * .025, 0, 7); g.fill();
        sagoma(); g.strokeStyle = 'rgba(40,25,10,.6)'; g.lineWidth = 6; g.stroke();
    }, { px: .5, py: 0 });
    busto.g.position.y = .3;
    radice.add(busto.g);

    // collo e testa
    const collo = new THREE.Group(); collo.position.set(0, .3 + .7, .006); radice.add(collo);
    const volto = facce();
    const testa = pezzo(.34, .41, (g, W, H) => g.drawImage(volto['chiusa-aperti'].image, 0, 0, W, H), { px: .5, py: .06 });
    collo.add(testa.g); collo.add(fermacampione());
    const cambiaFaccia = chiave => { testa.mat.map = volto[chiave]; testa.mat.needsUpdate = true; };

    // braccia: spalla → braccio → gomito → avambraccio → polso → mano
    const manica = (g, W, H) => { tondo(g, W * .08, 0, W * .84, H, W * .4); g.fillStyle = CAMICIA; g.fill(); g.strokeStyle = 'rgba(40,25,10,.55)'; g.lineWidth = 5; g.stroke();
        g.fillStyle = '#16161a'; g.fillRect(W * .08, H * .42, W * .84, H * .12); g.fillStyle = ORO; g.fillRect(W * .44, H * .42, W * .12, H * .12); };   // giarrettiera
    const avambraccio = (g, W, H) => { tondo(g, W * .1, 0, W * .8, H * .7, W * .35); g.fillStyle = CAMICIA; g.fill(); g.strokeStyle = 'rgba(40,25,10,.55)'; g.lineWidth = 5; g.stroke();
        tondo(g, W * .2, H * .62, W * .6, H * .38, W * .25); g.fillStyle = PELLE; g.fill(); g.stroke(); };
    const mano = conMazzo => (g, W, H) => {
        if (conMazzo) { // il mazzo tenuto fra pollice e dita
            for (let i = 0; i < 6; i++) { tondo(g, W * .12, H * (.18 - i * .015), W * .76, H * .55, 10); g.fillStyle = i === 5 ? '#c81035' : '#f4f1ea'; g.fill(); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 2; g.stroke(); }
            g.strokeStyle = 'rgba(244,241,234,.6)'; g.lineWidth = 3; tondo(g, W * .2, H * .14, W * .6, H * .45, 6); g.stroke();
        }
        g.fillStyle = PELLE; g.strokeStyle = 'rgba(80,40,20,.6)'; g.lineWidth = 5;
        tondo(g, W * .18, H * .05, W * .64, H * .55, W * .25); g.fill(); g.stroke();                        // palmo
        for (let i = 0; i < 4; i++) { tondo(g, W * (.2 + i * .155), H * .45, W * .13, H * .42, W * .07); g.fill(); g.stroke(); }  // dita
        g.beginPath(); g.ellipse(W * .1, H * .3, W * .1, H * .2, -.6, 0, 7); g.fill(); g.stroke();             // pollice
        if (conMazzo) { tondo(g, W * .14, H * .5, W * .72, H * .14, 8); g.fillStyle = '#c81035'; g.fill(); }
    };
    function braccio(lato) {
        const spalla = new THREE.Group(); spalla.position.set(lato * .27, .3 + .64, .01); radice.add(spalla);
        const b = pezzo(.13, .36, manica, { px: .5, py: 1 }); spalla.add(b.g, fermacampione());
        const gomito = new THREE.Group(); gomito.position.set(0, -.33, .01); spalla.add(gomito);
        const a = pezzo(.12, .34, avambraccio, { px: .5, py: 1 }); gomito.add(a.g, fermacampione());
        const polso = new THREE.Group(); polso.position.set(0, -.32, .01); gomito.add(polso);
        const m = pezzo(.15, .17, mano(lato > 0), { px: .5, py: .95 }); polso.add(m.g, fermacampione());
        const presa = new THREE.Object3D(); presa.position.set(0, -.1, .02); polso.add(presa);
        return { spalla, gomito, polso, presa };
    }
    const S = braccio(1), D = braccio(-1);
    radice.position.set(0, -.3, -1.12);               // il busto continua sotto il bordo del tavolo
    return {
        radice, S, D, collo, cambiaFaccia,
        posa(p) {
            S.spalla.rotation.z = p.spallaS; S.gomito.rotation.z = p.gomitoS; S.polso.rotation.z = p.polsoS;
            D.spalla.rotation.z = p.spallaD; D.gomito.rotation.z = p.gomitoD; D.polso.rotation.z = p.polsoD;
            collo.rotation.z = p.collo;
        }
    };
}

/* ------------------------------------------------------------------ carte e fiches */
const CARTA = { w: .17, h: .245, s: .0016 };
const cacheFacce = new Map();
function texDaSvg(svg) {
    return new Promise(ok => {
        const img = new Image();
        img.onload = () => { const c = document.createElement('canvas'); c.width = 400; c.height = 600; c.getContext('2d').drawImage(img, 0, 0, 400, 600);
            const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; ok(t); };
        img.onerror = () => ok(null);
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
}
async function faccia(c) {
    const k = c.coperta ? 'dorso' : `${c.seme}-${c.valore}`;
    if (!cacheFacce.has(k)) cacheFacce.set(k, texDaSvg(c.coperta ? window.OAKVX.disegno.dorso('francesi') : window.OAKVX.disegno.carta(c)));
    return cacheFacce.get(k);
}

const COLORI_FICHE = { 1: ['#e8e6e1', '#1d3f8f'], 5: ['#c81035', '#f4f1ea'], 10: ['#1f4fb8', '#f4f1ea'], 25: ['#1f7a3d', '#f4f1ea'], 100: ['#111', '#d8b45a'], 500: ['#5b2a86', '#f4f1ea'] };
const matFiche = new Map();
function materialiFiche(valore) {
    if (matFiche.has(valore)) return matFiche.get(valore);
    const [base, righe] = COLORI_FICHE[valore];
    const sopra = tela(256, 256, (g, W, H) => {
        g.fillStyle = base; g.beginPath(); g.arc(W / 2, H / 2, W / 2, 0, 7); g.fill();
        g.fillStyle = righe; for (let i = 0; i < 8; i++) { g.save(); g.translate(W / 2, H / 2); g.rotate(i * Math.PI / 4); g.fillRect(-10, -W / 2, 20, 34); g.restore(); }
        g.strokeStyle = righe; g.lineWidth = 5; g.setLineDash([8, 8]); g.beginPath(); g.arc(W / 2, H / 2, W * .33, 0, 7); g.stroke(); g.setLineDash([]);
        g.fillStyle = righe; g.font = `700 ${valore >= 100 ? 54 : 64}px "Nero Sans", Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(valore), W / 2, H / 2 + 3);
    });
    const lato = tela(256, 32, (g, W, H) => { g.fillStyle = base; g.fillRect(0, 0, W, H); g.fillStyle = righe; for (let i = 0; i < 8; i++) g.fillRect(i * 32 + 6, 0, 14, H); });
    const m = [new THREE.MeshStandardMaterial({ map: lato, roughness: .5 }), new THREE.MeshStandardMaterial({ map: sopra, roughness: .45 }), new THREE.MeshStandardMaterial({ map: sopra, roughness: .45 })];
    matFiche.set(valore, m);
    return m;
}
const geoFiche = new THREE.CylinderGeometry(.038, .038, .011, 40);
function pilaFiches(valore, quante) {
    const g = new THREE.Group();
    for (let i = 0; i < quante; i++) {
        const f = new THREE.Mesh(geoFiche, materialiFiche(valore));
        f.position.y = .0055 + i * .0112; f.rotation.y = Math.random() * 6; f.position.x = (Math.random() - .5) * .003; f.castShadow = true; f.receiveShadow = true;
        g.add(f);
    }
    return g;
}
function fichesPer(importo) {
    const g = new THREE.Group(); let i = 0;
    for (const p of R().pileFiches(importo)) { const pila = pilaFiches(p.valore, p.quante); pila.position.set((i % 3) * .085 - .085, 0, Math.floor(i / 3) * .085); g.add(pila); i++; }
    return g;
}

/* ------------------------------------------------------------------ scena */
export async function creaScena(contenitore) {
    try { await document.fonts.load('600 64px "Nero Serif"'); await document.fonts.load('700 40px "Nero Sans"'); } catch {}
    const telefono = matchMedia('(max-width: 760px)').matches;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, telefono ? 1.5 : 2));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    contenitore.prepend(renderer.domElement);
    renderer.domElement.setAttribute('aria-hidden', 'true');

    const scena = new THREE.Scene();
    scena.background = new THREE.Color('#0a0503');
    scena.fog = new THREE.Fog('#0a0503', 4, 9);
    const camera = new THREE.PerspectiveCamera(40, 1, .05, 30);

    // luci: lampada calda sopra il tavolo
    scena.add(new THREE.HemisphereLight('#ffd9a8', '#1a0c06', .55));
    const lampada = new THREE.SpotLight('#ffe2b8', 38, 9, .62, .55, 1.6);
    lampada.position.set(0, 3.4, .1); lampada.target.position.set(0, 0, -.2);
    lampada.castShadow = true; lampada.shadow.mapSize.set(telefono ? 1024 : 2048, telefono ? 1024 : 2048); lampada.shadow.bias = -.0004; lampada.shadow.radius = 4;
    scena.add(lampada, lampada.target);
    const riempi = new THREE.DirectionalLight('#9fb7ff', .25); riempi.position.set(-2, 2, 3); scena.add(riempi);

    // sfondo del locale
    const sfondo = new THREE.Mesh(new THREE.PlaneGeometry(14, 5), new THREE.MeshBasicMaterial({ map: textureSfondo(), fog: false }));
    sfondo.position.set(0, 1.4, -2.7); scena.add(sfondo);
    const pavimento = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshStandardMaterial({ color: '#060302', roughness: 1 }));
    pavimento.rotation.x = -Math.PI / 2; pavimento.position.y = -.8; pavimento.receiveShadow = true; scena.add(pavimento);

    // tavolo
    const RG = R().RAGGIO + .1, CZ = R().CENTRO_Z;
    const panno = new THREE.Mesh(new THREE.CircleGeometry(RG, 96, Math.PI, Math.PI), new THREE.MeshStandardMaterial({ map: textureFelt(RG), roughness: .96 }));
    panno.rotation.x = -Math.PI / 2; panno.position.set(0, 0, CZ); panno.receiveShadow = true; scena.add(panno);
    const pelle = new THREE.MeshStandardMaterial({ color: '#2a1410', roughness: .55, metalness: .05 });
    const bordo = new THREE.Mesh(new THREE.TorusGeometry(RG + .06, .075, 18, 120, Math.PI), pelle);
    bordo.rotation.x = Math.PI / 2; bordo.position.set(0, .035, CZ); bordo.castShadow = true; bordo.receiveShadow = true; scena.add(bordo);
    const legnoMat = new THREE.MeshStandardMaterial({ map: textureLegno(), roughness: .6 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(RG + .16, RG + .1, .16, 120, 1, false, Math.PI / 2, Math.PI), legnoMat);
    base.position.set(0, -.085, CZ); base.receiveShadow = true; scena.add(base);
    const fronte = new THREE.Mesh(new THREE.BoxGeometry((RG + .16) * 2, .17, .12), legnoMat);
    fronte.position.set(0, -.07, CZ - .05); scena.add(fronte);
    // sabot accanto al mazziere
    const sabot = new THREE.Group();
    const sabotMat = new THREE.MeshStandardMaterial({ color: '#1b1b20', roughness: .35, metalness: .2 });
    const corpo = new THREE.Mesh(new THREE.BoxGeometry(.2, .1, .3), sabotMat); corpo.position.y = .05; corpo.castShadow = true;
    const dentro = new THREE.Mesh(new THREE.BoxGeometry(.18, .07, .26), new THREE.MeshStandardMaterial({ color: '#c81035', roughness: .7 })); dentro.position.set(0, .08, -.01);
    sabot.add(corpo, dentro); sabot.position.set(.72, 0, -.62); sabot.rotation.y = -.35; scena.add(sabot);
    // vassoio delle fiches del banco, sul lato dritto
    const vassoio = new THREE.Mesh(new THREE.BoxGeometry(.9, .045, .16), new THREE.MeshStandardMaterial({ color: '#141418', roughness: .4, metalness: .3 }));
    vassoio.position.set(-.05, .022, CZ + .1); vassoio.castShadow = true; vassoio.receiveShadow = true; scena.add(vassoio);
    [500, 100, 25, 10, 5, 1, 1, 5, 10, 25].forEach((v, i) => {
        for (let k = 0; k < 9; k++) { const f = new THREE.Mesh(geoFiche, materialiFiche(v)); f.rotation.z = Math.PI / 2; f.position.set(-.45 + i * .088, .05, CZ + .04 + k * .0115); f.rotation.x = Math.PI / 2; f.rotation.set(Math.PI / 2, 0, 0); vassoio.parent.add(f); f.position.y = .055; }
    });

    // mazziere
    const mz = creaMazziere(); scena.add(mz.radice); mz.posa(R().posa('riposo', 0));

    // fumetto
    const fumetto = document.createElement('div'); fumetto.className = 'bj3d__fumetto'; fumetto.setAttribute('aria-hidden', 'true'); contenitore.append(fumetto);

    // dimensioni e inquadratura
    function dimensiona() {
        const w = contenitore.clientWidth, h = contenitore.clientHeight;
        renderer.setSize(w, h, false); camera.aspect = w / h;
        if (camera.aspect < 1) { camera.fov = 64; camera.position.set(0, 1.62, 1.95); camera.lookAt(0, .2, -.32); }
        else { camera.fov = 46; camera.position.set(0, 1.42, 2.3); camera.lookAt(0, .28, -.42); }
        camera.updateProjectionMatrix();
    }
    dimensiona();
    const ro = new ResizeObserver(dimensiona); ro.observe(contenitore);

    // animazioni: una lista di passi con durata, il ciclo li avanza
    const vive = new Set();
    const anima = (durata, passo) => new Promise(fine => {
        if (calmo() || durata <= 0) { passo(1); fine(); return; }
        const inizio = ora();
        vive.add({ f: t => { const k = Math.min(1, (t - inizio) / durata); passo(k); if (k >= 1) { fine(); return true; } return false; } });
    });
    let parlaFino = 0, parlaDa = 0, prossimoBattito = ora() + 2500, battito = 0, gestoInCorso = false;
    let raf = 0, visibile = true;
    const io = new IntersectionObserver(([e]) => { visibile = e.isIntersecting; if (visibile && !raf) raf = requestAnimationFrame(ciclo); }); io.observe(contenitore);
    function ciclo(t) {
        raf = 0;
        for (const a of [...vive]) if (a.f(t)) vive['delete'](a);
        // dondolio da appeso e testa che segue
        if (!calmo()) { mz.radice.rotation.z = Math.sin(t / 1400) * .012; if (!gestoInCorso) mz.collo.rotation.z = Math.sin(t / 1900) * .04; }
        // occhi e bocca
        if (t > prossimoBattito) { battito = t + 130; prossimoBattito = t + 2200 + Math.random() * 2600; }
        const occhi = t < battito ? 'chiusi' : 'aperti';
        const bocca = t < parlaFino ? R().bocca(t - parlaDa) : 'chiusa';
        mz.cambiaFaccia(`${bocca}-${occhi}`);
        // fumetto sopra la testa
        const p = new THREE.Vector3(); mz.collo.getWorldPosition(p); p.y += .4; p.project(camera);
        fumetto.style.transform = `translate(${(p.x + 1) / 2 * contenitore.clientWidth}px, ${(1 - p.y) / 2 * contenitore.clientHeight}px) translate(-50%, -100%)`;
        renderer.render(scena, camera);
        if (visibile && !document.hidden) raf = requestAnimationFrame(ciclo);
    }
    raf = requestAnimationFrame(ciclo);
    document.addEventListener('visibilitychange', () => { if (!document.hidden && !raf) raf = requestAnimationFrame(ciclo); });

    // un gesto del mazziere sincronizzato con un'azione
    async function gesto(nome, durata, durante) {
        gestoInCorso = true;
        await anima(durata, k => { mz.posa(R().posa(nome, k)); if (durante) durante(k); });
        mz.posa(R().posa('riposo', 0)); gestoInCorso = false;
    }

    // carte sul tavolo
    const carte = new Map();               // chiave → mesh
    const geoCarta = new THREE.BoxGeometry(CARTA.w, CARTA.s, CARTA.h);
    const latoCarta = new THREE.MeshStandardMaterial({ color: '#f4f1ea', roughness: .6 });
    async function creaCarta(c) {
        const [f, d] = await Promise.all([faccia(c.coperta ? { seme: c.seme, valore: c.valore } : c), faccia({ coperta: true })]);
        const fronteM = new THREE.MeshStandardMaterial({ map: f, roughness: .55 }), dorsoM = new THREE.MeshStandardMaterial({ map: d, roughness: .55 });
        const m = new THREE.Mesh(geoCarta, [latoCarta, latoCarta, fronteM, dorsoM, latoCarta, latoCarta]);
        m.castShadow = true; m.receiveShadow = true;
        m.userData.fronte = fronteM;
        scena.add(m);
        return m;
    }
    const daMano = () => { const p = new THREE.Vector3(); mz.D.presa.getWorldPosition(p); return p.toArray(); };
    async function lancia(m, a, scoperta, inclinaFinale) {
        const da = daMano();
        m.position.set(...da); m.rotation.set(0, 0, Math.PI);
        await gesto('lancia', 520, k => {
            const v = R().voloCarta(Math.min(1, Math.max(0, (k - .18) / .82)), da, a);
            m.position.set(...v.pos);
            m.rotation.set(-v.inclina * .3, inclinaFinale * Math.min(1, k * 1.3), scoperta ? Math.PI * (1 - v.giro) : Math.PI);
        });
        // atterraggio con un piccolo rimbalzo
        await anima(120, k => { m.position.y = a[1] + Math.sin(k * Math.PI) * .012; });
    }
    async function gira(m) {
        const y0 = m.position.y;
        await gesto('gira', 480, k => { m.rotation.z = Math.PI * (1 - liscia(k)); m.position.y = y0 + Math.sin(k * Math.PI) * .07; });
    }
    async function raccogli() {
        const tutte = [...carte.values()]; carte.clear();
        const verso = new THREE.Vector3(-.75, .02, -.7);
        await anima(420, k => { for (const m of tutte) { m.position.lerp(verso, k * .35); m.rotation.y += .02; } });
        for (const m of tutte) { scena.remove(m); }
    }

    // fiches: la pila del giocatore e la puntata nel cerchio
    let pila = null, puntataMostrata = 0, gruppoPuntata = null;
    const CERCHIO = new THREE.Vector3(.55, 0, .62);
    function mostraPila(saldo) {
        if (pila) scena.remove(pila);
        pila = new THREE.Group();
        const stringi = camera.aspect < 1 ? .7 : 1;      // in verticale le pile si avvicinano al centro
        for (const p of R().pileFiches(saldo)) { const g = pilaFiches(p.valore, p.quante); g.position.set(p.x * stringi, 0, p.z); pila.add(g); }
        scena.add(pila);
    }
    async function mostraPuntata(importo, da) {
        if (gruppoPuntata) { scena.remove(gruppoPuntata); gruppoPuntata = null; }
        puntataMostrata = importo;
        if (!importo) return;
        gruppoPuntata = fichesPer(importo); scena.add(gruppoPuntata);
        const partenza = da || new THREE.Vector3(-.85, 0, .35);
        await anima(380, k => { const e = liscia(k); gruppoPuntata.position.lerpVectors(partenza, CERCHIO, e); gruppoPuntata.position.y = Math.sin(e * Math.PI) * .08; });
    }
    async function chiudiPuntata(esito) {
        if (!gruppoPuntata) return;
        const g = gruppoPuntata, verso = esito === 'perso' ? new THREE.Vector3(.1, 0, -.75) : new THREE.Vector3(-.85, 0, .35);
        if (esito === 'vinto') { const vincita = fichesPer(puntataMostrata); vincita.position.set(.2, 0, -.6); scena.add(vincita);
            await gesto('paga', 520, k => vincita.position.lerpVectors(new THREE.Vector3(.2, 0, -.6), CERCHIO.clone().add(new THREE.Vector3(.09, 0, .02)), liscia(k)));
            await aspetta(250); scena.remove(vincita); }
        const da = g.position.clone();
        await anima(420, k => { g.position.lerpVectors(da, verso, liscia(k)); g.position.y = Math.sin(k * Math.PI) * .06; });
        scena.remove(g); gruppoPuntata = null; puntataMostrata = 0;
    }

    /* aggiorna la scena verso lo stato delle regole (blackjack.js) */
    let fila = Promise.resolve();
    function aggiorna(stato, opz = {}) {
        fila = fila.then(() => applica(stato, opz)).catch(e => console.warn('blackjack 3d:', e));
        return fila;
    }
    async function applica(stato, { coperta = false, saldo = 0, istantaneo = false, esito = null } = {}) {
        const vuole = [];
        if (stato) {
            const mani = stato.mani.length;
            const giro = [];
            stato.mani.forEach((m, n) => m.carte.forEach((c, i) => giro.push({ c, chi: 'giocatore', n, i, mani })));
            stato.banco.forEach((c, i) => giro.push({ c, chi: 'banco', n: 0, i, mani: 1, coperta: coperta && i === 1 }));
            // l'ordine della distribuzione iniziale: giocatore, banco, giocatore, banco
            const prime = giro.filter(x => x.i < 2 && x.n === 0);
            const ordinate = [prime.find(x => x.chi === 'giocatore' && x.i === 0), prime.find(x => x.chi === 'banco' && x.i === 0), prime.find(x => x.chi === 'giocatore' && x.i === 1), prime.find(x => x.chi === 'banco' && x.i === 1)].filter(Boolean);
            vuole.push(...ordinate, ...giro.filter(x => !ordinate.includes(x)));
        }
        const chiavi = new Set(vuole.map(x => x.c.id));
        if ([...carte.keys()].some(k => !chiavi.has(k))) { if (istantaneo) { for (const m of carte.values()) scena.remove(m); carte.clear(); } else await raccogli(); }
        const puntata = stato ? stato.mani.reduce((a, m) => a + m.puntata, 0) : 0;
        // prima le fiches della puntata, poi le carte, e solo alla fine si paga
        if (puntata !== puntataMostrata && stato && !esito) { mostraPila(saldo); if (istantaneo) { await mostraPuntata(0); puntataMostrata = 0; } await mostraPuntata(puntata); }
        else if (!esito) mostraPila(saldo);
        for (const x of vuole) {
            const a = R().postoCarta(x.chi, x.n, x.i, x.mani);
            const incl = x.chi === 'banco' ? 0 : (x.i - 1) * .04;
            let m = carte.get(x.c.id);
            if (!m) {
                m = await creaCarta(x.c); carte.set(x.c.id, m); m.userData.coperta = !!x.coperta;
                if (istantaneo || calmo()) { m.position.set(...a); m.rotation.set(0, incl, x.coperta ? Math.PI : 0); }
                else await lancia(m, a, !x.coperta, incl);
            } else {
                if (m.userData.coperta && !x.coperta) { m.userData.coperta = false; if (istantaneo) m.rotation.z = 0; else await gira(m); }
                const qui = new THREE.Vector3(...a);
                if (m.position.distanceTo(qui) > .001) { const da = m.position.clone(); if (istantaneo) m.position.copy(qui); else await anima(260, k => m.position.lerpVectors(da, qui, liscia(k))); }
            }
        }
        if (esito) { if (!istantaneo) await chiudiPuntata(esito); else if (gruppoPuntata) { scena.remove(gruppoPuntata); gruppoPuntata = null; puntataMostrata = 0; } mostraPila(saldo); }
    }

    async function parla(testo) {
        fumetto.textContent = testo; fumetto.classList.add('acceso');
        const durata = Math.min(1600, 380 + testo.length * 45);
        parlaDa = ora(); parlaFino = parlaDa + durata;
        await aspetta(calmo() ? 300 : durata + 200);
        fumetto.classList.remove('acceso');
    }

    return {
        aggiorna, parla,
        distruggi() { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); renderer.dispose(); renderer.domElement.remove(); fumetto.remove(); }
    };
}
