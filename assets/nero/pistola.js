/* ==========================================================================
   Pistola della transizione: modello "Service Pistol" (Poly Haven, CC0)
   renderizzato con three.js su un canvas trasparente dentro il livello .sparo.
   Caricato a richiesta da proiettile.js, solo su computer.
   ========================================================================== */
import * as THREE from 'three';
import { GLTFLoader } from '../../gioco/vendor/three/addons/loaders/GLTFLoader.js';

const MODELLO = new URL('pistola/pistola.glb', import.meta.url).href;

// Riflessi del metallo: un piccolo studio con due bande di luce, trasformato in mappa d'ambiente.
function ambiente(renderer) {
    const studio = new THREE.Scene();
    studio.background = new THREE.Color(0x050505);
    const banda = (colore, intensita, x, y, z, sx, sy) => {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(sx, sy), new THREE.MeshBasicMaterial({ color: new THREE.Color(colore).multiplyScalar(intensita), side: THREE.DoubleSide }));
        m.position.set(x, y, z);
        m.lookAt(0, 0, 0);
        studio.add(m);
    };
    banda(0xfff1e0, 9, 4, 5, -3, 6, 1.4);   // luce di taglio calda, alta e dietro
    banda(0xffffff, 3, -1, 4, 5, 8, .5);    // una striscia larga davanti: riflesso lungo sul carrello
    banda(0xdfe8ff, 1.2, -5, 1, 4, 3, 6);   // riempimento freddo, debole
    banda(0xc81035, 1.5, 0, -4, 2, 8, .6);  // un filo cremisi da sotto
    const pmrem = new THREE.PMREMGenerator(renderer);
    const mappa = pmrem.fromScene(studio, .02).texture;
    pmrem.dispose();
    return mappa;
}

/* Proiettile al rame tornito (LatheGeometry), con "oakvx." inciso lungo il fianco:
   una texture disegnata su canvas fa da colore, rilievo e rugosità dell'incisione. */
function creaProiettile() {
    const r = .17;
    const profilo = [new THREE.Vector2(0, 0), new THREE.Vector2(r * .92, 0), new THREE.Vector2(r, .03)];
    for (let i = 1; i <= 24; i++) profilo.push(new THREE.Vector2(r, .03 + .52 * i / 24));          // fianco
    for (let i = 1; i <= 24; i++) {                                                                 // ogiva
        const a = i / 24;
        profilo.push(new THREE.Vector2(r * Math.cos(a * Math.PI / 2) ** .8 * (1 - a * .02), .55 + .45 * Math.sin(a * Math.PI / 2)));
    }
    const geo = new THREE.LatheGeometry(profilo, 96);
    // v della texture: i punti del fianco vanno da 3/51 a 27/51
    const vDa = 3 / (profilo.length - 1), vA = 27 / (profilo.length - 1);

    const W = 1024, H = 1024;
    const tela = n => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
    const colore = tela(), rilievo = tela(), ruvido = tela();
    const scrivi = (c, fondo, inchiostro) => {
        const g = c.getContext('2d');
        g.fillStyle = fondo; g.fillRect(0, 0, W, H);
        // il testo corre lungo l'asse (v), su una striscia di u davanti
        const y0 = (1 - vA) * H, y1 = (1 - vDa) * H;
        g.save();
        g.translate(W * .25, (y0 + y1) / 2);
        g.rotate(-Math.PI / 2);
        g.fillStyle = inchiostro;
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.font = '700 ' + Math.round(W * .085) + 'px "Nero Sans", Arial, sans-serif';
        const lung = y1 - y0;
        const m = g.measureText('oakvx.').width;
        g.scale(Math.min(1, lung * .86 / m), 1);
        g.fillText('oakvx.', 0, 0);
        g.restore();
        // due anelli di zigrinatura alle estremità del fianco
        g.fillStyle = inchiostro;
        g.fillRect(0, y1 - H * .012, W, H * .006);
        g.fillRect(0, y0 + H * .006, W, H * .006);
    };
    scrivi(colore, '#ffffff', '#3a3a3a');
    scrivi(rilievo, '#ffffff', '#000000');
    scrivi(ruvido, '#5a5a5a', '#e0e0e0');
    const tex = (c, srgb) => { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
    const mat = new THREE.MeshStandardMaterial({
        color: 0xc8773e, metalness: 1, roughness: 1,
        map: tex(colore, true), bumpMap: tex(rilievo), bumpScale: 3, roughnessMap: tex(ruvido)
    });
    const mesh = new THREE.Mesh(geo, mat);
    geo.rotateZ(-Math.PI / 2);                   // asse sul +x: la punta guarda dove vola
    geo.translate(-.5, 0, 0);                    // centrato
    const proiettile = new THREE.Group();        // gira su sé stesso (rigatura)
    proiettile.add(mesh);
    const volo = new THREE.Group();              // posizione, orientamento e scala del volo
    volo.add(proiettile);
    return { volo, proiettile };
}

/* Componenti connesse di una mesh indicizzata (vertici uniti per posizione), con la scatola di ognuna. */
function pezzi(pos, indici) {
    const chiave = i => Math.round(pos.getX(i) * 1e5) + ',' + Math.round(pos.getY(i) * 1e5) + ',' + Math.round(pos.getZ(i) * 1e5);
    const id = new Map(), rep = new Map();
    for (const i of indici) { const k = chiave(i); if (!id.has(k)) id.set(k, id.size); rep.set(i, id.get(k)); }
    const padre = new Int32Array(id.size).map((_, i) => i);
    const radice = x => { while (padre[x] !== x) { padre[x] = padre[padre[x]]; x = padre[x]; } return x; };
    for (let t = 0; t < indici.length; t += 3) {
        const a = radice(rep.get(indici[t]));
        padre[radice(rep.get(indici[t + 1]))] = a;
        padre[radice(rep.get(indici[t + 2]))] = a;
    }
    const scatole = new Map();
    for (const i of indici) {
        const r = radice(rep.get(i));
        let b = scatole.get(r);
        if (!b) scatole.set(r, b = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
        const x = pos.getX(i), y = pos.getY(i);
        b.minX = Math.min(b.minX, x); b.maxX = Math.max(b.maxX, x); b.minY = Math.min(b.minY, y); b.maxY = Math.max(b.maxY, y);
    }
    return { scatola: i => scatole.get(radice(rep.get(i))) };
}

export async function creaPistola(contenitore) {
    const canvas = document.createElement('canvas');
    canvas.className = 'sparo__pistola';
    contenitore.prepend(canvas);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    // la pistola resta in scena meno di un secondo: densità contenuta, molti meno pixel da riempire
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.25));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    const scena = new THREE.Scene();
    scena.environment = ambiente(renderer);
    renderer.toneMappingExposure = 1.25;
    // luce principale calda dall'alto davanti, bordo freddo da dietro che stacca la sagoma dal nero
    const chiave = new THREE.DirectionalLight(0xfff1e2, 2.4);
    chiave.position.set(1.5, 3, 4);
    scena.add(chiave);
    const bordo = new THREE.DirectionalLight(0xe6eeff, 4.5);
    bordo.position.set(-2, 2.5, -4);
    scena.add(bordo);
    const cremisi = new THREE.DirectionalLight(0xc81035, 1.2);
    cremisi.position.set(2, -3, 1);
    scena.add(cremisi);

    const camera = new THREE.PerspectiveCamera(24, 1, .01, 50);
    camera.position.set(0, 0, 6);
    camera.updateMatrixWorld(); // senza, project() divide per zero prima del primo disegno

    const gltf = await new GLTFLoader().loadAsync(MODELLO);
    let originale;
    gltf.scene.traverse(o => { if (o.isMesh && !originale) originale = o; });
    originale.updateWorldMatrix(true, false);

    // Il file è una composizione: due pistole, due caricatori e le cartucce in un'unica mesh.
    // Si tiene la pistola con l'impugnatura in legno (quella in basso), senza la cartuccia sciolta accanto.
    const geo = originale.geometry.clone().applyMatrix4(originale.matrixWorld);
    const pos = geo.attributes.position;
    const indici = geo.index.array;
    const tenuti = [];
    for (let t = 0; t < indici.length; t += 3) {
        let cx = 0, cy = 0;
        for (let k = 0; k < 3; k++) { cx += pos.getX(indici[t + k]); cy += pos.getY(indici[t + k]); }
        cx /= 3; cy /= 3;
        const pistolaInBasso = cx > -.065 && cy < .085;
        const cartucciaSciolta = cx > .044 && cx < .063 && cy > -.04 && cy < -.004;
        if (pistolaInBasso && !cartucciaSciolta) tenuti.push(indici[t], indici[t + 1], indici[t + 2]);
    }
    // Il carrello (la parte alta che scorre allo sparo) è fatto di pezzi staccati dal fusto:
    // si raggruppano i triangoli per vertici condivisi e si tengono i pezzi dentro la sua sagoma.
    const pezzo = pezzi(pos, tenuti);
    const fusto = [], carr = [], cartuccia = [];
    for (let t = 0; t < tenuti.length; t += 3) {
        const b = pezzo.scatola(tenuti[t]);
        const diCarrello = b.minY >= .044 && b.maxX <= .107 && b.minX >= -.037;
        (diCarrello ? carr : fusto).push(tenuti[t], tenuti[t + 1], tenuti[t + 2]);
    }
    for (let t = 0; t < indici.length; t += 3) {
        let cx = 0, cy = 0;
        for (let k = 0; k < 3; k++) { cx += pos.getX(indici[t + k]); cy += pos.getY(indici[t + k]); }
        cx /= 3; cy /= 3;
        if (cx > .044 && cx < .063 && cy > -.04 && cy < -.004) cartuccia.push(indici[t], indici[t + 1], indici[t + 2]);
    }
    geo.setIndex(fusto);
    const geoCarrello = geo.clone(); geoCarrello.setIndex(carr);
    // un bossolo sparato è vuoto: via la punta (la parte alta della cartuccia)
    let cimaB = -Infinity;
    for (const i of cartuccia) cimaB = Math.max(cimaB, pos.getY(i));
    const soloBossolo = [];
    for (let t = 0; t < cartuccia.length; t += 3) {
        let cy = 0;
        for (let k = 0; k < 3; k++) cy += pos.getY(cartuccia[t + k]);
        if (cy / 3 < cimaB - .011) soloBossolo.push(cartuccia[t], cartuccia[t + 1], cartuccia[t + 2]);
    }
    cartuccia.length = 0; cartuccia.push(...soloBossolo);
    const geoBossolo = geo.clone(); geoBossolo.setIndex(cartuccia);
    const pistola = new THREE.Mesh(geo, originale.material);
    const carrelloMesh = new THREE.Mesh(geoCarrello, originale.material);

    // volata: centro degli anelli della canna, ricavato dai vertici (coordinate originali)
    const VOLATA = new THREE.Vector3(...window.OAKVX.proiettile.centroCanna(tenuti.map(i => [pos.getX(i), pos.getY(i), pos.getZ(i)])));
    // misure della sola pistola (computeBoundingBox guarderebbe tutti i vertici del file)
    const scatola = new THREE.Box3();
    const v = new THREE.Vector3();
    for (const i of tenuti) scatola.expandByPoint(v.fromBufferAttribute(pos, i));
    const centro = scatola.getCenter(new THREE.Vector3());
    const lunghezza = scatola.max.x - scatola.min.x;
    pistola.position.copy(centro).multiplyScalar(-1);
    carrelloMesh.position.copy(pistola.position);
    const punta = new THREE.Object3D();
    punta.position.copy(VOLATA).sub(centro);

    const perno = new THREE.Group();            // ruota attorno al centro della pistola
    perno.add(pistola, carrelloMesh, punta);
    perno.scale.setScalar(1.6 / lunghezza);
    const POSA = new THREE.Euler(.1, -.55, 0);   // tre quarti, un poco dall'alto: si legge il volume
    perno.rotation.copy(POSA);
    // il rinculo ruota attorno alla presa (sopra l'impugnatura), non al centro dell'arma
    perno.updateMatrix();
    const presa = new THREE.Vector3(-.035, .035, 0).sub(centro).applyMatrix4(perno.matrix);
    const scatto = new THREE.Group();
    scatto.position.copy(presa);
    perno.position.sub(presa);
    scatto.add(perno);
    const gruppo = new THREE.Group();
    gruppo.add(scatto);
    scena.add(gruppo);

    const { volo, proiettile } = creaProiettile();
    volo.visible = false;
    scena.add(volo);

    // bossolo: espulso dalla finestra del carrello, in alto a destra, ruotando, poi cade
    const scatolaB = new THREE.Box3();           // solo i vertici del bossolo, non tutto il file
    for (const i of cartuccia) scatolaB.expandByPoint(v.fromBufferAttribute(pos, i));
    const centroB = scatolaB.getCenter(new THREE.Vector3());
    const bossoloMesh = new THREE.Mesh(geoBossolo, originale.material);
    bossoloMesh.position.copy(centroB).multiplyScalar(-1);
    const bossolo = new THREE.Group();
    bossolo.add(bossoloMesh);
    bossolo.scale.setScalar(perno.scale.x);
    bossolo.visible = false;
    scena.add(bossolo);
    const finestra = new THREE.Object3D();          // finestra di espulsione, sul fianco del carrello
    finestra.position.set(.035, .066, .012).sub(centro);
    perno.add(finestra);
    const partenzaB = new THREE.Vector3();
    let bossoloPartito = false;
    function bossoloVolo(ms) {
        const t = (ms - 310) / 1000;
        if (t < 0) bossoloPartito = false;
        bossolo.visible = t >= 0 && t < .7;
        if (!bossolo.visible) return;
        // la partenza si fissa al primo fotogramma utile, anche se il computer ne salta qualcuno
        if (!bossoloPartito) { finestra.getWorldPosition(partenzaB); bossoloPartito = true; }
        bossolo.position.set(partenzaB.x + .9 * t, partenzaB.y + 2.2 * t - 4.5 * t * t, partenzaB.z + .4 * t);
        bossolo.rotation.set(t * 9, t * 4, -t * 22);
    }
    // la luce del colpo: illumina la pistola per un istante
    const bagliore = new THREE.PointLight(0xffd29a, 0, 3, 2);
    scena.add(bagliore);

    const riposo = new THREE.Vector3();
    const tmp = new THREE.Vector3();
    // mette la volata a (40% larghezza, 46% altezza) dello schermo, 70% in verticale: la pistola si vede intera
    function piazza() {
        const meta = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
        const fx = camera.aspect < 1 ? .70 : .40;     // in verticale la volata va più a destra, l'impugnatura resta in campo
        const obiettivo = new THREE.Vector3((fx * 2 - 1) * meta * camera.aspect, (1 - .46 * 2) * meta, 0);
        gruppo.position.set(0, 0, 0);
        gruppo.updateMatrixWorld(true);
        punta.getWorldPosition(tmp);
        riposo.copy(obiettivo).sub(tmp);
        gruppo.position.copy(riposo);
    }

    function dimensiona() {
        const w = innerWidth, h = innerHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        // in verticale (telefono) si allarga il campo: la pistola deve stare intera in larghezza
        const minimo = .8;
        camera.fov = camera.aspect >= minimo ? 24
            : THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(12)) * minimo / camera.aspect));
        camera.updateProjectionMatrix();
        piazza();
    }
    dimensiona();
    addEventListener('resize', dimensiona);

    // Prepara tutto subito (shader compilati, texture caricate sulla GPU) disegnando una volta
    // con la pistola fuori campo: al clic il primo fotogramma non deve aspettare nulla.
    renderer.compile(scena, camera);
    gruppo.position.x = riposo.x - 6;
    renderer.render(scena, camera);
    gruppo.position.copy(riposo);

    function disegna() { renderer.render(scena, camera); }

    const partenzaMondo = new THREE.Vector3();
    const arrivoMondo = new THREE.Vector3();
    const asseMondo = new THREE.Vector3();          // direzione della canna nel mondo, all'uscita
    const X = new THREE.Vector3(1, 0, 0);
    const qAsse = new THREE.Quaternion(), qFine = new THREE.Quaternion(), qTmp = new THREE.Quaternion();
    const eFine = new THREE.Euler();
    let proiettilePartito = false;
    const scalaPartenza = .16;                   // lunghezza ~0,16: un proiettile accanto a una pistola lunga 1,6

    const facile = t => 1 - Math.pow(1 - t, 3);
    let raf = 0;

    /* Entra da sinistra, spara (rinculo secco), esce: i tempi arrivano da fase() di proiettile.js. */
    function spara(tempo) {
        const fase = window.OAKVX.proiettile.faseVolo;
        const fuori = riposo.x - 2.4;            // abbastanza a sinistra da essere fuori schermo
        const partenza = volata();
        punta.getWorldPosition(partenzaMondo); // volata() lascia tmp proiettato sullo schermo
        // arrivo: appena davanti alla camera, al centro dello schermo
        arrivoMondo.set(0, 0, camera.position.z - .55);
        cancelAnimationFrame(raf);
        bossoloPartito = false; proiettilePartito = false;
        const passo = () => {
            const ms = tempo();
            const f = fase(ms);
            const P = window.OAKVX.proiettile;
            const k = P.rinculo(ms);
            if (ms < 600) {
                // entrata: il braccio la porta su da sotto a sinistra e si ferma con un leggero assestamento
                const e = Math.min(1, ms / 280), c = 1.5;
                const r = 1 + (c + 1) * Math.pow(e - 1, 3) + c * Math.pow(e - 1, 2);   // ease-out con un filo di oltre
                gruppo.position.set(fuori + (riposo.x - fuori) * r, riposo.y - (1 - r) * .5, riposo.z);
                gruppo.rotation.z = (1 - r) * .35;
            } else {
                // uscita: il braccio si abbassa e la porta fuori dal basso
                const u = 1 - f.pistola, q = u * u;
                gruppo.position.set(riposo.x - q * .35, riposo.y - q * 1.7, riposo.z);
                gruppo.rotation.z = -q * .7;
            }
            scatto.rotation.set(0, 0, k * .26);             // la canna scatta in su di ~15°, poi rimbalza un filo
            scatto.position.x = presa.x - Math.max(0, k) * .06; // e l'arma arretra nel polso
            carrelloMesh.position.x = pistola.position.x - P.carrello(ms) * .028; // il carrello scorre indietro e torna
            // scossa: tre fotogrammi di tremolio dopo il colpo
            const sc = ms > 300 && ms < 360 ? (1 - (ms - 300) / 60) * .012 : 0;
            camera.position.set((Math.random() - .5) * sc, (Math.random() - .5) * sc, 6);
            camera.updateMatrixWorld();
            bossoloVolo(ms);
            gruppo.updateMatrixWorld(true);
            punta.getWorldPosition(tmp);
            bagliore.position.copy(tmp);
            bagliore.intensity = (f.lampo || 0) * 6;
            if (f.volo === 0) proiettilePartito = false;
            volo.visible = f.volo > 0 && f.copertura < 1;
            if (volo.visible) {
                // dalla volata verso la camera: si avvicina, cresce e si gira a mostrare l'incisione
                const v = f.volo;
                // finché è a ridosso della canna la segue nel rinculo, poi tira dritto
                if (v < .03 || !proiettilePartito) {
                    punta.getWorldPosition(partenzaMondo);
                    asseMondo.copy(X).applyQuaternion(punta.getWorldQuaternion(qTmp)).normalize();
                    proiettilePartito = true;
                }
                // esce sull'asse della canna, poi curva verso chi guarda
                const q = P.traiettoria(v, partenzaMondo.toArray(), asseMondo.toArray(), arrivoMondo.toArray());
                volo.position.set(q[0], q[1], q[2]);
                volo.scale.setScalar(scalaPartenza * (1 + v * 5));
                // orientato come la canna finché è appena uscito, poi si gira di lato a mostrare l'incisione
                qAsse.setFromUnitVectors(X, asseMondo);
                qFine.setFromEuler(eFine.set(0, -.15 - v * .55, -v * .12));
                const giro = Math.min(1, Math.max(0, (v - .12) / .3));
                volo.quaternion.copy(qAsse).slerp(qFine, giro * giro * (3 - 2 * giro));
                proiettile.rotation.x = -Math.PI / 2 + (.75 - v) * .9; // l'incisione arriva di fronte alla fine
            }
            disegna();
            if (ms < window.OAKVX.proiettile.VOLO_MS + 60) raf = requestAnimationFrame(passo);
        };
        raf = requestAnimationFrame(passo);
    }

    // posizione della volata sullo schermo, a riposo
    function volata() {
        gruppo.position.copy(riposo);
        gruppo.rotation.set(0, 0, 0);
        perno.rotation.copy(POSA);
        scatto.rotation.set(0, 0, 0);
        scatto.position.copy(presa);
        gruppo.updateMatrixWorld(true);
        punta.getWorldPosition(tmp).project(camera);
        return { x: Math.round((tmp.x + 1) / 2 * innerWidth), y: Math.round((1 - tmp.y) / 2 * innerHeight) };
    }

    // volata nella posa di adesso (senza riportare l'arma a riposo): per lampo e fumo
    const qui = new THREE.Vector3();
    function volataOra() {
        punta.getWorldPosition(qui).project(camera);
        return { x: Math.round((qui.x + 1) / 2 * innerWidth), y: Math.round((1 - qui.y) / 2 * innerHeight) };
    }

    return {
        pronta: () => true,
        volata,
        volataOra,
        spara,
        disegna,
        distruggi() { removeEventListener('resize', dimensiona); renderer.dispose(); canvas.remove(); }
    };
}
