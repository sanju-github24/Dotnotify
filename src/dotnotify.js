/*!
 * DotNotify v1.0.0
 * iOS-glass particle notification library
 * MIT License — https://github.com/yourusername/dotnotify
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? module.exports = factory()
    : typeof define === 'function' && define.amd
    ? define(factory)
    : (global.DotNotify = factory());
}(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this, function () {

  /* ─────────────────────────────────────────
     DEFAULTS
  ───────────────────────────────────────── */
  const DEFAULTS = {
    position: 'top-right',   // 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
    theme: 'ios-glass',      // 'ios-glass' | 'dark' | 'light' | 'minimal'
    sound: false,
    maxStack: 4,
    duration: 4200,
    zIndex: 99999,
  };

  const TYPE_CONFIG = {
    error: {
      app: 'Security', color: '#ff6b6b', rgb: '255,107,107',
      tagColor: 'rgba(255,120,120,.75)',
      accentBg: 'rgba(255,80,80,.18)', accentBorder: 'rgba(255,80,80,.4)', accentText: '#ffaaaa',
      dots: ['#ff5252','#ff1744','#ff6b6b','#ff8a80','#ffffff','#ff4444'],
      icon: `<svg viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="rgba(255,107,107,.8)" stroke-width="1.2"/><line x1="5.5" y1="5.5" x2="12.5" y2="12.5" stroke="rgba(255,107,107,.9)" stroke-width="1.6" stroke-linecap="round"/><line x1="12.5" y1="5.5" x2="5.5" y2="12.5" stroke="rgba(255,107,107,.9)" stroke-width="1.6" stroke-linecap="round"/></svg>`
    },
    success: {
      app: 'Auth', color: '#4ade80', rgb: '74,222,128',
      tagColor: 'rgba(74,222,128,.75)',
      accentBg: 'rgba(74,222,128,.18)', accentBorder: 'rgba(74,222,128,.4)', accentText: '#86efac',
      dots: ['#4ade80','#22c55e','#86efac','#bbf7d0','#ffffff','#16a34a'],
      icon: `<svg viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="rgba(74,222,128,.8)" stroke-width="1.2"/><polyline points="5,9 7.5,12 13,6" stroke="rgba(74,222,128,.95)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    },
    warning: {
      app: 'Session', color: '#fbbf24', rgb: '251,191,36',
      tagColor: 'rgba(251,191,36,.75)',
      accentBg: 'rgba(251,191,36,.18)', accentBorder: 'rgba(251,191,36,.4)', accentText: '#fde68a',
      dots: ['#fbbf24','#f59e0b','#fcd34d','#fde68a','#ffffff','#d97706'],
      icon: `<svg viewBox="0 0 18 18" fill="none"><path d="M9 2L16.5 15H1.5L9 2Z" stroke="rgba(251,191,36,.8)" stroke-width="1.2" stroke-linejoin="round"/><line x1="9" y1="7" x2="9" y2="11" stroke="rgba(251,191,36,.95)" stroke-width="1.6" stroke-linecap="round"/><circle cx="9" cy="13.2" r="0.9" fill="rgba(251,191,36,.95)"/></svg>`
    },
    info: {
      app: 'System', color: '#818cf8', rgb: '129,140,248',
      tagColor: 'rgba(129,140,248,.75)',
      accentBg: 'rgba(129,140,248,.18)', accentBorder: 'rgba(129,140,248,.4)', accentText: '#c7d2fe',
      dots: ['#818cf8','#6366f1','#a5b4fc','#c7d2fe','#ffffff','#4f46e5'],
      icon: `<svg viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="rgba(129,140,248,.8)" stroke-width="1.2"/><circle cx="9" cy="5.8" r="1" fill="rgba(129,140,248,.95)"/><line x1="9" y1="8.5" x2="9" y2="13.5" stroke="rgba(129,140,248,.95)" stroke-width="1.7" stroke-linecap="round"/></svg>`
    },
  };

  /* ─────────────────────────────────────────
     INJECT STYLES
  ───────────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById('dotnotify-styles')) return;
    const style = document.createElement('style');
    style.id = 'dotnotify-styles';
    style.textContent = `
      .dn-stage {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: var(--dn-z, 99999);
      }
      .dn-canvas {
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: var(--dn-z, 99999);
      }

      /* ── CARD ── */
      .dn-card {
        position: fixed;
        width: 320px;
        pointer-events: auto;
        opacity: 0;
        transform: scale(.72) translateY(-10px);
        transform-origin: top right;
        border-radius: 20px;
        overflow: hidden;
        transition: top .38s cubic-bezier(.34,1.2,.64,1);
        will-change: transform, top, opacity;
        user-select: none;
        cursor: default;
      }
      .dn-card.pos-left { transform-origin: top left; }

      /* Themes */
      .dn-card.theme-ios-glass {
        background: rgba(28,28,32,.55);
        backdrop-filter: blur(40px) saturate(220%) brightness(110%);
        -webkit-backdrop-filter: blur(40px) saturate(220%) brightness(110%);
        border: 0.5px solid rgba(255,255,255,.22);
        box-shadow:
          0 0 0 0.5px rgba(255,255,255,.08) inset,
          0 1px 0 rgba(255,255,255,.15) inset,
          0 4px 8px rgba(0,0,0,.12),
          0 12px 32px rgba(0,0,0,.4),
          0 40px 64px rgba(0,0,0,.3);
      }
      .dn-card.theme-ios-glass::before {
        content: '';
        position: absolute; top: 0; left: 0; right: 0; height: 50%;
        background: linear-gradient(180deg, rgba(255,255,255,.09) 0%, transparent 100%);
        border-radius: 20px 20px 0 0;
        pointer-events: none; z-index: 0;
      }
      .dn-card.theme-dark {
        background: rgba(10,10,12,.82);
        backdrop-filter: blur(32px) saturate(180%);
        -webkit-backdrop-filter: blur(32px) saturate(180%);
        border: 0.5px solid rgba(255,255,255,.14);
        box-shadow: 0 0 0 0.5px rgba(255,255,255,.06) inset, 0 12px 40px rgba(0,0,0,.6);
      }
      .dn-card.theme-light {
        background: rgba(255,255,255,.78);
        backdrop-filter: blur(32px) saturate(180%);
        -webkit-backdrop-filter: blur(32px) saturate(180%);
        border: 0.5px solid rgba(0,0,0,.1);
        box-shadow: 0 0 0 0.5px rgba(255,255,255,.9) inset, 0 8px 32px rgba(0,0,0,.14);
      }
      .dn-card.theme-light .dn-title  { color: rgba(0,0,0,.88) !important; }
      .dn-card.theme-light .dn-msg    { color: rgba(0,0,0,.5)  !important; }
      .dn-card.theme-light .dn-app    { color: rgba(0,0,0,.38) !important; }
      .dn-card.theme-light .dn-time   { color: rgba(0,0,0,.3)  !important; }
      .dn-card.theme-light .dn-close  { background: rgba(0,0,0,.06); border-color: rgba(0,0,0,.12); color: rgba(0,0,0,.35); }
      .dn-card.theme-light .dn-sep    { background: linear-gradient(90deg,transparent,rgba(0,0,0,.08) 20%,rgba(0,0,0,.06) 80%,transparent); }
      .dn-card.theme-light .dn-tag    { background: rgba(0,0,0,.05); border-color: rgba(0,0,0,.1); }
      .dn-card.theme-light .dn-dp     { background: rgba(0,0,0,.18); }
      .dn-card.theme-minimal {
        background: rgba(16,16,18,.9);
        backdrop-filter: blur(20px) saturate(160%);
        -webkit-backdrop-filter: blur(20px) saturate(160%);
        border: 0.5px solid rgba(255,255,255,.1);
        box-shadow: 0 8px 24px rgba(0,0,0,.5);
      }

      /* animations */
      .dn-card.dn-show  { animation: dn-in .44s cubic-bezier(.28,1.35,.5,1) forwards; }
      .dn-card.dn-hide  { animation: dn-out .44s cubic-bezier(.4,0,1,1) forwards; }
      .dn-card.dn-swipe-left  { animation: dn-swipe-l .32s ease forwards; }
      .dn-card.dn-swipe-right { animation: dn-swipe-r .32s ease forwards; }

      @keyframes dn-in    { 0%{opacity:0;transform:scale(.72) translateY(-10px)} 60%{opacity:1} 100%{opacity:1;transform:scale(1) translateY(0)} }
      @keyframes dn-out   { 0%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(.88) translateY(-8px)} }
      @keyframes dn-swipe-l { 0%{opacity:1;transform:translateX(0)} 100%{opacity:0;transform:translateX(-130%)} }
      @keyframes dn-swipe-r { 0%{opacity:1;transform:translateX(0)} 100%{opacity:0;transform:translateX(130%)} }

      /* ── BODY ── */
      .dn-body   { position: relative; z-index: 2; padding: 14px 16px 10px; }
      .dn-row    { display: flex; align-items: flex-start; gap: 12px; }

      /* icon pill */
      .dn-pill {
        flex-shrink: 0;
        width: 40px; height: 40px; border-radius: 12px;
        display: flex; align-items: center; justify-content: center;
        position: relative; overflow: hidden;
        background: rgba(255,255,255,.1);
        border: 0.5px solid rgba(255,255,255,.2);
        box-shadow: inset 0 1px 0 rgba(255,255,255,.25), 0 2px 8px rgba(0,0,0,.25);
      }
      .dn-pill::before {
        content: '';
        position: absolute; top: 0; left: 0; right: 0; height: 55%;
        background: linear-gradient(180deg, rgba(255,255,255,.18) 0%, transparent 100%);
        border-radius: 12px 12px 0 0;
      }
      .dn-pill svg, .dn-pill img, .dn-pill .dn-emoji {
        position: relative; z-index: 1;
      }
      .dn-pill img {
        width: 40px; height: 40px;
        border-radius: 11px;
        object-fit: cover;
      }
      .dn-pill .dn-emoji { font-size: 20px; line-height: 1; }

      /* ring mode */
      .dn-ring-wrap  { width: 44px; height: 44px; position: relative; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
      .dn-ring-svg   { position: absolute; inset: 0; transform: rotate(-90deg); }
      .dn-ring-bg    { fill: none; stroke: rgba(255,255,255,.1); stroke-width: 2.5; }
      .dn-ring-fill  { fill: none; stroke-width: 2.5; stroke-linecap: round; }
      .dn-ring-inner {
        width: 32px; height: 32px; border-radius: 10px;
        display: flex; align-items: center; justify-content: center;
        background: rgba(255,255,255,.1);
        border: 0.5px solid rgba(255,255,255,.15);
      }
      .dn-ring-inner img   { width: 32px; height: 32px; border-radius: 9px; object-fit: cover; }
      .dn-ring-inner .dn-emoji { font-size: 16px; }

      /* image thumbnail */
      .dn-thumb {
        flex-shrink: 0; margin-top: 2px;
        width: 48px; height: 48px; border-radius: 10px;
        object-fit: cover;
        border: 0.5px solid rgba(255,255,255,.15);
      }

      /* typography */
      .dn-txt    { flex: 1; min-width: 0; }
      .dn-app    { font-size: 10px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: rgba(255,255,255,.4); margin-bottom: 3px; line-height: 1; font-family: inherit; }
      .dn-title  { font-size: 14px; font-weight: 600; letter-spacing: -.022em; line-height: 1.25; color: rgba(255,255,255,.95); font-family: inherit; }
      .dn-msg    { font-size: 12.5px; font-weight: 300; line-height: 1.5; margin-top: 3px; color: rgba(255,255,255,.55); font-family: inherit; }

      /* close */
      .dn-close {
        flex-shrink: 0; margin-top: -2px;
        width: 22px; height: 22px; border-radius: 50%;
        background: rgba(255,255,255,.1); border: 0.5px solid rgba(255,255,255,.15);
        color: rgba(255,255,255,.4); font-size: 10px; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: background .15s, color .15s;
        font-family: inherit;
      }
      .dn-close:hover { background: rgba(255,255,255,.2); color: rgba(255,255,255,.8); }

      /* actions */
      .dn-actions { display: flex; gap: 7px; padding: 0 16px 10px; position: relative; z-index: 2; }
      .dn-action {
        flex: 1; padding: 7px 10px; border-radius: 10px;
        border: 0.5px solid rgba(255,255,255,.14);
        background: rgba(255,255,255,.07); color: rgba(255,255,255,.8);
        font-family: inherit; font-size: 11.5px; font-weight: 500; cursor: pointer;
        transition: background .15s, border-color .15s; text-align: center;
      }
      .dn-action:hover { background: rgba(255,255,255,.14); border-color: rgba(255,255,255,.28); }
      .dn-action.dn-primary {
        background: var(--dn-accent-bg);
        border-color: var(--dn-accent-border);
        color: var(--dn-accent-text);
      }
      .dn-action.dn-primary:hover { filter: brightness(1.15); }

      /* footer */
      .dn-sep  { height: 0.5px; background: linear-gradient(90deg, transparent, rgba(255,255,255,.12) 20%, rgba(255,255,255,.08) 80%, transparent); }
      .dn-foot { display: flex; align-items: center; justify-content: space-between; padding: 8px 16px 10px; position: relative; z-index: 2; }
      .dn-time { font-size: 10px; color: rgba(255,255,255,.25); letter-spacing: .02em; font-family: inherit; }
      .dn-tag  { font-size: 9.5px; font-weight: 500; letter-spacing: .08em; text-transform: uppercase; padding: 3px 10px; border-radius: 20px; background: rgba(255,255,255,.08); border: 0.5px solid rgba(255,255,255,.12); font-family: inherit; }

      /* dot progress */
      .dn-dotbar { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 0 16px 12px; position: relative; z-index: 2; }
      .dn-dp {
        width: 5px; height: 5px; border-radius: 50%;
        background: rgba(255,255,255,.22); flex-shrink: 0; cursor: default;
        transition:
          width .35s cubic-bezier(.34,1.56,.64,1),
          height .35s cubic-bezier(.34,1.56,.64,1),
          background .3s ease, box-shadow .3s ease, opacity .3s ease;
      }
      .dn-dp.dn-active {
        background: var(--dn-color);
        box-shadow: 0 0 8px var(--dn-color), 0 0 18px color-mix(in srgb, var(--dn-color) 40%, transparent);
      }
      .dn-dp.dn-done   { width: 3px; height: 3px; background: rgba(255,255,255,.1); box-shadow: none; opacity: .5; }
      .dn-dp.dn-hovered { width: 12px !important; height: 12px !important; background: var(--dn-color) !important; box-shadow: 0 0 12px var(--dn-color), 0 0 28px color-mix(in srgb, var(--dn-color) 50%, transparent) !important; opacity: 1 !important; }
      .dn-dotbar.dn-paused .dn-dp:not(.dn-done):not(.dn-hovered) { width: 8px !important; height: 8px !important; background: var(--dn-color) !important; box-shadow: 0 0 7px var(--dn-color) !important; opacity: .75 !important; }
      .dn-dotbar.dn-paused .dn-dp.dn-done:not(.dn-hovered) { width: 5px !important; height: 5px !important; background: rgba(255,255,255,.18) !important; opacity: .35 !important; }
    `;
    document.head.appendChild(style);
  }

  /* ─────────────────────────────────────────
     CANVAS PARTICLE ENGINE
  ───────────────────────────────────────── */
  function getOrCreateCanvas(zIndex) {
    let cv = document.getElementById('dn-canvas');
    if (!cv) {
      cv = document.createElement('canvas');
      cv.id = 'dn-canvas';
      cv.className = 'dn-canvas';
      cv.style.zIndex = zIndex;
      cv.style.pointerEvents = 'none';
      document.body.appendChild(cv);
    }
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
    return cv;
  }

  function eio(t) { return t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2; }

  function drawDot(ctx, d, elapsed) {
    const t = Math.max(0, Math.min(1, (elapsed - d.delay) / (1 - d.delay + .001)));
    const et = eio(t);
    d.wb += d.ws;
    d.x = d.sx + (d.tx - d.sx)*et + Math.sin(d.wb)*d.wa*(1-et);
    d.y = d.sy + (d.ty - d.sy)*et + Math.cos(d.wb*1.3)*d.wa*(1-et);
    d.op = t < .07 ? t/.07 : t > .82 ? (1-t)/.18 : 1;
    d.trail.push({x: d.x, y: d.y});
    if (d.trail.length > 10) d.trail.shift();
    for (let j = 1; j < d.trail.length; j++) {
      const tf = (j/d.trail.length)*.32*d.op*(1-et*.8);
      if (tf < .015) continue;
      ctx.beginPath(); ctx.moveTo(d.trail[j-1].x, d.trail[j-1].y); ctx.lineTo(d.trail[j].x, d.trail[j].y);
      ctx.strokeStyle = d.col + Math.round(tf*255).toString(16).padStart(2,'0');
      ctx.lineWidth = d.r*.6; ctx.lineCap = 'round'; ctx.stroke();
    }
    const r = d.r*(1+.2*Math.sin(elapsed*10*800+d.wb))*(1-et*.2);
    const g1 = ctx.createRadialGradient(d.x,d.y,0,d.x,d.y,r*4.5);
    g1.addColorStop(0, d.col + Math.round(d.op*.4*255).toString(16).padStart(2,'0'));
    g1.addColorStop(1, d.col+'00');
    ctx.beginPath(); ctx.arc(d.x,d.y,r*4.5,0,Math.PI*2); ctx.fillStyle=g1; ctx.fill();
    ctx.beginPath(); ctx.arc(d.x,d.y,r,0,Math.PI*2);
    ctx.fillStyle = d.col + Math.round(d.op*255).toString(16).padStart(2,'0'); ctx.fill();
    if (d.op > .4 && r > 2) {
      ctx.beginPath(); ctx.arc(d.x-r*.3,d.y-r*.3,r*.3,0,Math.PI*2);
      ctx.fillStyle = 'rgba(255,255,255,'+d.op*.6+')'; ctx.fill();
    }
    return t < 1;
  }

  function animateParticles(ctx, dots, dur, onDone) {
    const t0 = performance.now();
    let raf;
    function fr(now) {
      const el = (now - t0) / dur;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      let anyRunning = false;
      for (const d of dots) { if (drawDot(ctx, d, el)) anyRunning = true; }
      if (anyRunning) { raf = requestAnimationFrame(fr); }
      else { ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height); onDone && onDone(); }
    }
    raf = requestAnimationFrame(fr);
    return () => { cancelAnimationFrame(raf); ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height); };
  }

  function makeEntryDots(cfg, targetX, targetY, targetW, targetH) {
    const cx = window.innerWidth/2, cy = window.innerHeight/2;
    return Array.from({length: 65}, () => {
      const ang = Math.random()*Math.PI*2, rad = 90+Math.random()*260;
      const d = {
        sx: cx + Math.cos(ang)*rad + (Math.random()-.5)*100,
        sy: cy + Math.sin(ang)*rad + (Math.random()-.5)*100,
        tx: targetX + Math.random()*targetW,
        ty: targetY + Math.random()*targetH,
        r: 1.2 + Math.random()*4,
        col: cfg.dots[Math.floor(Math.random()*cfg.dots.length)],
        delay: Math.pow(Math.random(), .5)*.5,
        wb: Math.random()*Math.PI*2, ws: .03+Math.random()*.06, wa: .5+Math.random()*2,
        trail: [], op: 0, x: 0, y: 0
      };
      d.x = d.sx; d.y = d.sy; return d;
    });
  }

  function makeExitDots(cfg, snapX, snapY, cardW, cardH) {
    return Array.from({length: 52}, () => {
      const sx = snapX + Math.random()*cardW, sy = snapY + Math.random()*cardH;
      const ang = Math.random()*Math.PI*2, rad = 110+Math.random()*270;
      return {
        sx, sy, x: sx, y: sy,
        tx: sx + Math.cos(ang)*rad + (Math.random()-.5)*60,
        ty: sy + Math.sin(ang)*rad + (Math.random()-.5)*60,
        r: 1 + Math.random()*3.5,
        col: cfg.dots[Math.floor(Math.random()*cfg.dots.length)],
        delay: Math.random()*.28,
        wb: Math.random()*Math.PI*2, ws: .04+Math.random()*.07, wa: .3+Math.random()*1.2,
        trail: [], op: 0
      };
    });
  }

  function animateExit(ctx, dots, onDone) {
    const t0 = performance.now(), dur = 640;
    let raf;
    function fr(now) {
      const el = (now-t0)/dur;
      ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
      let running = false;
      for (const d of dots) {
        const t = Math.max(0,Math.min(1,(el-d.delay)/(1-d.delay+.001)));
        const et = 1-Math.pow(1-t,3);
        d.wb += d.ws;
        d.x = d.sx+(d.tx-d.sx)*et;
        d.y = d.sy+(d.ty-d.sy)*et;
        d.op = t<.08?t/.08:Math.pow(1-t,1.5);
        d.trail.push({x:d.x,y:d.y}); if(d.trail.length>7)d.trail.shift();
        for(let j=1;j<d.trail.length;j++){
          const tf=(j/d.trail.length)*.25*d.op; if(tf<.01)continue;
          ctx.beginPath();ctx.moveTo(d.trail[j-1].x,d.trail[j-1].y);ctx.lineTo(d.trail[j].x,d.trail[j].y);
          ctx.strokeStyle=d.col+Math.round(tf*255).toString(16).padStart(2,'0');ctx.lineWidth=d.r*.5;ctx.lineCap='round';ctx.stroke();
        }
        const r=d.r*(1-et*.4);
        const g=ctx.createRadialGradient(d.x,d.y,0,d.x,d.y,r*3.5);
        g.addColorStop(0,d.col+Math.round(d.op*.42*255).toString(16).padStart(2,'0'));g.addColorStop(1,d.col+'00');
        ctx.beginPath();ctx.arc(d.x,d.y,r*3.5,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();
        ctx.beginPath();ctx.arc(d.x,d.y,r,0,Math.PI*2);ctx.fillStyle=d.col+Math.round(d.op*255).toString(16).padStart(2,'0');ctx.fill();
        if(t<1)running=true;
      }
      if(running){raf=requestAnimationFrame(fr);}else{ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);onDone&&onDone();}
    }
    raf=requestAnimationFrame(fr);
    return ()=>{cancelAnimationFrame(raf);ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);};
  }

  /* ─────────────────────────────────────────
     SOUND ENGINE
  ───────────────────────────────────────── */
  function playSound(type) {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ac.createOscillator(), gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      const freqs = { error:[440,330], success:[523,659], warning:[466,440], info:[587,659] };
      const f = freqs[type] || [440,523];
      osc.frequency.setValueAtTime(f[0], ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(f[1], ac.currentTime+0.12);
      osc.type = 'sine';
      gain.gain.setValueAtTime(0, ac.currentTime);
      gain.gain.linearRampToValueAtTime(0.055, ac.currentTime+0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime+0.22);
      osc.start(ac.currentTime); osc.stop(ac.currentTime+0.25);
    } catch(e) {}
  }

  /* ─────────────────────────────────────────
     SWIPE HANDLER
  ───────────────────────────────────────── */
  function attachSwipe(el, onSwipe) {
    let startX=0, dragging=false, current=0;
    const down = e => { const t=e.touches?e.touches[0]:e; startX=t.clientX; dragging=true; current=0; };
    const move = e => {
      if(!dragging)return;
      const t=e.touches?e.touches[0]:e;
      const dx=t.clientX-startX;
      current=dx;
      el.style.transform='translateX('+dx+'px)';
      el.style.opacity=String(1-Math.abs(dx)/220);
    };
    const up = () => {
      if(!dragging)return; dragging=false;
      if(Math.abs(current)>80){ onSwipe(current>0?'right':'left'); }
      else { el.style.transform=''; el.style.opacity=''; }
    };
    el.addEventListener('mousedown',down);
    el.addEventListener('mousemove',move);
    el.addEventListener('mouseup',up);
    el.addEventListener('mouseleave',()=>{if(dragging){dragging=false;el.style.transform='';el.style.opacity='';}});
    el.addEventListener('touchstart',down,{passive:true});
    el.addEventListener('touchmove',move,{passive:true});
    el.addEventListener('touchend',up);
  }

  /* ─────────────────────────────────────────
     POSITION CALCULATOR
  ───────────────────────────────────────── */
  const CARD_W = 320;
  const CARD_H_EST = 155;
  const PAD = 20;
  const GAP = 10;

  function getCoords(position, slotIndex) {
    const W = window.innerWidth, H = window.innerHeight;
    const x = position.includes('right') ? W - CARD_W - PAD : PAD;
    const y = position.includes('top')
      ? PAD + (CARD_H_EST + GAP) * slotIndex
      : H - CARD_H_EST - PAD - (CARD_H_EST + GAP) * slotIndex;
    return { x, y };
  }

  /* ─────────────────────────────────────────
     DOT PROGRESS BAR
  ───────────────────────────────────────── */
  function buildDotBar(cardEl, cfg, duration, onFinish) {
    const bar = cardEl.querySelector('.dn-dotbar');
    if (!bar) return { destroy: () => {} };
    const N = 14;
    let idx = 0, paused = false, elapsed = 0, tickStart = Date.now(), timer = null;
    const interval = duration / N;

    for (let i = 0; i < N; i++) {
      const d = document.createElement('div');
      d.className = 'dn-dp';
      d.style.setProperty('--dn-color', cfg.color);
      d.addEventListener('mouseenter', () => d.classList.add('dn-hovered'));
      d.addEventListener('mouseleave', () => d.classList.remove('dn-hovered'));
      bar.appendChild(d);
    }
    const dots = () => bar.querySelectorAll('.dn-dp');
    dots()[0].classList.add('dn-active');
    tickStart = Date.now();

    cardEl.addEventListener('mouseenter', () => {
      if (paused) return; paused = true;
      elapsed += Date.now() - tickStart;
      bar.classList.add('dn-paused');
      clearTimeout(timer);
    });
    cardEl.addEventListener('mouseleave', () => {
      if (!paused) return; paused = false;
      bar.classList.remove('dn-paused');
      tickStart = Date.now();
      sched();
    });

    function sched() { timer = setTimeout(tick, Math.max(0, interval - elapsed)); }
    function tick() {
      if (paused) return;
      const d = dots();
      d[idx].classList.remove('dn-active'); d[idx].classList.add('dn-done');
      idx++; elapsed = 0; tickStart = Date.now();
      if (idx >= N) { onFinish(); return; }
      d[idx].classList.add('dn-active');
      sched();
    }
    sched();
    return { destroy: () => clearTimeout(timer) };
  }

  /* ─────────────────────────────────────────
     RING PROGRESS
  ───────────────────────────────────────── */
  function buildRingTimer(cardEl, cfg, duration, onFinish) {
    const fill = cardEl.querySelector('.dn-ring-fill');
    if (!fill) return { destroy: () => {} };
    const R = 19, circ = 2*Math.PI*R;
    fill.style.strokeDasharray = circ;
    fill.style.strokeDashoffset = 0;
    let _elapsed = 0, _startT = Date.now(), _paused = false, raf;

    cardEl.addEventListener('mouseenter', () => { if (!_paused) { _paused=true; _elapsed+=Date.now()-_startT; } });
    cardEl.addEventListener('mouseleave', () => { if (_paused) { _paused=false; _startT=Date.now(); } });

    function tick() {
      const total = _paused ? _elapsed : _elapsed + (Date.now()-_startT);
      const p = Math.min(1, total / duration);
      fill.style.strokeDashoffset = circ * p;
      if (p >= 1) { onFinish(); return; }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return { destroy: () => cancelAnimationFrame(raf) };
  }

  /* ─────────────────────────────────────────
     BUILD ICON HTML
  ───────────────────────────────────────── */
  function buildIconHtml(opts, cfg, useRing) {
    // Determine icon content
    let iconInner;
    if (opts.image) {
      // image: URL string or HTMLImageElement or File
      const src = typeof opts.image === 'string' ? opts.image
        : opts.image instanceof HTMLImageElement ? opts.image.src
        : null;
      if (src) {
        iconInner = `<img src="${src}" alt="notification image" style="width:${useRing?32:40}px;height:${useRing?32:40}px;border-radius:${useRing?9:11}px;object-fit:cover">`;
      } else if (opts.image instanceof File) {
        // Will be set async — placeholder first
        iconInner = `<span class="dn-emoji" data-file="1">📷</span>`;
      } else {
        iconInner = `<span class="dn-emoji">${opts.icon || '🔔'}</span>`;
      }
    } else if (opts.icon) {
      // custom emoji or SVG string
      iconInner = opts.icon.startsWith('<')
        ? opts.icon
        : `<span class="dn-emoji">${opts.icon}</span>`;
    } else {
      iconInner = cfg.icon;
    }

    if (useRing) {
      const R = 19, circ = 2*Math.PI*R;
      return `<div class="dn-ring-wrap">
        <svg class="dn-ring-svg" viewBox="0 0 44 44">
          <circle class="dn-ring-bg" cx="22" cy="22" r="${R}"/>
          <circle class="dn-ring-fill" cx="22" cy="22" r="${R}" stroke="${cfg.color}" style="stroke-dasharray:${circ};stroke-dashoffset:0"/>
        </svg>
        <div class="dn-ring-inner">${iconInner}</div>
      </div>`;
    }

    return `<div class="dn-pill" style="box-shadow:inset 0 1px 0 rgba(255,255,255,.25),0 0 18px rgba(${cfg.rgb},.22),0 2px 8px rgba(0,0,0,.25);border-color:rgba(${cfg.rgb},.35)">${iconInner}</div>`;
  }

  /* ─────────────────────────────────────────
     CREATE CARD ELEMENT
  ───────────────────────────────────────── */
  function createCard(opts, cfg, position, theme, duration) {
    const useRing = !!opts.progressStyle && opts.progressStyle === 'ring';
    const el = document.createElement('div');
    el.className = `dn-card theme-${theme}`;
    if (position.includes('left')) el.classList.add('pos-left');
    el.style.cssText = [
      `--dn-color:${cfg.color}`,
      `--dn-accent-bg:${cfg.accentBg}`,
      `--dn-accent-border:${cfg.accentBorder}`,
      `--dn-accent-text:${cfg.accentText}`,
    ].join(';');

    // thumbnail aside (separate from icon)
    const thumbHtml = opts.thumbnail
      ? `<img class="dn-thumb" src="${typeof opts.thumbnail==='string'?opts.thumbnail:''}" alt="thumb">`
      : '';

    // actions
    const actHtml = (opts.actions || []).map((a, i) =>
      `<button class="dn-action${i===0&&a.primary?' dn-primary':''}" data-act="${a.label}">${a.label}</button>`
    ).join('');

    el.innerHTML = `
      <div class="dn-body">
        <div class="dn-row">
          ${buildIconHtml(opts, cfg, useRing)}
          <div class="dn-txt">
            <div class="dn-app" style="color:rgba(${cfg.rgb},.65)">${opts.app||cfg.app}</div>
            <div class="dn-title">${opts.title||'Notification'}</div>
            <div class="dn-msg">${opts.message||''}</div>
          </div>
          ${thumbHtml}
          <button class="dn-close">✕</button>
        </div>
      </div>
      ${actHtml ? `<div class="dn-actions">${actHtml}</div>` : ''}
      <div class="dn-sep"></div>
      <div class="dn-foot">
        <span class="dn-time">just now</span>
        <span class="dn-tag" style="color:${cfg.tagColor};border-color:rgba(${cfg.rgb},.18)">${opts.type||'info'}</span>
      </div>
      ${useRing ? '' : '<div class="dn-dotbar"></div>'}
    `;

    // Handle File image async
    if (opts.image instanceof File) {
      const reader = new FileReader();
      reader.onload = e => {
        const placeholder = el.querySelector('[data-file]');
        if (placeholder) {
          const img = document.createElement('img');
          img.src = e.target.result;
          img.style.cssText = 'width:40px;height:40px;border-radius:11px;object-fit:cover;position:relative;z-index:1';
          placeholder.replaceWith(img);
        }
      };
      reader.readAsDataURL(opts.image);
    }

    return el;
  }

  /* ─────────────────────────────────────────
     DOTNOTIFY FACTORY
  ───────────────────────────────────────── */
  function DotNotify(userConfig) {
    const cfg = Object.assign({}, DEFAULTS, userConfig);
    injectStyles();

    const cv = getOrCreateCanvas(cfg.zIndex - 1);
    const ctx = cv.getContext('2d');
    window.addEventListener('resize', () => { cv.width=window.innerWidth; cv.height=window.innerHeight; });

    // Stage element for cards
    let stage = document.getElementById('dn-stage');
    if (!stage) {
      stage = document.createElement('div');
      stage.id = 'dn-stage';
      stage.className = 'dn-stage';
      stage.style.zIndex = cfg.zIndex;
      document.body.appendChild(stage);
    }

    let stack = [];    // active cards
    const queue = [];  // waiting
    let cancelEntry = null;

    function restack() {
      stack.forEach((item, i) => {
        const { x, y } = getCoords(cfg.position, i);
        item.el.style.left = x + 'px';
        item.el.style.top  = y + 'px';
        item.x = x; item.y = y;
      });
    }

    function removeCard(el) {
      const i = stack.findIndex(s => s.el === el);
      if (i > -1) stack.splice(i, 1);
      restack();
      if (queue.length > 0 && stack.length < cfg.maxStack) {
        const next = queue.shift();
        setTimeout(() => spawnCard(next.opts, next.resolve), 120);
      }
    }

    function spawnCard(opts, resolve) {
      const typeCfg = TYPE_CONFIG[opts.type] || TYPE_CONFIG.info;
      const theme = opts.theme || cfg.theme;
      const duration = opts.duration || cfg.duration;
      const slot = stack.length;
      const { x, y } = getCoords(cfg.position, slot);
      const useRing = opts.progressStyle === 'ring';

      const el = createCard(opts, typeCfg, cfg.position, theme, duration);
      el.style.left = x + 'px';
      el.style.top  = y + 'px';
      el.style.zIndex = cfg.zIndex;
      stage.appendChild(el);
      requestAnimationFrame(() => el.classList.add('dn-show'));

      if (cfg.sound || opts.sound) playSound(opts.type || 'info');

      let progCtrl = null;

      const killCard = (reason, action) => {
        if (progCtrl) progCtrl.destroy();
        el.classList.remove('dn-show');
        if (reason === 'swipe-left')       el.classList.add('dn-swipe-left');
        else if (reason === 'swipe-right') el.classList.add('dn-swipe-right');
        else                               el.classList.add('dn-hide');

        const snapX = parseInt(el.style.left), snapY = parseInt(el.style.top);
        const delay = reason.startsWith('swipe') ? 320 : 260;
        setTimeout(() => {
          el.remove();
          removeCard(el);
          // exit dots
          const exitDots = makeExitDots(typeCfg, snapX, snapY, CARD_W, CARD_H_EST);
          animateExit(ctx, exitDots);
          resolve && resolve({ dismissed: reason, action });
        }, delay);
      };

      // start progress after card appears
      setTimeout(() => {
        progCtrl = useRing
          ? buildRingTimer(el, typeCfg, duration, () => killCard('timeout'))
          : buildDotBar(el, typeCfg, duration, () => killCard('timeout'));
      }, 450);

      el.querySelector('.dn-close').addEventListener('click', () => killCard('close'));
      (opts.actions || []).forEach(a => {
        const btn = el.querySelector(`[data-act="${a.label}"]`);
        if (btn) btn.addEventListener('click', () => {
          if (a.onClick) a.onClick();
          killCard('action', a.label);
        });
      });

      attachSwipe(el, dir => killCard('swipe-' + dir));
      stack.push({ el, x, y, kill: () => killCard('external') });
    }

    /* ── PUBLIC fire() ── returns Promise ── */
    function fire(opts) {
      return new Promise(resolve => {
        if (stack.length >= cfg.maxStack) {
          queue.push({ opts, resolve });
          return;
        }

        if (stack.length === 0) {
          // entry animation for first card
          const { x, y } = getCoords(cfg.position, 0);
          const typeCfg = TYPE_CONFIG[opts.type] || TYPE_CONFIG.info;
          const entryDots = makeEntryDots(typeCfg, x, y, CARD_W, CARD_H_EST);
          if (cancelEntry) cancelEntry();
          cancelEntry = animateParticles(ctx, entryDots, 780, () => {
            spawnCard(opts, resolve);
          });
        } else {
          spawnCard(opts, resolve);
        }
      });
    }

    /* ── dismiss all ── */
    function dismissAll() {
      [...stack].forEach(s => s.kill());
    }

    /* ── update global config ── */
    function configure(newCfg) {
      Object.assign(cfg, newCfg);
    }

    return { fire, dismissAll, configure };
  }

  return DotNotify;
}));
