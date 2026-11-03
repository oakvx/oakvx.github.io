/* One 30 fps scene loop. The semantic list works before, without or after this script. */
(() => {
    'use strict';
    const scene = document.querySelector('[data-plaza]');
    if (!scene || !('IntersectionObserver' in window) || !('ResizeObserver' in window)) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'plaza__crowd';
    canvas.setAttribute('aria-hidden','true');
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    const root = document.documentElement, reduced = matchMedia('(prefers-reduced-motion:reduce)');
    const narrow = matchMedia('(max-width:767px)');
    const calm = () => reduced.matches || root.classList.contains('paused') || root.classList.contains('calm');
    const items = [...scene.querySelectorAll('.proj')];
    items.forEach(item => {
        item.addEventListener('keydown',event=>{if(event.key==='Escape')item.classList.add('is-bubble-dismissed');});
        item.addEventListener('pointerleave',()=>item.classList.remove('is-bubble-dismissed'));
        item.addEventListener('focusin',()=>item.classList.remove('is-bubble-dismissed'));
    });
    const bubbles = document.createElement('div');
    bubbles.className = 'plaza__bubbles';
    bubbles.setAttribute('aria-hidden','true');
    // Quotes come from the existing translated nodes, never invented social activity.
    const quotes = items.slice(0,6).map(item => {
        const bubble = document.createElement('p'), name = document.createElement('strong'), quote = document.createElement('span');
        bubble.className = 'plaza__bubble'; bubble.append(name,quote); bubbles.append(bubble);
        return { item,name,quote };
    });
    function translate() {
        quotes.forEach(({item,name,quote}) => {
            name.textContent = item.querySelector('.proj__name').textContent.trim();
            quote.textContent = item.querySelector('.proj__kind').textContent.trim();
        });
    }
    translate();
    new MutationObserver(translate).observe(root,{ attributes:true,attributeFilter:['lang'] });
    scene.prepend(canvas,bubbles);
    scene.setAttribute('data-plaza-ready','');
    scene.dataset.plazaActive = 'false';
    let width = 0, height = 0, dpr = 1, figures = [], visible = false, suspended = false;
    let frame = 0, last = 0, clock = 0, greeted = false;
    const skin = ['#edc4a3','#c58d69','#8d6049','#f4d9bd','#ad7856'];
    const coats = ['#739db4','#a992b5','#86a694','#bd9b78','#8b98b9','#bf8c92','#789b9f'];
    const hair = ['#3c3a39','#665144','#8e7351','#b3a089','#4f535e'];
    const pale = (hex,depth) => {
        const amount = .34 + depth*.66;
        return '#'+hex.slice(1).match(/../g).map(part => Math.round(255+(parseInt(part,16)-255)*amount).toString(16).padStart(2,'0')).join('');
    };
    function populate() {
        let seed = 48013;
        const random = () => { seed = (Math.imul(seed,1664525)+1013904223)>>>0; return seed/4294967296; };
        figures = Array.from({length:narrow.matches?30:96}, () => {
            const depth = random();
            return { x:.025+random()*.95, y:.36+depth*.60, depth, scale:.42+depth*1.10,
                phase:random()*Math.PI*2, skin:pale(skin[Math.floor(random()*skin.length)],depth),
                coat:pale(coats[Math.floor(random()*coats.length)],depth), hair:pale(hair[Math.floor(random()*hair.length)],depth),
                style:Math.floor(random()*6), eyes:pale('#37454c',depth) };
        }).sort((a,b)=>a.depth-b.depth);
        scene.dataset.plazaFigures = figures.length;
    }
    const ellipse = (x,y,rx,ry,color) => { ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill(); };
    function draw() {
        ctx.setTransform(dpr,0,0,dpr,0,0);
        ctx.clearRect(0,0,width,height);
        const pointer = window.wiiuPointer;
        const box = pointer?.active ? canvas.getBoundingClientRect() : null;
        const px = box ? pointer.x-box.left : 0, py = box ? pointer.y-box.top : 0;
        const moving = !calm();
        figures.forEach(person => {
            const x=person.x*width, y=person.y*height;
            const breath=moving?Math.sin(clock*.0017+person.phase)*.8:0;
            const turn=moving?(box?Math.max(-.22,Math.min(.22,(px-x)/width*.6)):Math.sin(clock*.0006+person.phase)*.10):0;
            ctx.save();ctx.translate(x,y);ctx.scale(person.scale,person.scale);
            ellipse(0,0,13,3,'#6f89901a');
            ctx.fillStyle=person.eyes;ctx.fillRect(-6,-10,4,10);ctx.fillRect(2,-10,4,10);
            ctx.translate(0,breath);
            ctx.fillStyle=person.coat;ctx.beginPath();ctx.moveTo(-7,-25);ctx.quadraticCurveTo(-14,-20,-12,-10);ctx.lineTo(12,-10);ctx.quadraticCurveTo(13,-21,7,-25);ctx.closePath();ctx.fill();
            ctx.strokeStyle=person.skin;ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-10,-22);ctx.lineTo(-13,-14);ctx.moveTo(10,-22);ctx.lineTo(13,-14);ctx.stroke();
            ctx.translate(0,-33);ctx.rotate(turn);
            ellipse(0,0,9,10,person.skin);
            ctx.fillStyle=person.hair;ctx.beginPath();
            if(person.style===0) { ctx.ellipse(0,-4,10,7,0,Math.PI,Math.PI*2);ctx.lineTo(8,0);ctx.lineTo(-8,-5); }
            else if(person.style===1) { ctx.moveTo(-9,4);ctx.quadraticCurveTo(-14,-15,0,-12);ctx.quadraticCurveTo(14,-12,10,5);ctx.lineTo(6,-7);ctx.lineTo(-7,-7); }
            else if(person.style===2) { ctx.moveTo(-9,-2);ctx.lineTo(-7,-11);ctx.lineTo(-2,-8);ctx.lineTo(2,-13);ctx.lineTo(7,-9);ctx.lineTo(10,-1);ctx.lineTo(4,-5);ctx.lineTo(-4,-4); }
            else if(person.style===3) { ctx.ellipse(0,-5,10,8,0,Math.PI,Math.PI*2);ctx.lineTo(8,-2);ctx.lineTo(1,-7);ctx.lineTo(-8,0); }
            else if(person.style===4) { ctx.ellipse(0,-7,10,6,0,0,Math.PI*2); }
            else { ctx.moveTo(-10,6);ctx.quadraticCurveTo(-13,-10,0,-11);ctx.quadraticCurveTo(12,-9,10,7);ctx.lineTo(7,-5);ctx.lineTo(-6,-5); }
            ctx.closePath();ctx.fill();
            if(person.style===4) ellipse(6,-12,4,4,person.hair);
            const gaze=box&&moving?Math.max(-1.5,Math.min(1.5,(px-x)/width*5)):0;
            const gy=box&&moving?Math.max(-1,Math.min(1,(py-y)/height*3)):0;
            ellipse(-3+gaze,1+gy,.9,1.1,person.eyes);ellipse(3+gaze,1+gy,.9,1.1,person.eyes);
            ctx.strokeStyle=person.eyes;ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(-1.6,5);ctx.quadraticCurveTo(0,6,1.6,5);ctx.stroke();
            ctx.restore();
        });
    }
    function stop() { cancelAnimationFrame(frame);frame=0;last=0; }
    function tick(time) {
        frame=0;
        if(!visible||suspended||document.hidden||calm()) return;
        if(!last||time-last>=1000/30) {
            clock+=last?Math.min(time-last,70):0;last=time;draw();
        }
        frame=requestAnimationFrame(tick);
    }
    function greet() {
        if(visible&&!greeted&&!calm()&&!document.hidden&&!suspended) {
            greeted=true;dispatchEvent(new CustomEvent('wiiu:plazagreet'));
        }
    }
    function sync() {
        const active=visible&&!suspended&&!document.hidden&&!calm()&&!root.classList.contains('is-navigating');
        scene.dataset.plazaActive=String(active);
        if(active) { greet();if(!frame)frame=requestAnimationFrame(tick); }
        else { stop();if(visible&&!document.hidden&&!suspended)draw(); }
    }
    function fit() {
        const box=scene.getBoundingClientRect();
        width=Math.round(box.width);height=Math.round(box.height);dpr=Math.min(devicePixelRatio||1,2);
        canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
        populate();if(visible)draw();
    }
    new ResizeObserver(fit).observe(scene);
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:0}).observe(scene);
    new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['class']});
    document.addEventListener('visibilitychange',sync);
    reduced.addEventListener('change',sync);
    narrow.addEventListener('change',()=>{fit();sync();});
    addEventListener('pagehide',()=>{suspended=true;sync();});
    addEventListener('pageshow',()=>{suspended=false;sync();});
    fit();
})();
