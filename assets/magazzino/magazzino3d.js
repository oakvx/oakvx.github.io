/* Magazzino 3D: una corsia di scaffali d'acciaio con casse tutte uguali, ognuna col suo emblema e lo stencil,
   il magazziniere di cartoncino annoiato al bancone, il cordino della luce e i neon che si accendono a scatti.
   Casse, emblemi, bancone e texture sono costruiti qui; scaffali, lampada, carrello e cartone sono modelli
   Poly Haven (CC0) in modelli/. Posti, pose, polistirolo e neon vengono da corsia.js (funzioni pure, testate). */
import * as THREE from 'three';
import { GLTFLoader } from '../../gioco/vendor/three/addons/loaders/GLTFLoader.js';
import { tela, grana, creaMazziere } from './blackjack3d.js';

const K = () => window.OAKVX.corsia;
const calmo = () => document.documentElement.classList.contains('calm');
const ora = () => performance.now();
const liscia = t => t * t * (3 - 2 * t);
const esce = t => 1 - Math.pow(1 - t, 3);
const lim01 = t => Math.min(1, Math.max(0, t));
const MODELLI = new URL('modelli/', import.meta.url).href;

/* ------------------------------------------------------------------ attrezzi */
const mat = (colore, o = {}) => new THREE.MeshStandardMaterial({ color: colore, roughness: .6, metalness: 0, ...o });
function scatola(w, h, d, m) { const x = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); x.castShadow = true; x.receiveShadow = true; return x; }
function cilindro(rs, ri, h, m, seg = 28) { const x = new THREE.Mesh(new THREE.CylinderGeometry(rs, ri, h, seg), m); x.castShadow = true; x.receiveShadow = true; return x; }
const testo = (g, s, x, y, size, colore, peso = 800) => { g.fillStyle = colore; g.font = `${peso} ${size}px "Nero Sans", Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, x, y); };

/** Scala e posa un oggetto: il lato più lungo (o l'altezza) diventa `misura`, base sul piano y=0, centrato in x. */
function adatta(obj, misura, perAltezza = false) {
    const b = new THREE.Box3().setFromObject(obj), s = b.getSize(new THREE.Vector3());
    obj.scale.multiplyScalar(misura / (perAltezza ? s.y : Math.max(s.x, s.y, s.z)));
    b.setFromObject(obj);
    obj.position.x -= (b.min.x + b.max.x) / 2; obj.position.y -= b.min.y; obj.position.z -= (b.min.z + b.max.z) / 2;
    const g = new THREE.Group(); g.add(obj); return g;
}

/* ------------------------------------------------------------------ texture */
function texLegnoCassa() {
    return tela(512, 340, (g, W, H) => {
        const assi = 4, h = H / assi;
        for (let i = 0; i < assi; i++) {
            g.fillStyle = ['#c9a56a', '#c19b5e', '#cfae74', '#c4a064'][i]; g.fillRect(0, i * h, W, h);
            for (let k = 0; k < 26; k++) { g.strokeStyle = `rgba(110,70,30,${.08 + Math.random() * .16})`; g.lineWidth = 1 + Math.random() * 2; g.beginPath(); const y = i * h + 4 + Math.random() * (h - 8); g.moveTo(0, y); g.bezierCurveTo(W * .3, y + (Math.random() - .5) * 6, W * .6, y + (Math.random() - .5) * 6, W, y); g.stroke(); }
            g.fillStyle = 'rgba(40,24,10,.55)'; g.fillRect(0, i * h, W, 3);
            g.fillStyle = 'rgba(60,40,20,.7)'; for (const x of [14, W - 14]) { g.beginPath(); g.arc(x, i * h + h / 2, 3, 0, 7); g.fill(); }
        }
        grana(g, W, H, 14, 5000);
    });
}
function texCemento() {
    return tela(512, 512, (g, W, H) => {
        g.fillStyle = '#4a4744'; g.fillRect(0, 0, W, H); grana(g, W, H, 22, 40000);
        for (let i = 0; i < 14; i++) { const x = Math.random() * W, y = Math.random() * H, r = 30 + Math.random() * 90, b = g.createRadialGradient(x, y, 0, x, y, r); b.addColorStop(0, 'rgba(20,18,16,.28)'); b.addColorStop(1, 'rgba(20,18,16,0)'); g.fillStyle = b; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
        g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 3; g.strokeRect(0, 0, W, H);
    });
}
function texMuro() {
    return tela(1024, 512, (g, W, H) => {
        g.fillStyle = '#26221f'; g.fillRect(0, 0, W, H); grana(g, W, H, 16, 30000);
        for (let y = 0; y < H * .8; y += 64) { g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, y, W, 3); }
        g.fillStyle = '#b8901e'; for (let x = -H; x < W; x += 90) { g.beginPath(); g.moveTo(x, H); g.lineTo(x + 45, H); g.lineTo(x + 45 + 40, H - 40); g.lineTo(x + 40, H - 40); g.closePath(); g.fill(); }
        g.fillStyle = '#18140f'; for (let x = -H; x < W; x += 90) { g.beginPath(); g.moveTo(x + 45, H); g.lineTo(x + 90, H); g.lineTo(x + 90 + 40, H - 40); g.lineTo(x + 85, H - 40); g.closePath(); g.fill(); }
        for (let i = 0; i < 10; i++) { const x = Math.random() * W, r = 40 + Math.random() * 120, b = g.createLinearGradient(x, 0, x, H); b.addColorStop(0, 'rgba(10,8,6,.5)'); b.addColorStop(1, 'rgba(10,8,6,0)'); g.fillStyle = b; g.fillRect(x, 0, r * .3, H); }
    });
}
// lo stencil davanti alla cassa: codice, nome (con i ponticelli dello stencil) e, per le chiuse, «IN ARRIVO»
function texStencil(c, lingua) {
    return tela(512, 200, (g, W, H) => {
        g.clearRect(0, 0, W, H);
        const nome = (lingua === 'en' ? c.nomeEn : c.nome).toUpperCase();
        testo(g, c.codice, 52, 24, 34, '#1b120c', 700);
        let size = 84; g.font = `800 ${size}px "Nero Sans", Arial, sans-serif`;
        while (g.measureText(nome).width > W - 36 && size > 28) { size -= 4; g.font = `800 ${size}px "Nero Sans", Arial, sans-serif`; }
        const y = c.aperta ? H * .64 : H * .5;
        testo(g, nome, W / 2, y, size, '#1b120c', 800);
        g.globalCompositeOperation = 'destination-out';
        for (let x = 36; x < W - 20; x += 46) g.fillRect(x, y - size * .5, 3, size);       // i ponticelli
        g.globalCompositeOperation = 'source-over';
        if (!c.aperta) testo(g, lingua === 'en' ? 'COMING SOON' : 'IN ARRIVO', W / 2, H - 24, 38, '#b3122f', 800);
    });
}

/* ------------------------------------------------------------------ gli emblemi (alti 1 circa; poi `adatta`) */
const EMBLEMI = {
    fiche() {
        const t = tela(256, 256, (g, W, H) => {
            g.fillStyle = '#c81035'; g.beginPath(); g.arc(W / 2, H / 2, W / 2, 0, 7); g.fill();
            g.fillStyle = '#f4f1ea'; for (let i = 0; i < 8; i++) { g.save(); g.translate(W / 2, H / 2); g.rotate(i * Math.PI / 4); g.fillRect(-14, -W / 2, 28, 40); g.restore(); }
            g.strokeStyle = '#f4f1ea'; g.lineWidth = 6; g.setLineDash([10, 9]); g.beginPath(); g.arc(W / 2, H / 2, W * .33, 0, 7); g.stroke(); g.setLineDash([]);
            testo(g, '21', W / 2, H / 2 + 4, 90, '#f4f1ea');
        });
        const m = cilindro(.5, .5, .12, [mat('#c81035', { roughness: .4 }), mat('#fff', { map: t, roughness: .35 }), mat('#fff', { map: t, roughness: .35 })], 44);
        m.rotation.x = Math.PI / 2; m.position.y = .5;
        const g = new THREE.Group(); g.add(m); return g;
    },
    'carta-asso'() { return carta('A', '#c81035', '♦'); },
    'carta-sola'() { return carta('1', '#1a1a20', '♠'); },
    scopa() {
        const g = new THREE.Group();
        const manico = cilindro(.035, .035, 1.2, mat('#8a5a2b')); manico.position.y = .7;
        const setole = cilindro(.13, .3, .5, mat('#d8b45a', { roughness: .95 })); setole.position.y = .25;
        const fascia = cilindro(.2, .2, .08, mat('#c81035')); fascia.position.y = .52;
        g.add(manico, setole, fascia); g.rotation.z = .3; return g;
    },
    scala() {
        const g = new THREE.Group(), legno = mat('#9a6a35');
        for (const x of [-.22, .22]) { const r = scatola(.06, 1.3, .06, legno); r.position.set(x, .65, 0); g.add(r); }
        for (let i = 0; i < 5; i++) { const p = scatola(.44, .05, .05, legno); p.position.set(0, .15 + i * .25, 0); g.add(p); }
        g.rotation.z = -.12; return g;
    },
    'cubo-occhio'() {
        const t = tela(256, 256, (g, W, H) => {
            g.fillStyle = '#1a1a20'; g.fillRect(0, 0, W, H);
            g.fillStyle = '#f4f1ea'; g.beginPath(); g.ellipse(W / 2, H / 2, W * .36, H * .22, 0, 0, 7); g.fill();
            g.fillStyle = '#c81035'; g.beginPath(); g.arc(W / 2, H / 2, W * .16, 0, 7); g.fill();
            g.fillStyle = '#050505'; g.beginPath(); g.arc(W / 2, H / 2, W * .08, 0, 7); g.fill();
            g.fillStyle = '#fff'; g.beginPath(); g.arc(W * .54, H * .46, W * .025, 0, 7); g.fill();
        });
        const lato = mat('#1a1a20', { roughness: .4, metalness: .3 });
        const c = scatola(1, 1, 1, [lato, lato, lato, lato, mat('#fff', { map: t }), lato]); c.position.y = .5; c.rotation.y = .35;
        const g = new THREE.Group(); g.add(c); return g;
    },
    monitor() {
        const t = tela(256, 200, (g, W, H) => {
            g.fillStyle = '#04200f'; g.fillRect(0, 0, W, H); g.fillStyle = '#6dff9c'; g.font = '700 46px "Cascadia Code", monospace'; g.textAlign = 'left'; g.textBaseline = 'top';
            g.fillText('> oakvx_', 18, 24); g.fillText('> ciao', 18, 84); g.fillStyle = 'rgba(109,255,156,.8)'; g.fillRect(18, 150, 24, 30);
        });
        const g = new THREE.Group(), beige = mat('#cbc4b2', { roughness: .7 });
        const corpo = scatola(1, .85, .8, beige); corpo.position.y = .55; const base = scatola(.55, .12, .5, beige); base.position.y = .06;
        const schermo = new THREE.Mesh(new THREE.PlaneGeometry(.78, .62), new THREE.MeshStandardMaterial({ map: t, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: .6 }));
        schermo.position.set(0, .57, .405); g.add(corpo, base, schermo); return g;
    },
    ruota() {
        const t = tela(256, 256, (g, W, H) => {
            g.fillStyle = '#5a3a22'; g.fillRect(0, 0, W, H);
            for (let i = 0; i < 12; i++) { g.fillStyle = i === 0 ? '#1f7a3d' : i % 2 ? '#c81035' : '#101010'; g.beginPath(); g.moveTo(W / 2, H / 2); g.arc(W / 2, H / 2, W * .46, i * Math.PI / 6, (i + 1) * Math.PI / 6); g.fill(); }
            g.fillStyle = '#d8b45a'; g.beginPath(); g.arc(W / 2, H / 2, W * .16, 0, 7); g.fill(); g.strokeStyle = '#d8b45a'; g.lineWidth = 6; g.beginPath(); g.arc(W / 2, H / 2, W * .46, 0, 7); g.stroke();
        });
        const d = cilindro(.5, .5, .1, [mat('#5a3a22'), mat('#fff', { map: t }), mat('#5a3a22')], 36); d.rotation.x = Math.PI / 2; d.position.y = .5;
        const palla = new THREE.Mesh(new THREE.SphereGeometry(.05, 12, 8), mat('#fff', { roughness: .2 })); palla.position.set(.3, .72, .08);
        const g = new THREE.Group(); g.add(d, palla); return g;
    },
    cappello() {
        const g = new THREE.Group(), pelle = mat('#6a4426', { roughness: .85 });
        const falda = cilindro(.7, .7, .04, pelle, 36); falda.position.y = .06; const cupola = cilindro(.3, .38, .45, pelle, 28); cupola.position.y = .3;
        const fascia = cilindro(.385, .385, .08, mat('#1a120c')); fascia.position.y = .12;
        g.add(falda, cupola, fascia); g.rotation.x = -.35; return g;
    },
    'blocco-sudoku'() {
        const t = tela(256, 256, (g, W, H) => {
            g.fillStyle = '#f4f1ea'; g.fillRect(0, 0, W, H); g.strokeStyle = '#1a1a20';
            for (let i = 0; i <= 9; i++) { g.lineWidth = i % 3 ? 2 : 6; g.beginPath(); g.moveTo(i * W / 9, 0); g.lineTo(i * W / 9, H); g.moveTo(0, i * H / 9); g.lineTo(W, i * H / 9); g.stroke(); }
            [[0, 0, 5], [1, 2, 3], [2, 1, 8], [4, 4, 1], [5, 6, 9], [7, 3, 4], [8, 8, 2], [6, 0, 7]].forEach(([c, r, n]) => testo(g, String(n), (c + .5) * W / 9, (r + .5) * H / 9 + 2, 24, '#1a1a20', 600));
        });
        const lato = mat('#d8d2c4'); const b = scatola(1, 1, .3, [lato, lato, lato, lato, mat('#fff', { map: t }), lato]); b.position.y = .5; b.rotation.y = -.25;
        const g = new THREE.Group(); g.add(b); return g;
    },
    mina() {
        const g = new THREE.Group(), ferro = mat('#16161a', { roughness: .35, metalness: .6 });
        const s = new THREE.Mesh(new THREE.SphereGeometry(.45, 24, 16), ferro); s.position.y = .5; s.castShadow = true; g.add(s);
        const dirs = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, 0, 1], [.7, .7, 0], [-.7, .7, 0], [0, .7, .7], [.7, 0, .7], [-.7, 0, .7]];
        for (const [x, y, z] of dirs) { const c = new THREE.Mesh(new THREE.ConeGeometry(.07, .2, 8), ferro); const v = new THREE.Vector3(x, y, z).normalize(); c.position.copy(v.clone().multiplyScalar(.55)).add(new THREE.Vector3(0, .5, 0)); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v); g.add(c); }
        const miccia = cilindro(.02, .02, .22, mat('#8a5a2b')); miccia.position.set(0, 1.05, 0); const punta = new THREE.Mesh(new THREE.SphereGeometry(.045, 8, 6), new THREE.MeshStandardMaterial({ color: '#c81035', emissive: '#ff3a1a', emissiveIntensity: 1.5 })); punta.position.set(0, 1.18, 0);
        g.add(miccia, punta); return g;
    },
    pedina() {
        const t = tela(256, 256, (g, W, H) => { g.fillStyle = '#1a1a20'; g.beginPath(); g.arc(W / 2, H / 2, W / 2, 0, 7); g.fill(); g.strokeStyle = '#c81035'; g.lineWidth = 10; for (const r of [.38, .24]) { g.beginPath(); g.arc(W / 2, H / 2, W * r, 0, 7); g.stroke(); } });
        const m = cilindro(.5, .5, .2, [mat('#1a1a20', { roughness: .35 }), mat('#fff', { map: t, roughness: .35 }), mat('#1a1a20')], 40); m.rotation.x = Math.PI / 2; m.position.y = .5;
        const g = new THREE.Group(); g.add(m); return g;
    },
    'disco-forza-4'() {
        const t = tela(256, 256, (g, W, H) => {
            g.fillStyle = '#1f4fb8'; g.fillRect(0, 0, W, H);
            for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const x = (c + .5) * W / 3, y = (r + .5) * H / 3; g.fillStyle = (r + c) % 2 && r > 0 ? ((r * 3 + c) % 2 ? '#c81035' : '#f2c21b') : '#0b1a44'; g.beginPath(); g.arc(x, y, W * .12, 0, 7); g.fill(); }
        });
        const lato = mat('#183f94'); const b = scatola(1, 1, .14, [lato, lato, lato, lato, mat('#fff', { map: t, roughness: .4 }), lato]); b.position.y = .5;
        const g = new THREE.Group(); g.add(b); return g;
    }
};
function carta(lettera, colore, seme) {
    const t = tela(200, 280, (g, W, H) => {
        g.fillStyle = '#f4f1ea'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 4; g.strokeRect(2, 2, W - 4, H - 4);
        testo(g, lettera, 38, 40, 56, colore, 700); testo(g, seme, 38, 88, 44, colore, 600); testo(g, seme, W / 2, H / 2 + 10, 130, colore, 600);
    });
    const dorso = mat('#c81035'), c = scatola(.7, 1, .03, [dorso, dorso, dorso, dorso, mat('#fff', { map: t, roughness: .5 }), dorso]);
    c.position.y = .5; c.rotation.z = .1; const g = new THREE.Group(); g.add(c); return g;
}

/* ------------------------------------------------------------------ la scena */
export async function creaMagazzino(contenitore, { acceso = false, lingua = 'it' } = {}) {
    try { await document.fonts.load('800 60px "Nero Sans"'); await document.fonts.load('700 40px "Nero Sans"'); } catch {}
    const corsia = K(), CASSE = corsia.CASSE, N = CASSE.length;
    const telefono = matchMedia('(max-width: 760px)').matches;
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, telefono ? 1.5 : 2));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1; renderer.outputColorSpace = THREE.SRGBColorSpace;
    contenitore.prepend(renderer.domElement);
    renderer.domElement.setAttribute('aria-hidden', 'true');
    renderer.domElement.style.touchAction = 'pan-y';

    const scena = new THREE.Scene();
    scena.background = new THREE.Color('#050403'); scena.fog = new THREE.Fog('#050403', 5, 12);
    const camera = new THREE.PerspectiveCamera(42, 1, .05, 40);

    /* luci: ambiente, un faro con le ombre che segue la camera, quattro neon */
    const emisfero = new THREE.HemisphereLight('#c9d8ff', '#2a1a10', 0);
    const faro = new THREE.SpotLight('#fff1d6', 0, 14, .9, .6, 1.4);
    faro.castShadow = true; faro.shadow.mapSize.set(telefono ? 1024 : 2048, telefono ? 1024 : 2048); faro.shadow.bias = -.0005; faro.shadow.radius = 3;
    faro.position.set(0, 3.2, 2.6); scena.add(emisfero, faro, faro.target);
    const NEON_X = [-.7, 1.3, 3.3, 5.3];
    const neonMat = NEON_X.map(() => new THREE.MeshStandardMaterial({ color: '#222', emissive: '#e8f2ff', emissiveIntensity: 0 }));
    const neonLuce = NEON_X.map((x, i) => {
        const tubo = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 1.3, 12), neonMat[i]); tubo.rotation.z = Math.PI / 2; tubo.position.set(x, 2.2, .3); scena.add(tubo);
        const staffa = scatola(1.35, .05, .12, mat('#2a2d33')); staffa.position.set(x, 2.27, .3); scena.add(staffa);
        const l = new THREE.PointLight('#dfeaff', 0, 7, 1.6); l.position.set(x, 2.0, .7); scena.add(l); return l;
    });

    /* ambiente: pavimento, muro di fondo, scaffali di fondo, scaffale davanti */
    const PAV = -.62;
    const cemento = texCemento(); cemento.wrapS = cemento.wrapT = THREE.RepeatWrapping; cemento.repeat.set(7, 3);
    const pav = new THREE.Mesh(new THREE.PlaneGeometry(26, 12), mat('#fff', { map: cemento, roughness: .9 })); pav.rotation.x = -Math.PI / 2; pav.position.set(2, PAV, -2); pav.receiveShadow = true; scena.add(pav);
    const muroTex = texMuro(); muroTex.wrapS = THREE.RepeatWrapping; muroTex.repeat.set(3, 1);
    const muro = new THREE.Mesh(new THREE.PlaneGeometry(26, 5.6), mat('#fff', { map: muroTex, roughness: 1 })); muro.position.set(2, PAV + 2.8, -3.2); muro.receiveShadow = true; scena.add(muro);

    const acciaio = mat('#2b3a4a', { roughness: .45, metalness: .5 }), trave = mat('#c2561c', { roughness: .5, metalness: .3 });
    const PASSO = corsia.PASSO, YA = corsia.Y_RIPIANO_ALTO;
    const x0 = -.42, unita = PASSO * 4, nUnita = 2, xFine = x0 + unita * nUnita;
    const quote = [0, YA];                                                         // piani su cui poggiano le casse
    for (let u = 0; u <= nUnita; u++) for (const dz of [-.22, .22]) { const m = scatola(.06, 2.5, .06, acciaio); m.position.set(x0 + u * unita, PAV + 1.25, dz); scena.add(m); }
    for (let u = 0; u < nUnita; u++) {
        const cx = x0 + unita * (u + .5);
        for (const y of [...quote, YA + .62]) for (const dz of [-.2, .2]) { const t = scatola(unita, .07, .05, trave); t.position.set(cx, y - .05, dz); scena.add(t); }
        for (const y of quote) { const p = scatola(unita - .06, .02, .46, mat('#6b4a2a', { roughness: .85 })); p.position.set(cx, y - .01, 0); p.receiveShadow = true; scena.add(p); }
        const diagonale = scatola(.03, 1.9, .02, acciaio); diagonale.position.set(cx, PAV + 1.25, -.24); diagonale.rotation.z = .6; scena.add(diagonale);
    }

    /* il bancone */
    const BX = corsia.X_BANCONE + .9;                                              // x del magazziniere
    const legnoBanco = mat('#4f3322', { roughness: .65 });
    const banco = scatola(1.5, .97, .5, legnoBanco); banco.position.set(BX, PAV + .485, -.05); scena.add(banco);
    const piano = scatola(1.6, .05, .6, mat('#2a1a10', { roughness: .4 })); piano.position.set(BX, .335, -.05); scena.add(piano);
    const cartello = tela(512, 140, (g, W, H) => { g.fillStyle = '#d8b45a'; g.fillRect(0, 0, W, H); g.fillStyle = '#16120d'; g.fillRect(8, 8, W - 16, H - 16); testo(g, 'MAGAZZINO', W / 2, H * .42, 64, '#d8b45a'); testo(g, 'apre quando capita', W / 2, H * .78, 30, '#e8e6e1', 600); });
    const insegna = new THREE.Mesh(new THREE.PlaneGeometry(1.1, .3), new THREE.MeshStandardMaterial({ map: cartello, roughness: .6 })); insegna.position.set(BX, PAV + .5, .206); scena.add(insegna);
    // registratore di cassa e registro
    const cassa = scatola(.3, .2, .26, mat('#7a7468', { roughness: .5, metalness: .4 })); cassa.position.set(BX - .5, .36 + .1, .02); scena.add(cassa);
    const display = scatola(.24, .06, .02, mat('#0a2a14', { emissive: '#3dff7a', emissiveIntensity: .5 })); display.position.set(BX - .5, .36 + .24, .09); display.rotation.x = -.5; scena.add(display);
    const registro = scatola(.34, .025, .24, mat('#a8321f')); registro.position.set(BX + .45, .36 + .0125, .12); registro.rotation.y = .15; scena.add(registro);
    const campanello = new THREE.Mesh(new THREE.SphereGeometry(.05, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat('#d8b45a', { metalness: 1, roughness: .25 })); campanello.position.set(BX + .15, .36, .14); scena.add(campanello);

    /* il magazziniere di cartoncino: annoiato, mezzo addormentato */
    const mz = creaMazziere({ gilet: '#5a3a22', papillon: '#d8b45a', targa: 'MAGAZZINO', berretto: '#3b3f46' });
    mz.radice.position.set(BX, -.29, -.12); scena.add(mz.radice);
    mz.posa(corsia.poseAnnoiato(0));
    let parlaDa = 0, parlaFino = 0;
    const fumetto = document.createElement('div'); fumetto.className = 'bj3d__fumetto'; fumetto.setAttribute('aria-hidden', 'true'); contenitore.append(fumetto);

    /* le casse: tutte uguali */
    const L = corsia.LARGHEZZA_CASSA, P = corsia.PROFONDITA_CASSA, A = corsia.ALTEZZA_CASSA;
    const texCassa = texLegnoCassa(), legnoM = mat('#fff', { map: texCassa, roughness: .85 }), legnoScuro = mat('#7a5a34', { roughness: .85 }), ferro = mat('#8c8f94', { roughness: .4, metalness: .8 });
    const geoPallino = new THREE.CapsuleGeometry(.011, .024, 3, 6), matPallino = mat('#f6f4ee', { roughness: .95 });
    const casse = [], bersagli = [], dummy = new THREE.Object3D();
    CASSE.forEach((c, i) => {
        const g = new THREE.Group(), pos = corsia.postoCassa(i);
        const perno = new THREE.Group(); perno.position.set(pos.x, pos.y, P / 2); g.position.set(0, 0, -P / 2); perno.add(g);
        const fondo = scatola(L - .04, .02, P - .04, legnoScuro); fondo.position.y = .01; g.add(fondo);
        const fronte = scatola(L, A, .02, legnoM); fronte.position.set(0, A / 2, P / 2 - .01); const retro = scatola(L, A, .02, legnoM); retro.position.set(0, A / 2, -P / 2 + .01);
        const latoS = scatola(.02, A, P - .04, legnoM); latoS.position.set(-L / 2 + .01, A / 2, 0); const latoD = scatola(.02, A, P - .04, legnoM); latoD.position.set(L / 2 - .01, A / 2, 0);
        g.add(fronte, retro, latoS, latoD);
        for (const x of [-L / 2 + .018, L / 2 - .018]) for (const z of [-P / 2 + .018, P / 2 - .018]) { const m = scatola(.04, A, .04, legnoScuro); m.position.set(x, A / 2, z); g.add(m); }
        for (const y of [.03, A - .03]) { const b = scatola(L + .004, .028, .012, legnoScuro); b.position.set(0, y, P / 2 + .004); g.add(b); }
        for (const x of [-L / 2 + .02, L / 2 - .02]) { const s = scatola(.03, .05, .03, ferro); s.position.set(x, A - .025, P / 2 + .006); g.add(s); }
        const stencil = new THREE.Mesh(new THREE.PlaneGeometry(.44, .172), new THREE.MeshStandardMaterial({ map: texStencil(c, lingua), transparent: true, roughness: 1, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
        stencil.position.set(0, c.aperta ? .125 : .14, P / 2 + .0015); g.add(stencil);
        // emblema attaccato davanti
        const emb = adatta(EMBLEMI[c.emblema](), c.aperta ? .17 : .12); emb.position.set(0, c.aperta ? .175 : .21, P / 2 + .03); g.add(emb);
        // coperchio incernierato dietro
        const coperchio = new THREE.Group(); coperchio.position.set(0, A, -P / 2);
        const tavola = scatola(L + .03, .025, P + .03, legnoM); tavola.position.set(0, .0125, (P + .03) / 2); coperchio.add(tavola);
        for (const x of [-L / 2 + .06, L / 2 - .06]) { const s = scatola(.04, .02, P + .02, legnoScuro); s.position.set(x, .033, (P + .03) / 2); coperchio.add(s); }
        if (!c.aperta) for (const [dx, ruota, w] of [[-.1, 0, .05], [.12, 0, .05]]) { const n = scatola(w, .004, P + .04, mat('#b58a4a', { roughness: .5 })); n.position.set(dx, .028, (P + .03) / 2); coperchio.add(n); }
        g.add(coperchio);
        let contenuto = null, riempi = null;
        if (c.aperta) {
            riempi = new THREE.InstancedMesh(geoPallino, matPallino, 130); riempi.castShadow = true;
            corsia.riempimento(i + 1).forEach((p, k) => { dummy.position.set(...p.pos); dummy.rotation.set(p.giro, p.giro * 1.7, p.giro * .6); dummy.updateMatrix(); riempi.setMatrixAt(k, dummy.matrix); });
            g.add(riempi);
            contenuto = adatta(EMBLEMI[c.emblema](), .22); contenuto.visible = false; contenuto.rotation.set(-.9, .4, 0); g.add(contenuto);
        }
        const bersaglio = new THREE.Mesh(new THREE.BoxGeometry(L, A + .06, P), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }));
        bersaglio.position.set(0, A / 2, 0); bersaglio.userData.i = i; g.add(bersaglio); bersagli.push(bersaglio);
        scena.add(perno);
        casse.push({ g, perno, coperchio, contenuto, riempi, sel: false, t0: 0, lid: 0, ripo: A * .5, ypos: pos.y });
    });
    const puffoMesh = new THREE.InstancedMesh(geoPallino, matPallino, 40); puffoMesh.visible = false; puffoMesh.frustumCulled = false;

    /* modelli Poly Haven: scaffali di fondo, lampada, carrello, cartoni */
    const caricatore = new GLTFLoader();
    const carica = nome => caricatore.loadAsync(MODELLI + nome + '.glb').then(g => g.scene).catch(() => null);
    const [scaff, lampadaM, carrello, cartone] = await Promise.all(['steel_frame_shelves_01', 'hanging_industrial_lamp', 'hand_truck', 'cardboard_box_01'].map(carica));
    const prepara = (o, aTrasparenza) => o.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; if (aTrasparenza && m.material && m.material.transmission) { m.material.transmission = 0; m.material.transparent = true; m.material.opacity = .4; } } });
    if (scaff) [-.6, 1.9, 4.4, 6.9].forEach(x => { const s = adatta(scaff.clone(true), 2.1, true); prepara(s); s.position.set(x, PAV, -1.7); s.rotation.y = 0; scena.add(s); });
    if (cartone) [[4.65, .75, 0], [4.55, .75, .5], [4.95, .75, .2], [-.2, -1.1, .3]].forEach(([x, z, r], k) => { const c = adatta(cartone.clone(true), .42, true); prepara(c); c.position.set(x, PAV, z); c.rotation.y = r + k; scena.add(c); });
    if (cartone) { const c = adatta(cartone.clone(true), .36, true); prepara(c); c.position.set(4.7, PAV + .42, .7); c.rotation.y = .4; scena.add(c); }
    if (carrello) { const c = adatta(carrello.clone(true), 1.2, true); prepara(c); c.position.set(corsia.X_BANCONE + .15, PAV, .45); c.rotation.y = .9; scena.add(c); }
    let lampada = null;
    const LX = BX, LY = 1.3;
    const luceLampada = new THREE.PointLight('#ffcf8a', 0, 5, 1.8); luceLampada.position.set(LX, LY - .15, .05); scena.add(luceLampada);
    if (lampadaM) { lampada = adatta(lampadaM.clone(true), .36, true); prepara(lampada, telefono); lampada.position.set(LX, LY, -.05); scena.add(lampada); }
    const lampadina = new THREE.Mesh(new THREE.SphereGeometry(.05, 12, 8), new THREE.MeshStandardMaterial({ color: '#333', emissive: '#ffcf8a', emissiveIntensity: 0 })); lampadina.position.set(LX, LY - .06, -.05); scena.add(lampadina);
    // il cordino: filo, pomello
    const filo = cilindro(.004, .004, .3, mat('#d8d2c4')); filo.position.set(LX + .12, LY - .0, .05); scena.add(filo);
    const pomello = new THREE.Mesh(new THREE.SphereGeometry(.024, 12, 8), mat('#c81035', { roughness: .4 })); pomello.position.set(LX + .12, LY - .17, .05); scena.add(pomello);

    /* inquadratura */
    let visLarg = 4, camX = 0, camXT = 0, lim = { min: 0, max: 0 }, selezione = -1;
    function dimensiona() {
        const w = contenitore.clientWidth, h = contenitore.clientHeight;
        renderer.setSize(w, h, false); camera.aspect = w / h;
        const verticale = camera.aspect < 1;
        camera.fov = verticale ? 62 : 44; camera.position.set(camX, verticale ? .95 : .9, verticale ? 3.3 : 2.75);
        camera.updateProjectionMatrix();
        visLarg = 2 * (verticale ? 3.3 : 2.75) * Math.tan(camera.fov * Math.PI / 360) * camera.aspect;
        lim = corsia.limitiCamera(visLarg);
        camXT = Math.min(lim.max, Math.max(lim.min, camXT));
    }
    camX = camXT = corsia.limitiCamera(10).min; dimensiona(); camX = camXT = lim.min;
    const ro = new ResizeObserver(dimensiona); ro.observe(contenitore);

    /* accensione */
    let luceOn = acceso || calmo(), accendendo = false, t0acc = 0, risolvi = null, promessaAcc = Promise.resolve();
    function applicaLuce(lums, tutta) {
        const media = lums.reduce((a, b) => a + b, 0) / lums.length;
        emisfero.intensity = .07 + .55 * media;
        faro.intensity = tutta ? 34 : 34 * media;
        lums.forEach((v, i) => { neonMat[i].emissiveIntensity = v * 2.6; neonLuce[i].intensity = v * 5.5; });
        luceLampada.intensity = .5 + (tutta ? 1.4 : 1.4 * media); lampadina.material.emissiveIntensity = .5 + 2 * media;
    }
    applicaLuce(luceOn ? [1, 1, 1, 1] : [0, 0, 0, 0], luceOn);
    luceLampada.intensity = luceOn ? 1.9 : .5;
    function accendi() {
        if (luceOn || accendendo) return promessaAcc;
        accendendo = true; t0acc = ora();
        promessaAcc = new Promise(r => { risolvi = r; });
        return promessaAcc;
    }

    /* eventi e puntatore */
    const ascoltatori = { seleziona: [], gioca: [], chiusa: [] };
    const emetti = (e, v) => ascoltatori[e].forEach(f => f(v));
    function seleziona(i) {
        if (i < 0 || i >= N || !CASSE[i].aperta || i === selezione) return;
        if (selezione >= 0) casse[selezione].sel = false;
        selezione = i; const e = casse[i]; e.sel = true; e.t0 = ora();
        e.g.add(puffoMesh); puffoMesh.visible = false;
        camXT = Math.min(lim.max, Math.max(lim.min, corsia.postoCassa(i).x));
        emetti('seleziona', i);
    }
    const raggio = new THREE.Raycaster(), p2 = new THREE.Vector2();
    function cassaSotto(ev) {
        const r = renderer.domElement.getBoundingClientRect();
        p2.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
        raggio.setFromCamera(p2, camera);
        const h = raggio.intersectObjects(bersagli, false)[0];
        return h ? h.object.userData.i : -1;
    }
    let giu = null;
    const cv = renderer.domElement;
    cv.addEventListener('pointerdown', ev => { giu = { x: ev.clientX, camX0: camXT, mosso: false, tipo: ev.pointerType }; cv.setPointerCapture(ev.pointerId); });
    cv.addEventListener('pointermove', ev => {
        if (giu) {
            const dx = ev.clientX - giu.x;
            if (Math.abs(dx) > 6) giu.mosso = true;
            if (giu.mosso) camXT = Math.min(lim.max, Math.max(lim.min, giu.camX0 - dx / cv.clientWidth * visLarg));
        } else if (ev.pointerType === 'mouse') { const i = cassaSotto(ev); if (i >= 0 && CASSE[i].aperta) seleziona(i); cv.style.cursor = i >= 0 ? 'pointer' : 'default'; }
    });
    const rilascia = ev => {
        if (!giu) return;
        const g = giu; giu = null;
        if (g.mosso) { const i = corsia.cassaVicina(camXT); if (i !== selezione) seleziona(i); return; }
        if (!luceOn) { accendi(); return; }
        const i = cassaSotto(ev);
        if (i < 0) return;
        if (!CASSE[i].aperta) { emetti('chiusa', i); return; }
        if (i === selezione) emetti('gioca', i); else seleziona(i);
    };
    cv.addEventListener('pointerup', rilascia);
    cv.addEventListener('pointercancel', () => { giu = null; });

    /* ciclo */
    let raf = 0, visibile = true, prima = ora(), prossimoBattito = ora() + 2000;
    const io = new IntersectionObserver(([e]) => { visibile = e.isIntersecting; if (visibile && !raf) { prima = ora(); raf = requestAnimationFrame(ciclo); } }); io.observe(contenitore);
    const v3 = new THREE.Vector3();
    function ciclo(t) {
        raf = 0; const dt = Math.min(.05, (t - prima) / 1000); prima = t;
        // luce
        if (accendendo) {
            const tt = (t - t0acc) / 1000;
            pomello.position.y = LY - .17 - .08 * Math.sin(lim01(tt / .3) * Math.PI);
            const lums = corsia.accensione(tt - .3);
            applicaLuce(lums, false); luceLampada.intensity = .5 + 1.4 * lums.reduce((a, b) => a + b, 0) / 4;
            if (tt > 1.9) { accendendo = false; luceOn = true; applicaLuce([1, 1, 1, 1], true); luceLampada.intensity = 1.9; risolvi && risolvi(); }
        } else if (luceOn && !calmo()) { const f = .96 + .04 * Math.sin(t / 90) * Math.sin(t / 530); neonMat.forEach((m, i) => { m.emissiveIntensity = 2.6 * (i === 2 ? f : 1); }); }
        // camera
        camX += (camXT - camX) * (1 - Math.exp(-dt * (calmo() ? 40 : 5)));
        camera.position.x = camX; camera.position.y = (camera.aspect < 1 ? .95 : .9) + (calmo() ? 0 : Math.sin(t / 2600) * .008);
        camera.lookAt(camX, camera.aspect < 1 ? .5 : .46, 0);
        faro.position.set(camX, 3.2, 2.6); faro.target.position.set(camX, .3, 0);
        // casse: coperchio, oggetto dentro, polistirolo
        casse.forEach((e, i) => {
            if (!CASSE[i].aperta) return;
            let lid, drop = 0, pt = -1;
            if (e.sel) {
                const age = (t - e.t0) / 1000;
                if (calmo()) { lid = 1; drop = 1; } else { lid = liscia(lim01(age / .6)); drop = lim01((age - .4) / .8); pt = (age - 1.15) / 1.2; }
            } else lid = e.lid + (0 - e.lid) * (1 - Math.exp(-dt * 7)) * (e.lid > .01 ? 1 : 0);
            e.lid = lid;
            e.coperchio.rotation.x = -1.95 * lid;
            e.perno.rotation.x = .3 * lid;                  // la cassa si inclina verso chi guarda: si vede dentro
            e.contenuto.visible = e.sel ? (lid > .25) : lid > .05;
            const rest = A * .74, y = rest + .17 * (1 - esce(drop)) + (e.sel && drop > 0 && drop < 1 ? Math.sin(drop * Math.PI * 2) * .004 : 0);
            e.contenuto.position.set(0, y - .02, .01);
            if (e.sel && pt >= 0 && pt <= 1 && !calmo()) {
                puffoMesh.visible = true;
                corsia.puffo(pt, i + 1).forEach((p, k) => { dummy.position.set(...p.pos); dummy.rotation.set(p.giro, p.giro * 1.3, 0); dummy.updateMatrix(); puffoMesh.setMatrixAt(k, dummy.matrix); });
                puffoMesh.instanceMatrix.needsUpdate = true;
            } else if (e.sel) puffoMesh.visible = false;
        });
        // magazziniere: pose, occhi, bocca
        mz.posa(corsia.poseAnnoiato(calmo() ? 0 : t));
        const occhi = corsia.occhiAnnoiato(t);
        const bocca = t < parlaFino ? ((Math.floor((t - parlaDa) / 140) % 2) ? 'chiusa' : 'aperta') : 'chiusa';
        mz.cambiaFaccia(`${bocca}-${occhi}`);
        // fumetto sopra la testa
        mz.collo.getWorldPosition(v3); v3.y += .45; v3.project(camera);
        const W = contenitore.clientWidth, px = (v3.x + 1) / 2 * W, bw = fumetto.offsetWidth;
        const x = Math.min(W - bw - 8, Math.max(8, px - bw / 2));
        fumetto.style.setProperty('--coda', Math.min(bw - 16, Math.max(16, px - x)) + 'px');
        fumetto.style.transform = `translate(${x}px, ${(1 - v3.y) / 2 * contenitore.clientHeight}px) translateY(-100%)`;
        renderer.render(scena, camera);
        if (visibile && !document.hidden) raf = requestAnimationFrame(ciclo);
    }
    raf = requestAnimationFrame(ciclo);
    document.addEventListener('visibilitychange', () => { if (!document.hidden && !raf) { prima = ora(); raf = requestAnimationFrame(ciclo); } });

    async function parla(testoBattuta) {
        fumetto.textContent = testoBattuta; fumetto.classList.add('acceso');
        const durata = Math.min(2600, 500 + testoBattuta.length * 60);
        parlaDa = ora(); parlaFino = parlaDa + durata * .8;
        await new Promise(r => setTimeout(r, calmo() ? 400 : durata + 300));
        fumetto.classList.remove('acceso');
    }

    return {
        seleziona, selezionata: () => selezione, accendi, acceso: () => luceOn, parla,
        su(evento, cb) { ascoltatori[evento].push(cb); },
        distruggi() { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); renderer.dispose(); cv.remove(); fumetto.remove(); }
    };
}
