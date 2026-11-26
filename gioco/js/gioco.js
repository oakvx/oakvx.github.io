// Il gioco: caricato solo dopo la scelta "Gioco" nel menu.
import * as THREE from 'three';
import { creaMateriali, texTesto, canvasTex } from './engine/materiali.js';
import { Mondo, geoTonda } from './engine/mondo.js';
import { creaArredi } from './engine/arredi.js';
import { Corpo, muovi, passoCorpo, G } from './engine/fisica.js';
import { Portali } from './portali.js';
import { Passaggi } from './engine/passaggi.js';
import { Narratore } from './narratore.js';
import { Suoni } from './audio.js';
import { reduceMotion } from './menu.js';
import { creaGiro, creaAiuti } from './logica/giro.js';
import { creaContapassi } from './logica/passi.js';

const $ = (id) => document.getElementById(id);
const STANZE = ['ingresso', 'percorso', 'smistamento', 'yag', 'piko', 'brat', 'synk', 'beautify', 'oakvx', 'atrio', 'piscina', 'cisterna', 'spirale', 'supermercato', 'nave', 'ballatoio'];
const ATMOSFERA = { nebbia: 0x3c423f, vicino: 3, lontano: 26, cielo: 0xe4ece6, terra: 0x404642, intensita: 2.3 };
const N_LUCI = 10;
const SPAWN = new THREE.Vector3(0, 0.86, 2.6);
const VEL = 3.2;
const SALTO = 4.6;
const FOG = 0x3c423f;

function leggiImpostazioni() {
  const base = { fov: 74, sens: 1, sott: 'medi', qual: '0.5', calmo: reduceMotion };
  try { return { ...base, ...JSON.parse(localStorage.getItem('gioco-imp') || '{}') }; } catch { return base; }
}

export async function avvia(ctx) {
  // ---------------------------------------------------------------- renderer e scena
  const canvas = $('scena');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(FOG);
  scene.fog = new THREE.Fog(FOG, ATMOSFERA.vicino, ATMOSFERA.lontano);
  const imp = leggiImpostazioni();
  const camera = new THREE.PerspectiveCamera(imp.fov, innerWidth / innerHeight, 0.02, 80);
  camera.rotation.order = 'YXZ';
  const emi = new THREE.HemisphereLight(ATMOSFERA.cielo, ATMOSFERA.terra, ATMOSFERA.intensita);
  scene.add(emi);
  // gruppo fisso di luci puntiformi, assegnate alle definizioni più vicine
  const gruppoLuci = Array.from({ length: N_LUCI }, () => {
    const l = new THREE.PointLight(0xffffff, 0, 1, 2);
    scene.add(l);
    return l;
  });
  let assegnate = [];
  let prossimaAssegnazione = 0;

  const mat = creaMateriali(renderer);
  const mondo = new Mondo(scene, mat);
  const portali = new Portali(renderer, scene, mondo);
  const passaggi = new Passaggi(renderer, scene);
  const suoni = new Suoni(ctx);
  const datiNarr = await (await fetch('dati/narratore.json')).json();
  const narratore = new Narratore(datiNarr, ctx, suoni);
  try { await document.fonts.load('700 40px Archivo'); } catch { /* font di sistema */ }

  // ---------------------------------------------------------------- eventi
  const ascolto = new Map();
  const emetti = (nome, d) => {
    narratore.evento(nome, d);
    (ascolto.get(nome) || []).forEach((fn) => fn(d));
    gestisciEvento(nome, d);
  };
  const su = (nome, fn) => { if (!ascolto.has(nome)) ascolto.set(nome, []); ascolto.get(nome).push(fn); };

  // ---------------------------------------------------------------- giocatore e corpi
  const giocatore = new Corpo(SPAWN, new THREE.Vector3(0.28, 0.85, 0.28), { tipo: 'giocatore' });
  giocatore.passo = 0.36;
  let inAcqua = false;
  const cubi = [];
  let yaw = 0;
  let pitch = 0;
  // cubi a spigoli vivi, con un hash di commit stampato sui lati
  const geoCubo = new THREE.BoxGeometry(0.44, 0.44, 0.44);
  const matCubo = () => {
    const hash = Array.from({ length: 7 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
    return new THREE.MeshLambertMaterial({ map: canvasTex(128, 128, (c, w, h) => {
      c.fillStyle = '#9a9c95'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#6d706a'; c.fillRect(0, 0, w, 6); c.fillRect(0, h - 6, w, 6); c.fillRect(0, 0, 6, h); c.fillRect(w - 6, 0, 6, h);
      c.fillStyle = '#23292a'; c.font = '700 22px monospace'; c.textAlign = 'center'; c.fillText(hash, w / 2, h / 2 + 8);
    }) });
  };
  const interattivi = [];

  function cubo(x, y, z, { speciale = false, mappa = null } = {}) {
    const mesh = new THREE.Mesh(geoCubo, mappa ? new THREE.MeshLambertMaterial({ map: mappa, emissive: 0x6b5520, emissiveIntensity: 0.6 }) : matCubo());
    mesh.position.set(x, y, z);
    scene.add(mesh);
    const c = new Corpo(mesh.position, new THREE.Vector3(0.22, 0.22, 0.22), { mesh });
    c.speciale = speciale;
    mesh.userData.corpo = c;
    cubi.push(c);
    return c;
  }

  let fadeCb = null;
  const controlli = new Map();
  const aiuti = new Map();
  const g = {
    mondo, scene, portali, passaggi, emetti, su, cubo, debug: ctx.debug,
    T: () => ctx.T,
    lingua: () => ctx.lingua,
    suLingua: (fn) => ctx.suLingua(fn),
    texTesto,
    interattivo: (mesh, chiave) => { mesh.userData.chiave = chiave; interattivi.push(mesh); },
    giocatore: () => giocatore,
    yaw: () => yaw,
    narratore: () => narratore,
    suoni,
    musica: suoni.musica,
    giro: creaGiro(),
    // punto di ripresa di una stanza: chi cade o si incastra torna qui
    puntoControllo: (stanza, x, piedi, z, yawP = 0) => { controlli.set(stanza, { x, piedi, z, yaw: yawP }); },
    cartiglio: (chiave) => apriCartiglio(chiave),
    lampada: (id) => {
      if (!g.giro.completa(id)) return false;
      suoni.lampada?.();
      emetti('lampada:' + id);
      return true;
    },
    aiuti: (stanza) => {
      const a = creaAiuti();
      aiuti.set(stanza, a);
      return a;
    },
    segreto: (id) => { if (g.giro.segreto(id)) emetti('segreto:' + id); },
    fine: () => fine(),
    teletrasporta: (x, piedi, z, nuovoYaw = null, prima = null) => g.velo(() => {
      if (prima) prima();
      giocatore.pos.set(x, piedi + giocatore.half.y + 0.01, z);
      giocatore.vel.set(0, 0, 0);
      giocatore.zPrima = [null, null];
      if (nuovoYaw !== null) yaw = nuovoYaw;
      if (tenuto) { tenuto.tenuto = false; tenuto = null; }
    }),
    velo: (fn) => {
      $('velo').classList.add('on');
      fadeCb = fn;
      setTimeout(() => { if (fadeCb) { fadeCb(); fadeCb = null; } $('velo').classList.remove('on'); }, 300);
    },
  };

  g.arredi = creaArredi(mondo, g);

  // le stanze sono moduli separati, scaricati qui
  const moduli = await Promise.all(STANZE.map((n) => import(`./stanze/${n}.js`)));
  const debugStanze = {};
  moduli.forEach((mod, i) => {
    const esito = mod.costruisci(mondo, g);
    if (esito && esito.debug) debugStanze[STANZE[i]] = esito.debug;
  });
  // i vetri sono solidi ma il raggio delle finestre li attraversa
  const meshSolide = mondo.solidi.filter((s) => s.mesh && s.mesh.visible && !s.mesh.userData.vetro).map((s) => s.mesh);

  // ---------------------------------------------------------------- post-processing
  const rt = new THREE.WebGLRenderTarget(2, 2, { type: THREE.HalfFloatType, samples: 4 });
  const post = new THREE.ShaderMaterial({
    uniforms: { tDiffuse: { value: rt.texture }, uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uCalmo: { value: imp.calmo ? 1 : 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `
      uniform sampler2D tDiffuse; uniform float uTime; uniform vec2 uRes; uniform float uCalmo;
      varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main(){
        vec2 c = vUv - 0.5; float r2 = dot(c, c);
        vec2 off = c * 0.004 * (1.0 + r2 * 4.0) * (1.0 - uCalmo);
        vec3 col = vec3(texture2D(tDiffuse, vUv + off).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - off).b);
        col = pow(max(col, 0.0), vec3(1.0 / 2.2));
        col *= vec3(1.0, 0.99, 0.96);
        col *= mix(0.7, 1.0, smoothstep(0.62, 0.08, r2));
        col += (hash(vUv * uRes + fract(uTime) * 91.0) - 0.5) * mix(0.05, 0.02, uCalmo);
        col = floor(col * 48.0 + 0.5) / 48.0;
        gl_FragColor = vec4(col, 1.0);
      }`,
    depthTest: false,
    depthWrite: false,
  });
  const postScene = new THREE.Scene();
  postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post));
  const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  function ridimensiona() {
    const pr = Math.min(devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(pr);
    renderer.setSize(innerWidth, innerHeight, false);
    const w = Math.floor(innerWidth * pr);
    const h = Math.floor(innerHeight * pr);
    rt.setSize(w, h);
    post.uniforms.uRes.value.set(w, h);
    portali.impostaScala(Number(imp.qual), w, h);
    passaggi.ridimensiona(w, h, Number(imp.qual));
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', ridimensiona);
  ridimensiona();

  // ---------------------------------------------------------------- impostazioni
  function applicaImpostazioni() {
    camera.fov = imp.fov;
    camera.updateProjectionMatrix();
    post.uniforms.uCalmo.value = imp.calmo ? 1 : 0;
    suoni.musica.calmo(imp.calmo);
    $('sottotitoli').className = 'sottotitoli ' + imp.sott + ($('sottotitoli').classList.contains('panico') ? ' panico' : '');
    portali.impostaScala(Number(imp.qual), rt.width, rt.height);
    passaggi.ridimensiona(rt.width, rt.height, Number(imp.qual));
    $('imp-fov').value = imp.fov;
    $('imp-fov-v').textContent = imp.fov + '°';
    $('imp-sens').value = imp.sens;
    $('imp-sens-v').textContent = Number(imp.sens).toFixed(1);
    $('imp-sott').value = imp.sott;
    $('imp-qual').value = imp.qual;
    $('imp-calmo').checked = !!imp.calmo;
    localStorage.setItem('gioco-imp', JSON.stringify(imp));
  }
  $('imp-fov').addEventListener('input', (e) => { imp.fov = Number(e.target.value); applicaImpostazioni(); });
  $('imp-sens').addEventListener('input', (e) => { imp.sens = Number(e.target.value); applicaImpostazioni(); });
  $('imp-sott').addEventListener('change', (e) => { imp.sott = e.target.value; applicaImpostazioni(); });
  $('imp-qual').addEventListener('change', (e) => { imp.qual = e.target.value; applicaImpostazioni(); });
  $('imp-calmo').addEventListener('change', (e) => { imp.calmo = e.target.checked; applicaImpostazioni(); });
  applicaImpostazioni();

  // ---------------------------------------------------------------- stato di gioco
  let stato = 'avvio';            // avvio | gioco | pausa | finale
  let gesto = false;
  let tenuto = null;
  let finito = false;
  let fermo = 0;
  let passi = 0;
  const contapassi = creaContapassi(0.55);
  let stanzaAttuale = null;
  let ultimoControllo = 'ingresso';
  let mirato = null;
  let cartiglio = null;           // { chiave, pos } mentre è aperto
  const tasti = new Set();

  function mostra(id) {
    for (const p of ['avvio', 'pausa', 'finale']) $(p).hidden = p !== id;
    const inGioco = id === null;
    $('mirino').hidden = !inGioco;
    $('finestre').hidden = !inGioco || !gesto;
    if (!inGioco) $('suggerimento').hidden = true;
    $('sottotitoli').style.visibility = id === 'pausa' ? 'hidden' : '';
    if (!inGioco) chiudiCartiglio();
  }

  function apriCartiglio(chiave) {
    const c = ctx.T.cartigli && ctx.T.cartigli[chiave];
    if (!c) return;
    cartiglio = { chiave, pos: giocatore.pos.clone() };
    $('cartiglio-titolo').textContent = c.titolo;
    $('cartiglio-testo').textContent = c.testo;
    $('cartiglio').hidden = false;
  }
  function chiudiCartiglio() {
    cartiglio = null;
    $('cartiglio').hidden = true;
  }
  ctx.suLingua(() => { if (cartiglio) apriCartiglio(cartiglio.chiave); });

  function riprendi() {
    const c = controlli.get(ultimoControllo) || controlli.get('ingresso');
    if (!c) return;
    giocatore.pos.set(c.x, c.piedi + giocatore.half.y + 0.01, c.z);
    giocatore.vel.set(0, 0, 0);
    giocatore.zPrima = [null, null];
    yaw = c.yaw;
    pitch = 0;
    if (tenuto) { tenuto.tenuto = false; tenuto = null; }
  }

  function blocca() {
    suoni.avvia();
    const r = canvas.requestPointerLock();
    if (r && typeof r.catch === 'function') r.catch(() => {});
  }

  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === canvas) {
      stato = 'gioco';
      mostra(null);
    } else if (stato === 'gioco') {
      stato = 'pausa';
      tasti.clear();
      mostra('pausa');
      $('riprendi').focus();
    }
  });

  const ricomincia = () => {
    const u = new URL(location.href);
    u.searchParams.set('avvia', 'gioco');
    u.searchParams.set('lang', ctx.lingua);
    location.href = u.href;
  };
  $('avvio-entra').addEventListener('click', blocca);
  $('riprendi').addEventListener('click', blocca);
  $('punto-controllo').addEventListener('click', () => { g.velo(riprendi); blocca(); });
  $('ricomincia').addEventListener('click', ricomincia);
  $('ricomincia-pausa').addEventListener('click', ricomincia);
  canvas.addEventListener('click', () => { if (stato === 'pausa' || stato === 'avvio') blocca(); });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  document.addEventListener('mousemove', (e) => {
    if (stato !== 'gioco') return;
    const k = 0.0021 * imp.sens;
    yaw -= e.movementX * k;
    pitch = Math.max(-1.45, Math.min(1.45, pitch - e.movementY * k));
    if (Math.abs(e.movementX) + Math.abs(e.movementY) > 2) fermo = 0;
  });

  document.addEventListener('mousedown', (e) => {
    if (stato !== 'gioco') return;
    fermo = 0;
    if (e.button === 0 && tenuto) { lancia(); return; }
    if ((e.button === 0 || e.button === 2) && gesto) spara(e.button === 0 ? 0 : 1);
  });

  document.addEventListener('keydown', (e) => {
    if (stato === 'gioco') {
      fermo = 0;
      if (e.code === 'KeyE' && !e.repeat) interagisci();
      if (e.code === 'Space' && giocatore.aTerra) {
        const st = mondo.stanzaDi(giocatore.pos);
        giocatore.vel.y = SALTO * Math.sqrt(st ? st.gravita : 1);
      }
      tasti.add(e.code);
      if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
    }
  });
  document.addEventListener('keyup', (e) => tasti.delete(e.code));
  addEventListener('blur', () => tasti.clear());

  // ---------------------------------------------------------------- azioni
  const raggio = new THREE.Raycaster();
  const centro = new THREE.Vector2(0, 0);
  const avanti = () => new THREE.Vector3(0, 0, -1).applyEuler(camera.rotation);

  function spara(i) {
    raggio.setFromCamera(centro, camera);
    raggio.far = 45;
    const hit = raggio.intersectObjects(meshSolide, false)[0];
    if (!hit || !hit.object.userData.pannello) { suoni.errore(); return; }
    const esito = portali.piazza(i, hit);
    if (esito === 'ok' || esito === 'proibito') {
      suoni.finestra(i);
      $('finestre').querySelector(i === 0 ? '.a' : '.b').classList.add('on');
      emetti(esito === 'proibito' ? 'portale:proibito' : 'portale:ok', { i });
    } else suoni.errore();
  }

  function interagisci() {
    if (tenuto) { tenuto.tenuto = false; tenuto = null; return; }
    if (cartiglio) { chiudiCartiglio(); return; }
    if (!mirato) return;
    if (mirato.corpo) {
      tenuto = mirato.corpo;
      tenuto.tenuto = true;
      suoni.presa();
      if (tenuto.speciale) emetti('speciale');
      return;
    }
    const k = mirato.chiave;
    emetti('oggetto:' + k);
    if (ctx.T.cartigli && ctx.T.cartigli[k]) apriCartiglio(k);
  }

  function lancia() {
    const c = tenuto;
    c.tenuto = false;
    tenuto = null;
    c.vel.copy(avanti().multiplyScalar(8)).add(giocatore.vel);
    emetti('lancia');
  }

  function aggiornaMira() {
    raggio.setFromCamera(centro, camera);
    raggio.far = 2.8;
    const ogg = [...interattivi, ...cubi.filter((c) => !c.tenuto).map((c) => c.mesh)];
    const hit = raggio.intersectObjects(ogg, false)[0];
    const muro = raggio.intersectObjects(meshSolide, false)[0];
    const valido = hit && (!muro || muro.distance > hit.distance - 0.05);
    mirato = valido ? (hit.object.userData.corpo ? { corpo: hit.object.userData.corpo } : { chiave: hit.object.userData.chiave }) : null;
    const sugg = $('suggerimento');
    $('mirino').classList.toggle('attivo', !!mirato);
    if (tenuto) { sugg.textContent = ctx.T.lascia; sugg.hidden = false; }
    else if (mirato) {
      sugg.textContent = ctx.T.interagisci + (mirato.corpo ? ctx.T.prendi : (ctx.T.azioni && ctx.T.azioni[mirato.chiave]) || ctx.T.esamina);
      sugg.hidden = false;
    } else sugg.hidden = true;
  }

  // ---------------------------------------------------------------- eventi di gioco
  function gestisciEvento(nome) {
    if (nome === 'gesto' && !gesto) {
      gesto = true;
      $('finestre').hidden = stato !== 'gioco';
    }
  }

  // la schermata finale (riempita dalla stanza dei contatti)
  function fine() {
    if (finito) return;
    finito = true;
    emetti('fine');
    narratore.poi(() => {
      suoni.finale();
      stato = 'finale';
      tasti.clear();
      document.exitPointerLock();
      mostra('finale');
      $('ricomincia').focus();
    });
  }

  // ---------------------------------------------------------------- simulazione
  function aggiornaGiocatore(dt) {
    const f = (tasti.has('KeyW') || tasti.has('ArrowUp') ? 1 : 0) - (tasti.has('KeyS') || tasti.has('ArrowDown') ? 1 : 0);
    const r = (tasti.has('KeyD') || tasti.has('ArrowRight') ? 1 : 0) - (tasti.has('KeyA') || tasti.has('ArrowLeft') ? 1 : 0);
    let vx = 0;
    let vz = 0;
    const stQui = mondo.stanzaDi(giocatore.pos);
    const acqua = stQui && stQui.acqua;
    const piedi = giocatore.pos.y - giocatore.half.y;
    const bagnato = !!acqua && piedi < stQui.y0 + acqua.livello;
    if (bagnato && !inAcqua && giocatore.vel.y < -1) suoni.tonfo();
    inAcqua = bagnato;
    const vel = VEL * (bagnato ? 0.7 : 1);
    if (f || r) {
      const len = Math.hypot(f, r);
      vx = ((-Math.sin(yaw) * f + Math.cos(yaw) * r) / len) * vel;
      vz = ((-Math.cos(yaw) * f - Math.sin(yaw) * r) / len) * vel;
    }
    if (bagnato && acqua.corrente) { vx += acqua.corrente[0]; vz += acqua.corrente[1]; }
    const acc = giocatore.aTerra ? 14 : 2.5;
    const k = 1 - Math.exp(-acc * dt);
    giocatore.vel.x += (vx - giocatore.vel.x) * k;
    giocatore.vel.z += (vz - giocatore.vel.z) * k;
    const st = mondo.stanzaDi(giocatore.pos);
    giocatore.vel.y = Math.max(-30, giocatore.vel.y - G * (st ? st.gravita : 1) * dt);
    const varchi = portali.varchi(giocatore);
    const prima = giocatore.pos.clone();
    muovi(giocatore, giocatore.vel.clone().multiplyScalar(dt), mondo, cubi, varchi);
    const input = { avanti: tasti.has('KeyW') || tasti.has('ArrowUp') };
    for (const v of mondo.vincoli) v(giocatore, dt, input);
    const t = portali.attraversa(giocatore);
    if (t) {
      yaw += t.dyaw;
      suoni.passaggio();
      emetti('portale:attraversato', t);
    } else {
      const tp = passaggi.attraversa(giocatore);
      if (tp) { yaw += tp.dyaw; emetti('passaggio:' + tp.id, tp); }
      else {
        const d = Math.hypot(giocatore.pos.x - prima.x, giocatore.pos.z - prima.z);
        passi += d;
        if (giocatore.aTerra && contapassi.avanza(d)) suoni.passo(bagnato ? 'acqua' : (stQui && stQui.passi) || 'cemento');
      }
    }
    // caduta nel vuoto: si torna al punto di ripresa dell'ultima stanza che ne ha uno
    const ultima = controlli.get(ultimoControllo);
    if (giocatore.pos.y < (ultima ? ultima.piedi : 0) - 20) g.velo(riprendi);
  }

  function aggiornaCubi(dt) {
    const occhio = camera.position;
    for (const c of cubi) {
      if (c.tenuto) {
        const meta = occhio.clone().add(avanti().multiplyScalar(1.5));
        const d = meta.sub(c.pos);
        if (d.length() > 2.6) { c.tenuto = false; tenuto = null; continue; }
        c.vel.copy(d.multiplyScalar(12));
        if (c.vel.length() > 14) c.vel.setLength(14);
      }
      const varchi = portali.varchi(c);
      const urto = passoCorpo(c, dt, mondo, cubi, varchi);
      if (urto > 2 && !c.tenuto) suoni.urto(Math.min(1, urto / 8));
      if ((portali.attraversa(c) || passaggi.attraversa(c)) && c.tenuto) { c.tenuto = false; tenuto = null; }
      if (c.pos.y < -20) { c.pos.y = 3; c.vel.set(0, 0, 0); }
    }
  }

  function aggiornaStanza() {
    const s = mondo.stanzaDi(giocatore.pos);
    const nome = s ? s.nome : null;
    if (nome && nome !== stanzaAttuale) {
      stanzaAttuale = nome;
      if (s.atmosfera !== 'eredita') atmo = { ...ATMOSFERA, ...(s.atmosfera || {}) };
      if (s.suono !== 'eredita') suoni.ambiente(s.suono || {});
      if (s.atmosfera !== 'eredita') {
        suoni.musica.ala(s.ala);
        suoni.musica.letto(s.letto);
        suoni.musica.transizione();
      }
      if (controlli.has(nome)) ultimoControllo = nome;
      emetti('stanza:' + nome);
    }
    mondo.controllaZone(giocatore.pos, (z) => emetti(z));
  }

  // atmosfera: nebbia, sfondo e luce ambiente sfumano verso quelli della stanza
  let atmo = { ...ATMOSFERA };
  const cNebbia = new THREE.Color(), cCielo = new THREE.Color(), cTerra = new THREE.Color();
  function aggiornaAtmosfera(dt) {
    const k = 1 - Math.exp(-2.2 * dt);
    scene.fog.color.lerp(cNebbia.set(atmo.nebbia), k);
    scene.background.copy(scene.fog.color);
    scene.fog.near += (atmo.vicino - scene.fog.near) * k;
    scene.fog.far += (atmo.lontano - scene.fog.far) * k;
    emi.color.lerp(cCielo.set(atmo.cielo), k);
    emi.groundColor.lerp(cTerra.set(atmo.terra), k);
    emi.intensity += (atmo.intensita - emi.intensity) * k;
  }

  function aggiornaLuci(t) {
    if (t > prossimaAssegnazione) {
      prossimaAssegnazione = t + 0.3;
      const p = camera.position;
      assegnate = mondo.luci
        .map((l) => [l, l.position.distanceToSquared(p) - l.distance * l.distance * 0.5])
        .sort((a, b) => a[1] - b[1])
        .slice(0, N_LUCI)
        .map((x) => x[0]);
    }
    gruppoLuci.forEach((pl, i) => {
      const d = assegnate[i];
      if (!d) { pl.intensity = 0; return; }
      pl.position.copy(d.position);
      pl.intensity = d.intensity;
      pl.distance = d.distance;
      pl.color.copy(d.color);
    });
  }

  function aggiornaAiuti(dt) {
    for (const [nome, a] of aiuti) {
      const qui = !!stanzaAttuale && (stanzaAttuale === nome || stanzaAttuale.startsWith(nome + '-'));
      const esito = a.aggiorna(dt, qui);
      if (esito) emetti(`aiuto:${esito}:${nome}`);
    }
    if (cartiglio && cartiglio.pos.distanceTo(giocatore.pos) > 3) chiudiCartiglio();
  }

  // ---------------------------------------------------------------- ciclo
  const timer = new THREE.Timer();
  function ciclo(ms) {
    timer.update(ms);
    const dt = Math.min(timer.getDelta(), 0.1);
    const t = timer.getElapsed();
    if (stato === 'gioco') {
      aggiornaGiocatore(dt);
      aggiornaCubi(dt);
      aggiornaStanza();
      aggiornaAiuti(dt);
      narratore.aggiorna(dt);
    } else if (stato === 'finale') narratore.aggiorna(dt);
    const moto = Math.hypot(giocatore.vel.x, giocatore.vel.z);
    const bob = imp.calmo || !giocatore.aTerra ? 0 : Math.sin(passi * 6.2) * 0.022 * Math.min(1, moto / VEL);
    camera.position.set(giocatore.pos.x, giocatore.pos.y + 0.75 + bob, giocatore.pos.z);
    const stCam = mondo.stanzaDi(giocatore.pos);
    const rollio = stCam && stCam.ondeggia && !imp.calmo ? Math.sin(t * 0.55) * 0.012 + Math.sin(t * 0.21) * 0.006 : 0;
    camera.rotation.set(pitch + rollio * 0.3, yaw, rollio);
    camera.updateMatrixWorld();
    aggiornaAtmosfera(dt);
    aggiornaLuci(t);
    suoni.aggiorna(dt);
    for (const fn of mondo.aggiornamenti) fn(dt, t);
    if (stato === 'gioco') aggiornaMira();
    portali.aggiorna(t);
    post.uniforms.uTime.value = imp.calmo ? 0 : t;
    passaggi.render(camera);
    const accese = passaggi.spegni();
    portali.render(camera);
    passaggi.riaccendi(accese);
    renderer.setRenderTarget(rt);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(postScene, postCam);
  }

  // ---------------------------------------------------------------- debug per i test
  if (ctx.debug) {
    window.__gioco = {
      leggi: () => ({
        stato, stanza: stanzaAttuale, gesto, finito, x: giocatore.pos.x, y: giocatore.pos.y, z: giocatore.pos.z, yaw,
        passi, lampade: g.giro.lampade(), segreti: g.giro.segreti(), cartiglio: cartiglio && cartiglio.chiave,
        puntoControllo: ultimoControllo, pc: (() => { const c = controlli.get(ultimoControllo); return c && { x: c.x, y: c.piedi + giocatore.half.y + 0.01, z: c.z }; })(),
        portali: portali.p.map((p) => p.attivo && p.pannello), narratore: narratore.attuale && narratore.attuale.id,
        tenuto: !!tenuto, mirato: mirato && (mirato.chiave || 'cubo'),
      }),
      vai: (x, y, z) => { giocatore.pos.set(x, y, z); giocatore.vel.set(0, 0, 0); giocatore.zPrima = [null, null]; },
      guarda: (y, p = 0) => { yaw = y; pitch = p; },
      spara: (i) => spara(i),
      tasto: (code, giu) => { if (giu) tasti.add(code); else tasti.delete(code); },
      interagisci: () => interagisci(),
      evento: (n) => emetti(n),
      salta: () => { narratore.coda = []; narratore.attuale = null; narratore.pausa = 0; narratore.mostra(); },
      // i test non possono ottenere il pointer lock: entrano in gioco direttamente
      gioca: () => { stato = 'gioco'; mostra(null); },
      materiali: () => Object.keys(mat),
      tempoMusica: () => suoni.musica.tempo(),
      avviaAudio: () => suoni.avvia(),
      livelloAudio: () => {
        if (!suoni.ac) return 0;
        if (!suoni.analizzatore) { suoni.analizzatore = suoni.ac.createAnalyser(); suoni.musica.master.connect(suoni.analizzatore); }
        const d = new Float32Array(suoni.analizzatore.fftSize);
        suoni.analizzatore.getFloatTimeDomainData(d);
        return Math.sqrt(d.reduce((a, x) => a + x * x, 0) / d.length);
      },
      aggiungiPassaggio: (id, a, b) => {
        const m4 = ([x, y, z, ry]) => new THREE.Matrix4().makeRotationY(ry).setPosition(x, y, z);
        passaggi.aggiungi({ id, a: m4(a), b: m4(b) });
      },
      rimuoviPassaggio: (id) => passaggi.rimuovi(id),
      cubo: (x, y, z, vx = 0, vy = 0, vz = 0) => { const c = cubo(x, y, z); c.vel.set(vx, vy, vz); return cubi.length - 1; },
      cubi: () => cubi.map((c) => ({ x: c.pos.x, y: c.pos.y, z: c.pos.z })),
      vaiA: (nome) => { ultimoControllo = nome; riprendi(); },
      stanza: (nome) => debugStanze[nome],
      mira: (x, y, z) => {
        const d = new THREE.Vector3(x, y, z).sub(camera.position);
        yaw = Math.atan2(-d.x, -d.z);
        pitch = Math.atan2(d.y, Math.hypot(d.x, d.z));
      },
    };
  }

  // ---------------------------------------------------------------- partenza
  riprendi();
  emetti('inizio');
  renderer.setAnimationLoop(ciclo);
  $('avvio-testo').removeAttribute('data-t');
  $('avvio-testo').textContent = ctx.T.comandi;
  $('caricatore').hidden = true;
  $('avvio-entra').hidden = false;
  $('avvio-entra').focus();
}
