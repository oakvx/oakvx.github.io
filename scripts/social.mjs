#!/usr/bin/env node
/* Conteggi pubblici dei profili social, aggiornati ogni ora dalla GitHub Action
 * .github/workflows/social.yml. Solo numeri pubblici e avatar: nessun elenco di follower.
 *
 *   TikTok     @oakvx.sh, @uvst.oakvx   (Instagram @oakvx: a mano, in manuale.json)
 *
 * Scrive assets/social/social.json (e gli avatar in assets/social/) solo quando un valore cambia;
 * se una piattaforma non risponde conserva l'ultimo valore valido. Node 22, nessuna dipendenza.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'assets/social');
const FILE = path.join(DIR, 'social.json');
// Instagram non mostra i conteggi a chi non ha fatto l'accesso: @oakvx si aggiorna a mano
// in assets/social/manuale.json. La funzione instagram() resta per un eventuale uso futuro.
const ACCOUNTS = [
    { piattaforma: 'tiktok', handle: 'oakvx.sh' },
    { piattaforma: 'tiktok', handle: 'uvst.oakvx' }
];
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36';
const MAX_STORIA = 500;

const num = v => {
    if (typeof v === 'number') return v;
    if (typeof v !== 'string') return null;
    const m = v.replace(/,/g, '').match(/([\d.]+)\s*([KkMm])?/);
    if (!m) return null;
    const n = parseFloat(m[1]) * (m[2] ? (/k/i.test(m[2]) ? 1e3 : 1e6) : 1);
    return Math.round(n);
};

async function instagram(handle) {
    // 1) endpoint JSON del profilo web
    try {
        const res = await fetch(`https://i.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(handle)}`, {
            headers: { 'user-agent': UA, 'x-ig-app-id': '936619743392459', accept: 'application/json' }
        });
        if (res.ok) {
            const u = (await res.json())?.data?.user;
            if (u) return {
                nome: u.full_name || handle,
                follower: u.edge_followed_by?.count ?? null,
                seguiti: u.edge_follow?.count ?? null,
                post: u.edge_owner_to_timeline_media?.count ?? null,
                privato: !!u.is_private,
                avatar: u.profile_pic_url_hd || u.profile_pic_url || null
            };
        }
    } catch {}
    // 2) la meta description della pagina: "123 Followers, 45 Following, 6 Posts - ..."
    const res = await fetch(`https://www.instagram.com/${encodeURIComponent(handle)}/`, { headers: { 'user-agent': UA, 'accept-language': 'en-US' } });
    if (!res.ok) throw new Error('instagram ' + res.status);
    const html = await res.text();
    const desc = html.match(/<meta[^>]+(?:name|property)="(?:og:)?description"[^>]+content="([^"]+)"/i)?.[1] || '';
    const m = desc.match(/([\d.,]+[KkMm]?)\s+Followers?,\s*([\d.,]+[KkMm]?)\s+Following,\s*([\d.,]+[KkMm]?)\s+Posts?/i);
    if (!m) throw new Error('instagram: conteggi non trovati');
    const img = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)?.[1];
    return { nome: handle, follower: num(m[1]), seguiti: num(m[2]), post: num(m[3]), privato: null, avatar: img ? img.replace(/&amp;/g, '&') : null };
}

async function tiktok(handle) {
    const res = await fetch(`https://www.tiktok.com/@${encodeURIComponent(handle)}`, { headers: { 'user-agent': UA, 'accept-language': 'it-IT,it;q=0.9,en;q=0.8' } });
    if (!res.ok) throw new Error('tiktok ' + res.status);
    const html = await res.text();
    const raw = html.match(/<script[^>]+id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/)?.[1];
    if (!raw) throw new Error('tiktok: dati non trovati');
    const info = JSON.parse(raw)?.__DEFAULT_SCOPE__?.['webapp.user-detail']?.userInfo;
    if (!info?.user) throw new Error('tiktok: profilo non trovato');
    const s = info.statsV2 || info.stats || {};
    return {
        nome: info.user.nickname || handle,
        follower: num(s.followerCount),
        seguiti: num(s.followingCount),
        miPiace: num(s.heartCount ?? s.heart),
        video: num(s.videoCount),
        privato: !!info.user.privateAccount,
        avatar: info.user.avatarLarger || info.user.avatarMedium || null
    };
}

async function salvaAvatar(url, nome) {
    if (!url) return null;
    try {
        const res = await fetch(url, { headers: { 'user-agent': UA } });
        if (!res.ok) return null;
        const buf = Buffer.from(await res.arrayBuffer());
        const file = `avatar-${nome}.jpg`;
        const dest = path.join(DIR, file);
        let uguale = false;
        try { uguale = Buffer.compare(await fs.readFile(dest), buf) === 0; } catch {}
        if (!uguale) await fs.writeFile(dest, buf);
        return `assets/social/${file}`;
    } catch { return null; }
}

async function main() {
    await fs.mkdir(DIR, { recursive: true });
    let dati = { account: {} };
    try { dati = JSON.parse(await fs.readFile(FILE, 'utf8')); } catch {}
    dati.account ||= {};
    const ora = new Date().toISOString();
    let cambiato = false;

    for (const { piattaforma, handle } of ACCOUNTS) {
        const chiave = `${piattaforma}:${handle}`;
        const prima = dati.account[chiave] || { piattaforma, handle, storia: [] };
        try {
            const nuovo = piattaforma === 'instagram' ? await instagram(handle) : await tiktok(handle);
            const avatar = await salvaAvatar(nuovo.avatar, handle.replace(/[^a-z0-9]+/gi, '-'));
            const conteggi = { ...nuovo, avatar: avatar || prima.avatar || null };
            const confronto = ['nome', 'follower', 'seguiti', 'post', 'miPiace', 'video', 'privato', 'avatar'];
            const diverso = confronto.some(k => conteggi[k] !== undefined && conteggi[k] !== prima[k]);
            const storia = prima.storia || [];
            if (diverso) {
                if (conteggi.follower != null && storia.at(-1)?.[1] !== conteggi.follower) storia.push([ora, conteggi.follower]);
                dati.account[chiave] = { ...prima, ...conteggi, piattaforma, handle, aggiornato: ora, errore: null, storia: storia.slice(-MAX_STORIA) };
                cambiato = true;
                console.log(`${chiave}: ${conteggi.follower} follower`);
            } else if (prima.errore) {
                dati.account[chiave] = { ...prima, errore: null };
                cambiato = true;
            }
        } catch (err) {
            console.warn(`${chiave}: ${err.message}`);
            if (!prima.errore) { dati.account[chiave] = { ...prima, piattaforma, handle, errore: err.message }; cambiato = true; }
        }
    }

    if (cambiato) {
        dati.aggiornato = ora;
        await fs.writeFile(FILE, JSON.stringify(dati, null, 1) + '\n');
        console.log('social.json aggiornato');
    } else {
        console.log('nessun cambiamento');
    }
}

main().catch(err => { console.error(err); process.exit(1); });
