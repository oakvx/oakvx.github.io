/* SPDX-License-Identifier: GPL-2.0-only
 * AFTER HOURS — channel banner boot, separate from the existing interface.
 * Timing/layout reference: Team Twiizers/fail0verflow hbc,
 * channel/banner/banner/mkbanner.py (water 0..160, title/boom 244, end 360).
 * Original procedural Canvas artwork; no HBC/Nintendo textures included.
 * See COPYING and NOTICE.md. No sound, video assets or runtime dependencies.
 */
window.AH = window.AH || {};
AH.ChannelBoot = (function () {
  "use strict";
  var active = null;
  var TAU = Math.PI * 2;
  function clamp(v) { return Math.max(0, Math.min(1, v)); }
  function smooth(v) { v = clamp(v); return v * v * (3 - 2 * v); }

  function start(options) {
    if (active) active.dispose();
    var reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    var reduced = reducedQuery.matches || document.documentElement.classList.contains("paused");
    var root = document.createElement("section");
    root.className = "channel-boot";
    root.setAttribute("aria-label", "AFTER HOURS — " + (options.lang === "en" ? "channel launch" : "avvio del canale"));
    root.innerHTML = '<canvas class="channel-boot-water" aria-hidden="true"></canvas>' +
      '<span class="sr-only">AFTER HOURS</span>' +
      '<button type="button" class="channel-boot-skip">' +
      (options.lang === "en" ? "Skip intro" : "Salta introduzione") + '</button>';
    options.screen.appendChild(root);
    document.body.dataset.channelState = "CHANNEL_BOOT";
    var canvas = root.querySelector("canvas");
    var ctx = canvas.getContext("2d", { alpha: false });
    var skipButton = root.querySelector("button");
    var startTime = performance.now();
    var lastTime = startTime;
    var elapsed = 0, frameId = 0, handoff = false, ended = false;
    var transitionStart = null, requestedSkip = false;
    var width = 0, height = 0, dpr = 1;
    var bubbles = [];
    var seed = 113;
    function random() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    for (var i = 0; i < 52; i++) {
      bubbles.push({ x: random() * 850 - 20, y: random() * 440,
        r: 1.8 + Math.pow(random(), 2) * 9, speed: 22 + random() * 43,
        phase: random() * TAU, alpha: 0.07 + random() * 0.18 });
    }

    function resize() {
      var rect = root.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = Math.max(2, Math.round(rect.width * dpr));
      var h = Math.max(2, Math.round(rect.height * dpr));
      if (w !== width || h !== height) {
        canvas.width = width = w; canvas.height = height = h;
      }
    }

    // Large overlapping waves, with different drift/bob periods (4/6/8 s).
    // Amplitudes are intentionally modest: the banner is not a stormy sea.
    function surface(x, t, layer, level) {
      var drift = Math.sin(t * TAU / 8 + layer * 1.9) * 90 + t * (layer === 1 ? -19 : 22);
      var u = (x + drift) / 810;
      return level + layer * 4 + Math.sin(t * TAU / (6 + layer) + layer) * 4 +
        Math.sin(u * TAU * 3.1 + layer * 1.4) * (6.5 + layer) +
        Math.sin(u * TAU * 5.3 - t * 0.34 + layer * 2.1) * 3.8 +
        Math.sin(u * TAU * 1.25 + layer * 0.9) * 4.5;
    }
    function waterPath(t, layer, level, offset) {
      ctx.beginPath();
      ctx.moveTo(-12, 480);
      for (var x = -12; x <= 828; x += 4) {
        ctx.lineTo(x, surface(x, t, layer, level) + (offset || 0));
      }
      ctx.lineTo(828, 480); ctx.closePath();
    }
    function ribbon(t, layer, level, offset, thickness, color) {
      ctx.beginPath();
      for (var x = -12; x <= 828; x += 4) {
        var y = surface(x, t, layer, level) + offset;
        if (x === -12) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      for (var rx = 828; rx >= -12; rx -= 4) {
        var ry = surface(rx, t, layer, level) + offset + thickness *
          (0.38 + 0.62 * Math.pow(Math.sin(rx / 150 + t * 0.3 + layer), 2));
        ctx.lineTo(rx, ry);
      }
      ctx.closePath(); ctx.fillStyle = color; ctx.fill();
    }

    function draw(time) {
      resize();
      var scale = Math.max(width / 810, height / 456);
      ctx.setTransform(scale, 0, 0, scale, (width - 810 * scale) / 2, (height - 456 * scale) / 2);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, 810, 456);
      var t = reduced ? 4.6 : time;
      var rise = smooth(t / (160 / 60));
      var level = 390 - 346 * rise;
      // Back water and translucent moving surface ribbons.
      var back = ctx.createLinearGradient(0, level, 0, 456);
      back.addColorStop(0, "#388caa"); back.addColorStop(1, "#247392");
      waterPath(t, 2, level - 9); ctx.fillStyle = back; ctx.fill();
      var middle = ctx.createLinearGradient(0, level, 0, 456);
      middle.addColorStop(0, "rgba(35,123,157,0.68)");
      middle.addColorStop(0.35, "rgba(32,119,155,0.86)");
      middle.addColorStop(1, "#196889");
      waterPath(t, 0, level); ctx.fillStyle = middle; ctx.fill();
      waterPath(t, 1, level + 1); ctx.fillStyle = "rgba(48,137,170,0.29)"; ctx.fill();
      ribbon(t, 0, level, 12, 18, "rgba(116,192,214,0.13)");
      ribbon(t + 1.3, 1, level, 22, 7, "rgba(11,91,133,0.16)");
      ribbon(t * 0.84, 2, level, 3, 2.4, "rgba(199,235,242,0.28)");
      ribbon(t + 0.7, 0, level, 8, 1.3, "rgba(188,231,240,0.21)");

      ctx.save(); waterPath(t, 0, level + 5); ctx.clip();
      // Banner bubbles belong to this canvas only; menu bubbles are untouched.
      var bubbleAlpha = smooth((t - 0.8) / 2.4);
      bubbles.forEach(function (b) {
        var y = 456 - ((b.y + t * b.speed) % 420);
        var x = b.x + Math.sin(t * 0.8 + b.phase) * 10;
        var fade = clamp((y - level - 14) / 70);
        ctx.globalAlpha = b.alpha * bubbleAlpha * fade;
        ctx.fillStyle = "#b8e0eb";
        ctx.beginPath(); ctx.arc(x, y, b.r, 0, TAU); ctx.fill();
        ctx.globalAlpha *= 0.7;
        ctx.fillStyle = "#e5f7fa";
        ctx.beginPath(); ctx.ellipse(x - b.r * 0.24, y - b.r * 0.28, b.r * 0.32, b.r * 0.18, -0.7, 0, TAU); ctx.fill();
      });
      ctx.globalAlpha = 1;
      // Original title is revealed at frame 244, once water has settled.
      // It remains in the water composition; no flying logo or modern blur.
      var titleAlpha = reduced ? 1 : smooth((t - 244 / 60) / 0.14);
      var titleY = 191 + 6 * (1 - Math.cos(t * Math.PI / 6));
      var titleScale = Math.min(1, width / scale / 400);
      ctx.globalAlpha = titleAlpha;
      ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = (48 * titleScale) + 'px "DroidAH", sans-serif'; ctx.fillText("AFTER", 405, titleY - 39 * titleScale);
      ctx.font = 'bold ' + (78 * titleScale) + 'px "DroidAH", sans-serif'; ctx.fillText("HOURS", 405, titleY + 30 * titleScale);
      ctx.restore();
      // Single short original-style title flash, never repeated.
      var flash = (!reduced && t >= 244 / 60 && t < 256 / 60)
        ? 0.9 * (1 - smooth((t - 246 / 60) / (10 / 60))) : 0;
      if (flash > 0) { ctx.globalAlpha = flash; ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, 810, 456); }
      ctx.globalAlpha = 1;
      root.dataset.bootStage = handoff ? "transition" : t < 0.4 ? "entry" : t < 160 / 60 ? "water-rise" : t < 244 / 60 ? "water-settle" : "title-and-completion";
      root.dataset.bootTime = time.toFixed(3);
    }

    function beginHandoff(now, quick) {
      if (handoff) return;
      handoff = true; transitionStart = now;
      root.dataset.bootStage = "transition";
      skipButton.disabled = true;
      root.style.pointerEvents = "none";
      // Menu is constructed exactly once, by its original renderer, beneath us.
      options.ready();
      root.dataset.fadeDuration = quick ? "180" : "720";
      document.body.dataset.channelState = "HOMEBREW_INTERFACE";
    }
    function dispose() {
      if (ended) return;
      ended = true; cancelAnimationFrame(frameId);
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      if (reducedQuery.removeEventListener) reducedQuery.removeEventListener("change", motionChanged);
      var hadFocus = root.contains(document.activeElement);
      root.remove(); active = null;
      if (hadFocus) {
        var first = options.screen.querySelector(".tile");
        if (first) first.focus({preventScroll:true});
      }
      if (options.done) options.done();
    }
    function tick(now) {
      if (ended) return;
      // Pause elapsed time while hidden instead of skipping unseen stages.
      if (!document.hidden) elapsed += Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      draw(elapsed);
      if (!handoff && (requestedSkip || elapsed >= (reduced ? 0.55 : 6))) {
        beginHandoff(now, reduced || requestedSkip);
      }
      if (handoff) {
        var p = clamp((now - transitionStart) / +root.dataset.fadeDuration);
        root.style.opacity = String(1 - smooth(p));
        if (p >= 1) { dispose(); return; }
      }
      frameId = requestAnimationFrame(tick);
    }
    function visibility() { lastTime = performance.now(); }
    function motionChanged(ev) { if (ev.matches) { reduced = true; requestedSkip = true; } }
    function skip() { requestedSkip = true; }
    skipButton.addEventListener("click", skip);
    document.addEventListener("visibilitychange", visibility);
    if (reducedQuery.addEventListener) reducedQuery.addEventListener("change", motionChanged);
    var observer = new ResizeObserver(resize); observer.observe(root);
    resize(); draw(0);
    frameId = requestAnimationFrame(tick);
    active = { skip: skip, dispose: dispose };
    return active;
  }
  return { start: start, skip: function () { if (active) active.skip(); } };
})();
