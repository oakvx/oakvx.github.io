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

export async function creaPistola(contenitore) {
    const canvas = document.createElement('canvas');
    canvas.className = 'sparo__pistola';
    contenitore.prepend(canvas);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
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
    geo.setIndex(tenuti);
    const pistola = new THREE.Mesh(geo, originale.material);

    // volata: estremità della canna, nelle coordinate originali
    const VOLATA = new THREE.Vector3(.176, .057, 0);
    // misure della sola pistola (computeBoundingBox guarderebbe tutti i vertici del file)
    const scatola = new THREE.Box3();
    const v = new THREE.Vector3();
    for (const i of tenuti) scatola.expandByPoint(v.fromBufferAttribute(pos, i));
    const centro = scatola.getCenter(new THREE.Vector3());
    const lunghezza = scatola.max.x - scatola.min.x;
    pistola.position.copy(centro).multiplyScalar(-1);
    const punta = new THREE.Object3D();
    punta.position.copy(VOLATA).sub(centro);

    const perno = new THREE.Group();            // ruota attorno al centro della pistola
    perno.add(pistola, punta);
    perno.scale.setScalar(1.6 / lunghezza);
    const POSA = new THREE.Euler(.1, -.55, 0);   // tre quarti, un poco dall'alto: si legge il volume
    perno.rotation.copy(POSA);
    const gruppo = new THREE.Group();
    gruppo.add(perno);
    scena.add(gruppo);

    const riposo = new THREE.Vector3();
    const tmp = new THREE.Vector3();
    // mette la volata a (40% larghezza, 46% altezza) dello schermo: la pistola si vede intera
    function piazza() {
        const meta = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
        const obiettivo = new THREE.Vector3((.40 * 2 - 1) * meta * camera.aspect, (1 - .46 * 2) * meta, 0);
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
        camera.updateProjectionMatrix();
        piazza();
    }
    dimensiona();
    addEventListener('resize', dimensiona);

    function disegna() { renderer.render(scena, camera); }

    const facile = t => 1 - Math.pow(1 - t, 3);
    let raf = 0;

    /* Entra da sinistra, spara (rinculo secco), esce: i tempi arrivano da fase() di proiettile.js. */
    function spara(tempo) {
        const fase = window.OAKVX.proiettile.fase;
        const fuori = riposo.x - 2.4;            // abbastanza a sinistra da essere fuori schermo
        cancelAnimationFrame(raf);
        const passo = () => {
            const ms = tempo();
            const f = fase(ms);
            const k = f.sparo > 0 && f.sparo < 1 ? Math.sin(Math.min(1, f.sparo * 1.6) * Math.PI) : 0;
            gruppo.position.x = fuori + (riposo.x - fuori) * facile(f.pistola) - k * .05;
            gruppo.position.y = riposo.y;
            perno.rotation.set(POSA.x, POSA.y, k * .14); // la canna si alza di circa 8°
            disegna();
            if (ms < window.OAKVX.proiettile.USCITA_MS + 60) raf = requestAnimationFrame(passo);
        };
        raf = requestAnimationFrame(passo);
    }

    // posizione della volata sullo schermo, a riposo
    function volata() {
        gruppo.position.copy(riposo);
        perno.rotation.copy(POSA);
        gruppo.updateMatrixWorld(true);
        punta.getWorldPosition(tmp).project(camera);
        return { x: Math.round((tmp.x + 1) / 2 * innerWidth), y: Math.round((1 - tmp.y) / 2 * innerHeight) };
    }

    return {
        pronta: () => true,
        volata,
        spara,
        disegna,
        distruggi() { removeEventListener('resize', dimensiona); renderer.dispose(); canvas.remove(); }
    };
}
