/* SPDX-License-Identifier: GPL-2.0-only
 * AFTER HOURS web reimplementation, 2026.
 * Behaviour and layout adapted from Homebrew Channel by Team Twiizers /
 * fail0verflow, https://github.com/fail0verflow/hbc .
 * Modified: browser DOM/Canvas port, portfolio integration, keyboard/touch input.
 * Distributed under GNU GPL version 2, without warranty; see COPYING.
 */
/* ==========================================================================
   AFTER HOURS — water
   Ricostruzione procedurale del tema "Dark Water" dell'Homebrew Channel:
   gradiente campionato dal tema originale, caustiche, fasci di luce e
   bollicine con la stessa fisica di bubbles.c (GPL-2.0 / fail0verflow).
   ========================================================================== */

window.AH = window.AH || {};

AH.Water = (function () {
  "use strict";

  /* --- parametri presi da bubbles.c / config.h ------------------------- */
  var BUBBLE_MIN = 4;
  var BUBBLE_MAX = 20;
  var BUBBLE_DELTA = BUBBLE_MAX - BUBBLE_MIN;
  var BUBBLE_MIN_TIME = 60 * 4;     /* minuti */
  var BUBBLE_MAX_OFFSET = 60 * 12;  /* minuti */
  var BUBBLE_TIME_CYCLE = 60 * 24;
  var SIZE_MIN = 0.4, SIZE_MAX = 1.0;
  var POP_RADIUS = 0.8;
  var POP_MAX = 10, POP_MIN = 5;
  var POP_SIZE_MIN = 0.2, POP_SIZE_MAX = 0.4;
  var POP_SPREAD_X = 40, POP_SPREAD_Y = 30;

  var TAU = Math.PI * 2;

  var canvas, ctx;
  var W0 = 852, H0 = 480;      /* unità Wii */
  var k = 1;                    /* px per unità */
  var dpr = 1;
  var bg, bgCtx, bgW, bgH;      /* layer statico+caustiche+raggi, a bassa risoluzione */
  var caustic;                  /* tile 256x256 */
  var sprites = [];
  var bubbles = [];
  var rays = [];
  var pointer = { x: -999, y: -999, on: false };
  var reduced = false;
  var started = false;
  var lastCount = -1;

  /* --- utility --------------------------------------------------------- */
  function rnd(a) { return a * Math.random(); }
  function irand(a) { return Math.floor(a * Math.random()); }

  function makeCausticTile(size) {
    var c = document.createElement("canvas");
    c.width = c.height = size;
    var g = c.getContext("2d");
    var img = g.createImageData(size, size);
    var d = img.data;
    var waves = [];
    var i;
    for (i = 0; i < 8; i++) {
      waves.push({
        kx: 2 + irand(7),
        ky: 2 + irand(7),
        ph: rnd(TAU),
        amp: 0.5 + rnd(0.9),
      });
    }
    for (var y = 0; y < size; y++) {
      for (var x = 0; x < size; x++) {
        var v = 0, tot = 0;
        for (i = 0; i < waves.length; i++) {
          var w = waves[i];
          v += w.amp * Math.sin((TAU * (w.kx * x + w.ky * y)) / size + w.ph);
          tot += w.amp;
        }
        v = v / tot;                        /* -1..1 */
        var ridge = 1 - Math.abs(v);        /* 1 sulle creste */
        var a = Math.pow(ridge, 14);        /* filamenti sottili */
        var o = (y * size + x) * 4;
        d[o] = 208; d[o + 1] = 238; d[o + 2] = 255;
        d[o + 3] = Math.min(255, a * 255 * 2.1);
      }
    }
    g.putImageData(img, 0, 0);
    return c;
  }

  function makeBubbleSprite(variant) {
    var s = 64;
    var c = document.createElement("canvas");
    c.width = c.height = s;
    var g = c.getContext("2d");
    var cx = s / 2, cy = s / 2, r = s / 2 - 2;

    /* corpo: vetro scuro con bordo luminoso (come bubble1/2/3.png) */
    var body = g.createRadialGradient(cx - r * 0.15, cy - r * 0.2, r * 0.1, cx, cy, r);
    body.addColorStop(0, "rgba(10,40,58,0.10)");
    body.addColorStop(0.55, "rgba(12,48,68,0.18)");
    body.addColorStop(0.84, "rgba(70,150,195,0.30)");
    body.addColorStop(0.965, "rgba(190,232,252,0.52)");
    body.addColorStop(1, "rgba(255,255,255,0)");
    g.beginPath();
    g.arc(cx, cy, r, 0, TAU);
    g.fillStyle = body;
    g.fill();

    /* arco superiore luminoso */
    g.beginPath();
    g.arc(cx, cy, r * 0.93, Math.PI * 1.06, Math.PI * 1.94);
    g.strokeStyle = variant === 1 ? "rgba(240,252,255,0.52)" : "rgba(210,240,255,0.34)";
    g.lineWidth = 1.9;
    g.stroke();

    /* riflesso in basso */
    g.beginPath();
    var lo = g.createRadialGradient(cx - r * 0.06, cy + r * 0.34, 0, cx - r * 0.06, cy + r * 0.34, r * 0.52);
    lo.addColorStop(0, "rgba(230,248,255,0.46)");
    lo.addColorStop(1, "rgba(230,248,255,0)");
    g.arc(cx, cy + r * 0.06, r * 0.9, Math.PI * 0.12, Math.PI * 0.88);
    g.strokeStyle = lo;
    g.lineWidth = variant === 2 ? 3.4 : 2.4;
    g.stroke();

    /* puntino di luce */
    if (variant !== 2) {
      g.beginPath();
      var hl = g.createRadialGradient(cx - r * 0.34, cy - r * 0.3, 0, cx - r * 0.34, cy - r * 0.3, r * 0.4);
      hl.addColorStop(0, "rgba(255,255,255,0.32)");
      hl.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = hl;
      g.arc(cx - r * 0.34, cy - r * 0.3, r * 0.4, 0, TAU);
      g.fill();
    }
    return c;
  }

  /* --- bollicine -------------------------------------------------------- */
  function bubbleRand(b) {
    var tex = irand(3);
    b.tex = tex;
    b.x = irand(W0);
    b.py = H0 + irand(200);
    b.speed = 1.2 + rnd(4 - tex);
    b.xm = 3.0 + irand(tex + 1) * b.speed;
    b.val = 0;
    b.step = TAU / (64 + rnd(64));
    b.popped = false;
    b.popcnt = 0;
    b.subs = null;
    b.scale = SIZE_MIN + rnd(SIZE_MAX - SIZE_MIN);
    b.rad = rnd(Math.PI / 4);
  }

  function bubblePop(b) {
    b.popped = true;
    b.popcnt = irand(POP_MAX - POP_MIN) + POP_MIN;
    b.subs = [];
    for (var j = 0; j < b.popcnt; j++) {
      var sa = rnd(TAU);
      var dx = Math.sin(sa) * rnd(POP_SPREAD_X);
      var dy = (Math.cos(sa) - 1.5) * rnd(POP_SPREAD_Y);
      b.subs.push({
        x: b.x + dx,
        py: b.py + dy,
        speed: b.speed - 0.5 + rnd(4 - b.tex),
        xm: b.xm * (0.8 + rnd(1.0)),
        val: b.val,
        step: b.step * (0.8 + rnd(0.4)),
        scale: (POP_SIZE_MIN + rnd(POP_SIZE_MAX - POP_SIZE_MIN)) * b.scale,
        rad: b.rad,
        popped: false,
      });
    }
  }

  function bubbleCount() {
    var minute = (Math.floor(Date.now() / 60000) - BUBBLE_MIN_TIME) % BUBBLE_TIME_CYCLE;
    if (minute < 0) minute += BUBBLE_TIME_CYCLE;
    var n;
    if (minute <= BUBBLE_MAX_OFFSET)
      n = (BUBBLE_DELTA * minute) / BUBBLE_MAX_OFFSET + BUBBLE_MIN;
    else
      n = (BUBBLE_DELTA * (BUBBLE_TIME_CYCLE - minute)) / (BUBBLE_TIME_CYCLE - BUBBLE_MAX_OFFSET) + BUBBLE_MIN;
    return Math.max(BUBBLE_MIN, Math.min(BUBBLE_MAX, Math.round(n)));
  }

  function syncBubbles() {
    var want = bubbleCount();
    if (want === lastCount) return;
    lastCount = want;
    while (bubbles.length < want) {
      var b = {};
      bubbleRand(b);
      bubbles.push(b);
    }
    while (bubbles.length > want) bubbles.pop();
  }

  function updateBubbles(dt) {
    var f = dt * 60;                      /* frame-equivalenti a 60 fps */
    for (var i = 0; i < bubbles.length; i++) {
      var b = bubbles[i];

      if (!b.popped && pointer.on) {
        var radius = b.scale * 32 * POP_RADIUS;
        if (Math.abs(pointer.x - b.x) < radius && Math.abs(pointer.y - b.py) < radius) bubblePop(b);
      }

      if (b.popped) {
        var dead = 0;
        for (var j = 0; j < b.subs.length; j++) {
          var s = b.subs[j];
          if (!s.popped && pointer.on) {
            var r2 = s.scale * 32 * POP_RADIUS;
            if (Math.abs(pointer.x - s.x) < r2 && Math.abs(pointer.y - s.py) < r2) s.popped = true;
          }
          s.py -= s.speed * f;
          if (s.py < -100 || s.popped) { dead++; continue; }
          s.x = s.x; /* la posizione base resta */
          s.val += s.step * f;
        }
        if (dead >= b.subs.length) bubbleRand(b);
      } else {
        b.py -= b.speed * f;
        if (b.py < -100) { bubbleRand(b); continue; }
        b.val += b.step * f;
      }
    }
  }

  function drawSprite(g, sprite, x, y, scale, rad, alpha) {
    var w = 64 * scale;
    g.save();
    g.translate(x, y);
    if (rad) g.rotate(rad);
    g.globalAlpha = alpha;
    g.drawImage(sprite, -w / 2, -w / 2, w, w);
    g.restore();
  }

  function drawBubbles(g) {
    for (var i = 0; i < bubbles.length; i++) {
      var b = bubbles[i];
      var sprite = sprites[b.tex] || sprites[0];
      if (b.popped) {
        for (var j = 0; j < b.subs.length; j++) {
          var s = b.subs[j];
          if (s.popped) continue;
          drawSprite(g, sprite, s.x + s.xm * Math.sin(s.val), s.py, s.scale, s.rad, 0.9);
        }
      } else {
        drawSprite(g, sprite, b.x + b.xm * Math.sin(b.val), b.py, b.scale, b.rad, 0.9);
      }
    }
  }

  /* --- sfondo ----------------------------------------------------------- */
  function buildBg() {
    bgW = Math.max(2, Math.round(W0 * 0.72));
    bgH = Math.max(2, Math.round(H0 * 0.72));
    bg = document.createElement("canvas");
    bg.width = bgW;
    bg.height = bgH;
    bgCtx = bg.getContext("2d");
  }

  /* gradiente campionato da background_wide.png del tema Dark Water */
  function paintBase(g, w, h) {
    var grad = g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0.0, "#1a7ba9");
    grad.addColorStop(0.02, "#1876a5");
    grad.addColorStop(0.08, "#166d99");
    grad.addColorStop(0.16, "#14628a");
    grad.addColorStop(0.25, "#12587c");
    grad.addColorStop(0.33, "#104f6e");
    grad.addColorStop(0.42, "#0d4159");
    grad.addColorStop(0.5, "#092b3d");
    grad.addColorStop(0.58, "#072534");
    grad.addColorStop(0.67, "#04161e");
    grad.addColorStop(0.75, "#041823");
    grad.addColorStop(0.83, "#03161f");
    grad.addColorStop(0.92, "#02121b");
    grad.addColorStop(1.0, "#020f17");
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
  }

  var layerPool = [];
  function causticLayer(idx, w, h, t, scale, alpha, driftScale) {
    var tw = 256 * (w / 852) * scale;
    var layer = layerPool[idx];
    if (!layer || layer.width !== w || layer.height !== h) {
      layer = document.createElement("canvas");
      layer.width = w;
      layer.height = h;
      layerPool[idx] = layer;
    }
    var lg = layer.getContext("2d");
    lg.setTransform(1, 0, 0, 1, 0, 0);
    lg.globalCompositeOperation = "source-over";
    lg.clearRect(0, 0, w, h);
    var dx = (t * 2.2 * driftScale) % tw;
    var dy = (t * 0.7 * driftScale) % tw;
    for (var yy = -tw; yy < h + tw; yy += tw) {
      for (var xx = -tw; xx < w + tw; xx += tw) {
        lg.drawImage(caustic, xx + dx, yy + dy, tw, tw);
        lg.drawImage(caustic, xx + dx + tw * 0.5, yy + dy + tw * 0.5, tw, tw);
      }
    }
    /* maschera verticale: caustiche solo nella parte alta */
    lg.globalCompositeOperation = "destination-in";
    var mask = lg.createLinearGradient(0, 0, 0, h);
    mask.addColorStop(0, "rgba(255,255,255,0.95)");
    mask.addColorStop(0.06, "rgba(255,255,255,0.45)");
    mask.addColorStop(0.14, "rgba(255,255,255,0.16)");
    mask.addColorStop(0.26, "rgba(255,255,255,0.03)");
    mask.addColorStop(0.38, "rgba(255,255,255,0)");
    mask.addColorStop(1, "rgba(255,255,255,0)");
    lg.fillStyle = mask;
    lg.fillRect(0, 0, w, h);
    return { canvas: layer, alpha: alpha };
  }

  function paintCaustics(g, w, h, t) {
    if (!caustic) return;
    var a = causticLayer(0, w, h, t, 1.0, 0.17, 1);
    var b = causticLayer(1, w, h, t * 0.7 + 40, 1.75, 0.10, 0.8);
    g.save();
    g.globalCompositeOperation = "lighter";
    g.globalAlpha = a.alpha;
    g.drawImage(a.canvas, 0, 0);
    g.globalAlpha = b.alpha;
    g.drawImage(b.canvas, 0, 0);
    g.restore();
  }

  function paintRays(g, w, h, t) {
    g.save();
    g.globalCompositeOperation = "lighter";
    for (var i = 0; i < rays.length; i++) {
      var r = rays[i];
      var sway = Math.sin(t * r.freq + r.phase) * r.sway;
      var x = r.x * w + sway * w;
      var top = -h * 0.2;
      var bottom = h * (0.66 + r.len);
      var wTop = r.width * w * 0.22;
      var wBot = r.width * w * 1.15;
      var a = r.alpha * (0.72 + 0.28 * Math.sin(t * r.freq * 1.6 + r.phase));

      /* fasci sfumati: passate concentriche sempre più strette */
      for (var pass = 0; pass < 5; pass++) {
        var f = 1 - pass * 0.17;
        g.beginPath();
        g.moveTo(x - wTop * f, top);
        g.lineTo(x + wTop * f, top);
        g.lineTo(x + wBot * f, bottom);
        g.lineTo(x - wBot * f, bottom);
        g.closePath();
        var lg = g.createLinearGradient(0, top, 0, bottom);
        lg.addColorStop(0, "rgba(196,232,250," + (a * 0.5).toFixed(3) + ")");
        lg.addColorStop(0.4, "rgba(160,212,240," + (a * 0.28).toFixed(3) + ")");
        lg.addColorStop(1, "rgba(120,180,215,0)");
        g.fillStyle = lg;
        g.fill();
      }
    }
    g.restore();
  }

  function paintSurface(g, w, h, t) {
    g.save();
    g.globalCompositeOperation = "lighter";
    var band = g.createLinearGradient(0, 0, 0, h * 0.06);
    band.addColorStop(0, "rgba(206,238,255,0.12)");
    band.addColorStop(0.45, "rgba(170,220,245,0.03)");
    band.addColorStop(1, "rgba(170,220,245,0)");
    g.fillStyle = band;
    g.fillRect(0, 0, w, h * 0.06);
    g.restore();
  }

  function paintBg(t) {
    if (!bgCtx) return;
    var g = bgCtx, w = bgW, h = bgH;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, w, h);
    paintBase(g, w, h);
    paintCaustics(g, w, h, t);
    paintRays(g, w, h, t);
    paintSurface(g, w, h, t);
  }

  /* --- API -------------------------------------------------------------- */
  function init(canvasEl) {
    canvas = canvasEl;
    ctx = canvas.getContext("2d", { alpha: false });
    reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    caustic = makeCausticTile(256);
    sprites = [makeBubbleSprite(0), makeBubbleSprite(1), makeBubbleSprite(2)];

    rays = [];
    var n = 13;
    for (var i = 0; i < n; i++) {
      rays.push({
        x: (i + 0.5) / n + (Math.random() - 0.5) * 0.05,
        width: 0.008 + Math.random() * 0.026,
        alpha: 0.012 + Math.random() * 0.020,
        freq: 0.06 + Math.random() * 0.1,
        phase: Math.random() * TAU,
        sway: (Math.random() - 0.5) * 0.03,
        len: Math.random() * 0.12,
      });
    }
    buildBg();
    started = true;
  }

  function resize(w0, h0, pxPerUnit) {
    W0 = w0;
    H0 = h0;
    k = pxPerUnit;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    var cw = Math.max(2, Math.round(W0 * k * dpr));
    var ch = Math.max(2, Math.round(H0 * k * dpr));
    if (canvas.width !== cw || canvas.height !== ch) {
      canvas.width = cw;
      canvas.height = ch;
    }
    buildBg();
    lastCount = -1;
    syncBubbles();
  }

  function setPointer(x, y, on) {
    pointer.x = x;
    pointer.y = y;
    pointer.on = !!on;
  }

  function frame(t, dt) {
    if (!started) return;
    var g = ctx;
    var s = (W0 * k * dpr) / W0; /* px per unità nel backing store */

    reduced = document.documentElement.classList.contains("paused") || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced) {
      updateBubbles(dt);
    } else if (!frame._once) {
      frame._once = true;
      syncBubbles();
    }

    paintBg(reduced ? 0 : t);
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.imageSmoothingEnabled = true;
    g.drawImage(bg, 0, 0, canvas.width, canvas.height);

    /* bollicine in unità Wii */
    g.setTransform(s, 0, 0, s, 0, 0);
    drawBubbles(g);
    g.setTransform(1, 0, 0, 1, 0, 0);
  }

  function popAll() {
    for (var i = 0; i < bubbles.length; i++) if (!bubbles[i].popped) bubblePop(bubbles[i]);
  }

  return {
    init: init,
    resize: resize,
    frame: frame,
    setPointer: setPointer,
    popAll: popAll,
    _count: bubbleCount,
  };
})();
