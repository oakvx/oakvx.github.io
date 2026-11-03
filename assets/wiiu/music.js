/* Original ambient score. The existing sound controller owns consent and AudioContext. */
(() => {
    'use strict';
    const sound = window.wiiuSound;
    if (!sound) return;
    const BEAT = 60 / 72, BAR = BEAT * 4, CYCLE = BAR * 8, FADE = .6, LEVEL = .075;
    // Eight original voicings; MIDI note numbers. No recording or external sample.
    const harmony = [
        [50,57,61,66,76], [47,54,57,62,69], [55,59,62,66,73], [52,59,62,66,71],
        [54,61,64,69,73], [57,62,66,71,76], [55,62,66,69,76], [57,61,64,66,71]
    ];
    // Beat, note, duration in beats, instrument: a newly written, sparse melody.
    const melody = [
        [.75,78,1.8,'vibe'], [3.25,76,1.6,'vibe'], [5.5,73,2,'vibe'],
        [9,74,1.8,'vibe'], [11.75,81,2.8,'bell'], [14.5,78,2,'vibe'],
        [17.25,76,2.4,'vibe'], [21,73,2,'vibe'], [24.75,71,2.8,'bell'], [28.25,76,2.2,'vibe']
    ];
    const frequency = note => 440 * 2 ** ((note - 69) / 12);
    function random(seed) { return () => { seed = (Math.imul(seed,1664525)+1013904223)>>>0; return seed/4294967296; }; }
    function impulse(context) {
        const buffer=context.createBuffer(2,Math.ceil(context.sampleRate*1.45),context.sampleRate);
        const noise=random(0x4489);
        for(let channel=0;channel<2;channel++) {
            const data=buffer.getChannelData(channel);let smooth=0;
            for(let i=0;i<data.length;i++) {
                smooth=.65*smooth+.35*(noise()*2-1);
                data[i]=i<context.sampleRate*.012?0:smooth*(1-i/data.length)**2.8;
            }
        }
        return buffer;
    }
    function plan(cycle,seed) {
        const rand=random((seed+Math.imul(cycle,7919))>>>0), events=[];
        harmony.forEach((notes,bar)=>events.push({time:bar*BAR,kind:'pad',notes,level:.24*(.94+rand()*.12),pan:(rand()-.5)*.3,detune:(rand()-.5)*5}));
        melody.forEach(([beat,note,length,kind])=>events.push({time:(beat+(rand()-.5)*.035)*BEAT,kind,note,length:length*BEAT,level:(kind==='bell'?.095:.13)*(.9+rand()*.2),pan:(rand()-.5)*.55}));
        // Three quiet brush accents per cycle; an occasional rest adds variation.
        [7,14.5,27].forEach(beat=>{if(rand()>.18)events.push({time:beat*BEAT,kind:'brush',level:.02*(.85+rand()*.3),pan:(rand()-.5)*.4});});
        return events.sort((a,b)=>a.time-b.time);
    }
    let player = null, cachedContext, cachedImpulse;
    let ducked = !!document.querySelector('dialog[open]');
    function createPlayer(context) {
        if(context!==cachedContext) { cachedContext=context;cachedImpulse=impulse(context); }
        const input=context.createGain(), dry=context.createGain(), wet=context.createGain();
        const room=context.createConvolver(), output=context.createGain(), highpass=context.createBiquadFilter();
        room.buffer=cachedImpulse;room.normalize=true;dry.gain.value=.86;wet.gain.value=.14;
        highpass.type='highpass';highpass.frequency.value=80;highpass.Q.value=.5;
        input.connect(highpass);highpass.connect(dry);highpass.connect(room);room.connect(wet);
        dry.connect(output);wet.connect(output);output.connect(context.destination);output.gain.value=0;
        const groups=new Set(), sources=new Map();
        let playing=true,timer=0,cycle=0,index=0;
        const seed=(Math.random()*4294967296)>>>0, origin=context.currentTime+.05;
        let events=plan(cycle,seed), ramp={from:0,to:0,at:context.currentTime,end:context.currentTime};
        function volume(target,duration=FADE) {
            const now=context.currentTime, fraction=ramp.end>now?Math.max(0,Math.min(1,(now-ramp.at)/(ramp.end-ramp.at))):1;
            const current=ramp.from+(ramp.to-ramp.from)*fraction;
            output.gain.cancelScheduledValues(now);output.gain.setValueAtTime(current,now);
            if(duration)output.gain.linearRampToValueAtTime(target,now+duration);
            else output.gain.setValueAtTime(target,now);
            ramp={from:current,to:target,at:now,end:now+duration};
        }
        function group(when,end,pan) {
            const nodes=[], own=[];
            const node = item => {nodes.push(item);return item;};
            const envelope=node(context.createGain());envelope.gain.value=0;
            const filter=node(context.createBiquadFilter());filter.type='lowpass';filter.frequency.value=6200;filter.Q.value=.5;
            const panner=typeof context.createStereoPanner==='function'?node(context.createStereoPanner()):null;
            if(panner)panner.pan.value=pan;
            envelope.connect(filter);filter.connect(panner || input);if(panner)panner.connect(input);
            const bundle={nodes,own};groups.add(bundle);
            function source(item) {
                own.push(item);sources.set(item,{when,end});
                item.onended=()=>{
                    sources.delete(item);item.disconnect();
                    if(own.every(part=>!sources.has(part))) {nodes.forEach(part=>part.disconnect());groups.delete(bundle);}
                };
                item.start(when);item.stop(end);
                return item;
            }
            function oscillator(hz,type,weight,detune=0) {
                const osc=context.createOscillator(), gain=node(context.createGain());
                osc.type=type;osc.frequency.setValueAtTime(hz,when);osc.detune.setValueAtTime(detune,when);gain.gain.value=weight;
                osc.connect(gain);gain.connect(envelope);source(osc);
            }
            return {node,source,envelope,filter,oscillator};
        }
        function pad(event,when) {
            const length=BAR+1.25,g=group(when,when+length+.02,event.pan);
            g.filter.frequency.value=1100;
            g.envelope.gain.setValueAtTime(0,when);g.envelope.gain.linearRampToValueAtTime(event.level,when+.7);
            g.envelope.gain.setValueAtTime(event.level,when+BAR-.25);g.envelope.gain.exponentialRampToValueAtTime(.0001,when+length);
            event.notes.forEach(note=>{g.oscillator(frequency(note),'sine',.14,event.detune);g.oscillator(frequency(note),'triangle',.06,-event.detune);});
        }
        function mallet(event,when) {
            const length=event.length,g=group(when,when+length+.02,event.pan),hz=frequency(event.note);
            g.envelope.gain.setValueAtTime(0,when);g.envelope.gain.linearRampToValueAtTime(event.level,when+.012);
            g.envelope.gain.exponentialRampToValueAtTime(.0001,when+length);
            const partials=event.kind==='bell'?[[1,1],[2.756,.23],[5.404,.055]]:[[1,1],[3.01,.19],[6.02,.04]];
            partials.forEach(([ratio,weight])=>g.oscillator(hz*ratio,'sine',weight));
            if(event.kind==='vibe') {
                const tremolo=g.node(context.createGain()), depth=g.node(context.createGain()), lfo=context.createOscillator();
                g.envelope.disconnect();g.envelope.connect(tremolo);tremolo.connect(g.filter);
                tremolo.gain.value=.92;depth.gain.value=.08;lfo.frequency.value=4.7;lfo.connect(depth);depth.connect(tremolo.gain);g.source(lfo);
            }
        }
        const brushNoise=context.createBuffer(1,Math.ceil(context.sampleRate*.08),context.sampleRate);
        {const data=brushNoise.getChannelData(0),noise=random(seed^0x4b3);for(let i=0;i<data.length;i++)data[i]=(noise()*2-1)*(1-i/data.length)**2;}
        function brush(event,when) {
            const g=group(when,when+.09,event.pan),noise=context.createBufferSource();noise.buffer=brushNoise;
            g.filter.type='highpass';g.filter.frequency.value=3200;
            g.envelope.gain.setValueAtTime(0,when);g.envelope.gain.linearRampToValueAtTime(event.level,when+.004);g.envelope.gain.exponentialRampToValueAtTime(.0001,when+.08);
            noise.connect(g.envelope);g.source(noise);
        }
        function tick() {
            if(!playing)return;
            const now=context.currentTime;
            while(origin+cycle*CYCLE+events[index].time<now+.22) {
                const event=events[index],when=origin+cycle*CYCLE+event.time;
                // Skip missed events after a main-thread stall; never play a catch-up burst.
                if(when>=now+.008) ({pad,vibe:mallet,bell:mallet,brush}[event.kind])(event,when);
                if(++index===events.length) {index=0;events=plan(++cycle,seed);}
            }
            timer=setTimeout(tick,80);
        }
        volume(LEVEL*(ducked ? .25 : 1));tick();
        return {
            duck(value) { if(playing)volume(LEVEL*(value ? .25 : 1)); },
            stop(immediate=false) {
                if(!playing)return;playing=false;clearTimeout(timer);volume(0,immediate?0:FADE);
                const now=context.currentTime;
                sources.forEach((data,source)=>{try{source.stop(data.when>now?now:Math.min(data.end,now+(immediate?0:FADE+.01)));}catch{}});
                const dispose=()=>{
                    sources.forEach((_,source)=>{try{source.stop();source.disconnect();}catch{}});sources.clear();
                    groups.forEach(g=>g.nodes.forEach(node=>node.disconnect()));groups.clear();
                    [input,dry,wet,room,output,highpass].forEach(node=>node.disconnect());
                };
                if(immediate)dispose();else setTimeout(dispose,650);
            }
        };
    }
    sound.subscribe(state=>{
        if(state.active) {if(!player) {try{player=createPlayer(state.context);}catch{player=null;}}}
        else if(player) {player.stop(state.leaving);player=null;}
    });
    function duck() {
        const value=!!document.querySelector('dialog[open]');
        if(value!==ducked) {ducked=value;player?.duck(value);}
    }
    document.addEventListener('toggle',duck,true);
    new MutationObserver(records=>{
        if(records.some(record=>record.type==='attributes'&&record.target.matches('dialog') || [...record.addedNodes,...record.removedNodes].some(node=>node.nodeType===1&&(node.matches('dialog')||node.querySelector('dialog')))))duck();
    }).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open']});
})();
