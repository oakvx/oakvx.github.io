/* Original Wii recordings, played through the portfolio's single AudioContext. */
(() => {
'use strict';
function createWiiAudio(base, sound, update) {
  const cache = new Map(), voices = new Map(), requests = new AbortController();
  let stopped = false, scene = '', current = null, serial = 0, lastHover = 0, level = .6;
  const url = name => new URL(name.includes('/') ? 'original/' + name : 'original/audio/' + name + '.mp3', base).href;
  function stop(node) { try { if(node instanceof HTMLMediaElement){node.pause();node.removeAttribute('src');node.load();}else node.stop(); } catch {} }
  function silence() { voices.forEach((_,node) => stop(node)); voices.clear(); current = null; }
  async function buffer(name, context) {
    if (!cache.has(name)) cache.set(name, fetch(url(name), { signal: requests.signal })
      .then(response => { if (!response.ok) throw new Error('Audio unavailable'); return response.arrayBuffer(); })
      .then(data => context.decodeAudioData(data)).catch(() => null));
    return cache.get(name);
  }
  async function play(name, { loop = false, volume = .45, loopStart = 0, loopEnd = 0, music = false } = {}) {
    const state = sound?.getState();
    if (stopped || !state?.active || state.scene !== 'wii') return;
    // file:// fetch is restricted by browsers; native media can read local files.
    // It follows the same controller's consent/lifecycle, with no extra context.
    if (base.protocol === 'file:') {
      const source=new window.Audio(url(name));source.loop=loop&&!loopEnd;source.volume=volume*level;
      if(loop&&loopEnd)source.ontimeupdate=()=>{if(!stopped&&source.currentTime>=loopEnd)source.currentTime=loopStart;};
      voices.set(source,{volume});source.onended=()=>voices.delete(source);
      source.play().catch(()=>voices.delete(source));if(music)current=source;return source;
    }
    const token = serial, data = await buffer(name, state.context);
    if (!data || stopped || !sound.getState().active || token !== serial) return;
    const source = state.context.createBufferSource(), gain = state.context.createGain();
    source.buffer = data; source.loop = loop; source.loopStart=loopStart;if(loopEnd)source.loopEnd=Math.min(loopEnd,data.duration);gain.gain.value = volume * level;
    source.connect(gain); gain.connect(state.context.destination); voices.set(source,{gain,volume});
    source.onended = () => { voices.delete(source); source.disconnect(); gain.disconnect(); };
    source.start(); if (music) current = source;
    return source;
  }
  const musicOptions=name=>({loop:true,...window.OAKVX_WII_CONTENT?.channelAudio[name.split('/')[1]],volume:.22,music:true});
  function music(name) {
    if (name === scene && current) return;
    scene = name; serial++; silence();
    if (name) play(name,musicOptions(name));
  }
  const unsubscribe = sound?.subscribe(state => {
    update?.(state);
    if (!state.active || state.scene !== 'wii') { serial++; silence(); }
    else if (scene && !current) { serial++; play(scene,musicOptions(scene)); }
  });
  return {
    music,
    setVolume(value) {
      level = Math.max(0, Math.min(1, value));
      voices.forEach(({gain,volume},source) => { if(!gain){source.volume=volume*level;return;}const now=gain.context.currentTime;gain.gain.cancelScheduledValues(now);gain.gain.setTargetAtTime(volume*level,now,.02); });
    },
    effect(name) {
      if (name === 'hover') { if (performance.now() - lastHover < 90) return; lastHover = performance.now(); }
      return play(name);
    },
    dispose() { stopped = true; serial++; silence(); unsubscribe?.(); requests.abort(); cache.clear(); }
  };
}
window.OAKVX_WII_AUDIO=Object.freeze({createWiiAudio});
})();
