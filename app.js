/* Sato New Starter Quiz. Static front end in the HR premium identity; all game state, timing and
   scoring live in Supabase. */
(function () {
  "use strict";
  var SB_URL = "https://mlbpzvaanusdejqnimst.supabase.co";
  var SB_KEY = "sb_publishable_eTq3UnKWyn7ral0CVFzqDw_wrW95FYc";
  var FRAME_PHRASE = "SATO PHARMA L.L.C. · HUMAN RESOURCES · TALENT ACQUISITION · NEW STARTER QUIZ";
  var app = document.getElementById("app");
  var params = new URLSearchParams(location.search);
  var BASE = location.origin + location.pathname;
  var LETTERS = "ABCDEF";

  /* ---------- helpers ---------- */
  function rpc(fn, args) {
    return fetch(SB_URL + "/rest/v1/rpc/" + fn, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SB_KEY },
      body: JSON.stringify(args || {})
    }).then(function (r) {
      return r.json().catch(function () { return null; }).then(function (j) {
        if (!r.ok) throw new Error((j && j.message) || "Connection problem. Try again.");
        return j;
      });
    });
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k)); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  function secs(ms) { return (Math.max(0, ms) / 1000).toFixed(1) + " s"; }
  function mins(s) { s = Math.max(0, Math.round(s || 0)); var m = Math.floor(s / 60), r = s % 60; return m ? m + " min" + (r ? " " + r + " s" : "") : r + " s"; }
  function picOnly(opts) { return opts.every(function (x, j) { return x === LETTERS[j]; }); }
  function pad(n) { return String(n).padStart(2, "0"); }
  function fmtCode(c) { return String(c).slice(0, 3) + " " + String(c).slice(3); }
  var UPLOAD_URL = SB_URL + "/functions/v1/quiz-upload";
  var STILL = false, MAST_TITLE = null;
  function render(html, still) {
    if (still === undefined) still = STILL;
    STILL = false;
    app.innerHTML = html;
    var r = app.firstElementChild;
    if (!still && r && !r.classList.contains("hold") && !r.classList.contains("seq")) r.classList.add("anim");
  }
  function codeDigits(code) { return String(code).split("").map(function (d, k) { return '<span class="dg" style="--d:' + k + '">' + d + '</span>' + (k === 2 ? " " : ""); }).join(""); }
  function hit(el) { if (!el) return; el.classList.remove("hit"); void el.offsetWidth; el.classList.add("hit"); }
  function toast(msg) { var t = document.createElement("div"); t.className = "toast"; t.textContent = msg; document.body.appendChild(t); setTimeout(function () { t.remove(); }, 3200); }
  function waiting(text) { return '<div class="waiting"><span class="dots"><i></i><i></i><i></i></span>' + esc(text) + '</div>'; }
  function tick() { return '<div class="tick"><i></i><i></i><i></i></div>'; }
  function hl(light, bold, cls) {
    var words = String(bold).split(" ").map(function (w, k) { return '<span class="w" style="--w:' + k + '">' + esc(w) + '</span>'; }).join(" ");
    return '<h1 class="hl' + (cls ? " " + cls : "") + '">' + esc(light) + '<b>' + words + '</b></h1>';
  }
  function chapter(num, label) { return '<div class="chapter"><span class="num outline-n">' + esc(num) + '</span><span class="lbl micro">' + esc(label) + '</span></div>'; }
  function titleParts(t) {
    if (t.indexOf(":") > 0) return [t.split(":")[0], t.split(":")[1].trim() + "."];
    var w = t.split(" "); return w.length > 1 ? [w.slice(0, -1).join(" "), w[w.length - 1] + "."] : ["Today", t + "."];
  }

  /* page chrome: masthead subtitle, running foot, closing theme */
  function chrome(o) {
    document.getElementById("mastSub").textContent = o.host ? "Human Resources · Hosted by " + o.host : "Human Resources · Talent Acquisition · Head Office";
    document.querySelector(".mast .t").textContent = (o.host && MAST_TITLE) || "New Starter Quiz";
    document.getElementById("footSec").textContent = o.section || "";
    document.getElementById("footNo").textContent = o.no || "";
    document.getElementById("footLeft").textContent = o.left || "";
    document.body.classList.toggle("closing", !!o.closing);
    drawFrame(); drawBand();
  }

  /* the security-microtext frame, drawn to the viewport (no transforms: side text runs on paths) */
  function drawFrame() {
    var svg = document.getElementById("frame"), W = window.innerWidth, H = window.innerHeight;
    var small = W < 640, o = small ? 5 : 8, i = small ? 9 : 13, mid = (o + i) / 2, tile = small ? 10 : 15, fs = small ? 3.1 : 4.2;
    var gold = document.body.classList.contains("closing");
    var deep = gold ? "#C9A45C" : "#0A527D", light = gold ? "#A8843F" : "#1482C2", ink = gold ? "#C9A45C" : "#0A6BA6", fill = gold ? "#0A1B2E" : "#fff";
    var start = mid + tile / 2 + 5, unit = FRAME_PHRASE + " · ";
    function run(len) { var reps = Math.max(1, Math.round((0.9 * len) / (unit.length * 0.58 * fs))); return esc(Array(reps + 1).join(unit).replace(/ · $/, "")); }
    var across = W - 2 * start, down = H - 2 * start, half = fs * 0.36;
    function corner(cx, cy) {
      var a = tile / 2, b = a - tile * 0.22, r = tile * 0.15;
      return '<rect class="tile" x="' + (cx - a) + '" y="' + (cy - a) + '" width="' + tile + '" height="' + tile + '" fill="' + fill + '" stroke="' + deep + '" stroke-width="1"/>' +
        '<rect x="' + (cx - b) + '" y="' + (cy - b) + '" width="' + 2 * b + '" height="' + 2 * b + '" fill="none" stroke="' + light + '" stroke-width=".5"/>' +
        '<polygon points="' + cx + "," + (cy - r) + " " + (cx + r) + "," + cy + " " + cx + "," + (cy + r) + " " + (cx - r) + "," + cy + '" fill="' + deep + '"/>';
    }
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    if (!drawFrame.done) { drawFrame.done = true; svg.classList.add("intro"); setTimeout(function () { svg.classList.remove("intro"); }, 2600); }
    svg.innerHTML = '<defs><path id="fl" d="M ' + (mid + half) + " " + (H - start) + " L " + (mid + half) + " " + start + '"/><path id="fr" d="M ' + (W - mid - half) + " " + start + " L " + (W - mid - half) + " " + (H - start) + '"/></defs>' +
      '<rect class="k" pathLength="1" x="' + o + '" y="' + o + '" width="' + (W - 2 * o) + '" height="' + (H - 2 * o) + '" fill="none" stroke="' + deep + '" stroke-width="1"/>' +
      '<rect class="k2" pathLength="1" x="' + i + '" y="' + i + '" width="' + (W - 2 * i) + '" height="' + (H - 2 * i) + '" fill="none" stroke="' + light + '" stroke-width=".5"/>' +
      '<g direction="ltr" fill="' + ink + '" font-family="Segoe UI, Noto Sans, Arial, sans-serif" font-weight="600" font-size="' + fs + '">' +
      '<text x="' + start + '" y="' + (mid + half) + '" textLength="' + across + '" lengthAdjust="spacing">' + run(across) + '</text>' +
      '<text x="' + start + '" y="' + (H - mid + half) + '" textLength="' + across + '" lengthAdjust="spacing">' + run(across) + '</text>' +
      '<text textLength="' + down + '" lengthAdjust="spacing"><textPath href="#fl">' + run(down) + '</textPath></text>' +
      '<text textLength="' + down + '" lengthAdjust="spacing"><textPath href="#fr">' + run(down) + '</textPath></text></g>' +
      corner(mid, mid) + corner(W - mid, mid) + corner(mid, H - mid) + corner(W - mid, H - mid);
  }
  /* the engine-turned band: two sine passes half a wavelength apart, centred */
  function drawBand() {
    var svg = document.getElementById("band"), w = Math.max(100, svg.clientWidth || 600), wl = 22, h = 6, m = h / 2, amp = (m - 1) * 4 / 3, up = "", dn = "";
    var x0 = ((w / 2 - wl / 2) % wl) - 2 * wl;
    for (var x = x0; x < w + 2 * wl; x += wl) {
      up += "M" + x.toFixed(2) + " " + m + "Q" + (x + wl / 4).toFixed(2) + " " + (m - amp).toFixed(2) + " " + (x + wl / 2).toFixed(2) + " " + m + "T" + (x + wl).toFixed(2) + " " + m;
      dn += "M" + x.toFixed(2) + " " + m + "Q" + (x + wl / 4).toFixed(2) + " " + (m + amp).toFixed(2) + " " + (x + wl / 2).toFixed(2) + " " + m + "T" + (x + wl).toFixed(2) + " " + m;
    }
    svg.setAttribute("viewBox", "0 0 " + w + " " + h); svg.setAttribute("preserveAspectRatio", "none");
    svg.innerHTML = '<path d="' + up + '"/><path d="' + dn + '"/>';
  }
  var rsz; window.addEventListener("resize", function () { clearTimeout(rsz); rsz = setTimeout(function () { drawFrame(); drawBand(); }, 120); });

  var GIFT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" aria-hidden="true"><rect x="3" y="8" width="18" height="4"/><path d="M12 8v13M19 12v9H5v-9"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/></svg>';
  /* ---------- motion: diamond bursts, haptics, sound, countdown ---------- */
  var REDUCED = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  var FX = { c: null, g: null, P: [], run: false };
  function burst(o) {
    if (REDUCED) return;
    o = o || {};
    if (!FX.c) { FX.c = document.createElement("canvas"); FX.c.id = "fx"; document.body.appendChild(FX.c); FX.g = FX.c.getContext("2d"); }
    var W = innerWidth, H = innerHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
    if (FX.c.width !== W * dpr) { FX.c.width = W * dpr; FX.c.height = H * dpr; FX.g.setTransform(dpr, 0, 0, dpr, 0, 0); }
    var cols = o.colors || ["#0A527D", "#0A6BA6", "#1482C2", "#9ED3F0"], n = o.count || 80, ox = (o.x == null ? .5 : o.x) * W, oy = (o.y == null ? .45 : o.y) * H;
    for (var k = 0; k < n; k++) {
      var ang = Math.random() * Math.PI * 2, sp = (o.power || 9) * (.35 + Math.random());
      FX.P.push({ x: ox, y: oy, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - (o.lift || 5), s: 4 + Math.random() * 7, r: Math.random() * 6, vr: (Math.random() - .5) * .3, c: cols[k % cols.length], life: 0, max: 110 + Math.random() * 60 });
    }
    if (!FX.run) { FX.run = true; requestAnimationFrame(fxFrame); }
  }
  function fxFrame() {
    var g = FX.g, W = innerWidth, H = innerHeight;
    g.clearRect(0, 0, W, H);
    FX.P = FX.P.filter(function (q) { return q.life < q.max && q.y < H + 40; });
    FX.P.forEach(function (q) {
      q.life++; q.vy += .26; q.vx *= .985; q.x += q.vx; q.y += q.vy; q.r += q.vr;
      g.save(); g.globalAlpha = Math.max(0, 1 - Math.pow(q.life / q.max, 2)); g.translate(q.x, q.y); g.rotate(q.r); g.fillStyle = q.c; g.fillRect(-q.s / 2, -q.s / 2, q.s, q.s); g.restore();
    });
    if (FX.P.length) requestAnimationFrame(fxFrame); else { FX.run = false; g.clearRect(0, 0, W, H); }
  }
  var GOLD = ["#C9A45C", "#E4CC8E", "#A8843F", "#F1F4F8"];
  function buzz(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} }
  function goFlash(streak) {
    if (REDUCED) return;
    var f = document.createElement("div"); f.className = "goflash";
    f.innerHTML = '<div class="st"><span class="k">' + streak + ' correct in a row</span><span class="t">GO MODE</span><span class="n">Keep it going</span></div>';
    document.body.appendChild(f); setTimeout(function () { f.remove(); }, 1800);
    burst({ colors: GOLD, count: 90, power: 10, y: .5 });
  }
  function splash() {
    if (REDUCED) return;
    var s = document.createElement("div"); s.id = "splash";
    s.innerHTML = '<div class="in"><img src="brand/sato-pharma-logo-on-light.svg" alt=""><span class="seam"></span><span class="micro">New Starter Quiz</span></div>';
    document.body.appendChild(s);
    setTimeout(function () { s.classList.add("out"); setTimeout(function () { s.remove(); }, 500); }, 1250);
  }

  var SND = { ctx: null, on: store("satoquiz:sound") !== false };
  function audio() {
    try { if (!SND.ctx) SND.ctx = new (window.AudioContext || window.webkitAudioContext)(); if (SND.ctx.state === "suspended") SND.ctx.resume(); } catch (e) {}
    return SND.ctx;
  }
  function tone(f, dur, type, vol, when) {
    var c = SND.ctx; if (!SND.on || !c || c.state !== "running") return;
    var t = c.currentTime + (when || 0), o = c.createOscillator(), g = c.createGain();
    o.type = type || "sine"; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol || .15, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + .05);
  }
  var SFX = {
    blip: function () { tone(880, .08, "sine", .1); tone(1320, .09, "sine", .07, .06); },
    count: function () { tone(587, .16, "square", .07); },
    go: function () { tone(880, .1, "square", .1); tone(1175, .3, "square", .1, .09); },
    tick: function () { tone(1250, .035, "square", .045); },
    reveal: function () { [523, 659, 784].forEach(function (f, i) { tone(f, .2, "triangle", .13, i * .07); }); },
    rise: function () { for (var i = 0; i < 6; i++) tone(440 * Math.pow(1.19, i), .12, "triangle", .07, i * .06); },
    drum: function () { for (var i = 0; i < 18; i++) tone(98 + i * 4, .05, "square", .045 + i * .002, i * .11); },
    fanfare: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, .24, "triangle", .15, i * .11); }); tone(1047, 1.1, "triangle", .13, .46); tone(1319, 1.1, "sine", .07, .46); tone(1568, 1.1, "sine", .05, .5); }
  };

  /* the 3 · 2 · 1 · GO overlay, driven by the server's start time */
  var CD = { el: null, last: null };
  function countdown(msToGo, label) {
    if (msToGo <= -650) { hideCountdown(); return; }
    if (!CD.el) {
      CD.el = document.createElement("div"); CD.el.className = "cd"; CD.el.setAttribute("aria-live", "assertive");
      CD.el.innerHTML = '<div class="box"><span class="micro"></span><span class="big"></span><span class="ringd" hidden></span></div>';
      document.body.appendChild(CD.el);
    }
    var sec = msToGo > 0 ? Math.ceil(msToGo / 1000) : 0;
    CD.el.classList.add("on");
    if (sec === CD.last) return null;
    CD.last = sec;
    CD.el.querySelector(".micro").textContent = label;
    var big = CD.el.querySelector(".big"), ring = CD.el.querySelector(".ringd");
    big.className = "big"; void big.offsetWidth; big.className = "big " + (sec > 0 ? "n" : "go"); big.textContent = sec > 0 ? String(sec) : "GO";
    ring.hidden = sec > 0; if (!ring.hidden) { ring.style.animation = "none"; void ring.offsetWidth; ring.style.animation = ""; }
    return sec;
  }
  function hideCountdown() { if (CD.el) CD.el.classList.remove("on"); CD.last = null; }
  function release(id, stagSel) {
    var el = document.getElementById(id);
    if (!el || !el.classList.contains("hold")) return false;
    el.classList.remove("hold"); el.classList.add("anim");
    if (stagSel) { var s = el.querySelector(stagSel); if (s) s.classList.add("stag"); }
    return true;
  }
  function bump(el) { if (!el) return; el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }

  function zoom(src) { var z = document.createElement("div"); z.className = "zoom"; z.innerHTML = '<img alt="" src="' + esc(src) + '">'; z.addEventListener("click", function () { z.remove(); }); document.body.appendChild(z); }
  function qrSvg(text) {
    var q = qrcode(0, "M"); q.addData(text); q.make();
    var n = q.getModuleCount(), m = 2, d = "";
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) d += "M" + (c + m) + " " + (r + m) + "h1v1h-1z";
    return '<svg viewBox="0 0 ' + (n + 2 * m) + " " + (n + 2 * m) + '" shape-rendering="crispEdges" role="img" aria-label="QR code to join"><rect width="100%" height="100%" fill="#fff"/><path d="' + d + '" fill="#0A527D"/></svg>';
  }
  function poller(fn, ms) {
    var stopped = false, timer = null, busy = false;
    function t() { if (stopped || busy) return; busy = true; Promise.resolve(fn()).catch(function () {}).then(function () { busy = false; if (!stopped) timer = setTimeout(t, ms); }); }
    t();
    return { stop: function () { stopped = true; clearTimeout(timer); }, now: function () { clearTimeout(timer); t(); } };
  }
  function routeHtml(q, total) {
    if (total > 12) return "";
    var h = '<div class="route" aria-label="Progress">';
    for (var k = 0; k < total; k++) h += '<div class="' + (k < q ? "done" : k === q ? "here" : "") + '"><span class="n outline-n">' + pad(k + 1) + '</span><span class="dot"></span></div>';
    return h + '</div>';
  }
  function boardHtml(rows, total, limit) {
    return '<div class="board stag">' + rows.slice(0, limit).map(function (r) {
      return '<div class="brow' + (r.rank === 1 ? " first" : "") + '" style="--i:' + rows.indexOf(r) + '"><span class="pos outline-n">' + r.rank + '</span><span class="nm">' + esc(r.name) + '</span><span class="sc">' + r.correct + "/" + total + '</span><span class="tm">' + secs(r.ms) + '</span></div>';
    }).join("") + '</div>';
  }

  /* sections ("Module 3 – Non-verbal communication") and questions without a picture */
  function sectionParts(s) {
    s = String(s || "");
    var parts = s.split(/\s+[–—-]\s+/), head = parts[0], m = head.match(/^(.*?)(\d+)\s*$/);
    var title = parts.length > 1 ? parts.slice(1).join(" – ") : "";
    if (m) return { label: m[1].trim() || "Part", num: pad(+m[2]), n: +m[2], title: title || head, head: head };
    return { label: "", num: "", n: 0, title: s, head: s };
  }
  function isPoll(item) { return !!item && (item.kind === "cloud" || item.kind === "text"); }
  function topicCard(item, sm) {
    var p = sectionParts(item.section || item.tag), kind = item.kind || "choice";
    var foot = kind === "cloud" ? "Word cloud · not scored" : kind === "text" ? "Open answer · not scored" : (/scenario/i.test(item.tag || "") ? "Scenario question" : "Question");
    return '<div class="plate topic' + (sm ? " sm" : "") + '"><i class="td a"></i><i class="td b"></i><span class="micro">' + esc(p.label || "Topic") + '</span>' + (p.num ? '<span class="tn outline-n">' + p.num + '</span>' : "") +
      '<h3>' + esc(p.title) + '</h3><span class="tk"><i class="dia on"></i><span class="micro">' + esc(foot) + (item.secs ? " · " + item.secs + " s" : "") + '</span></span></div>';
  }
  function figHtml(src, item, sm, alt) {
    return src ? '<div class="plate figure' + (sm ? " sm" : "") + '"><img alt="' + (alt || "Question picture") + '" src="' + esc(src) + '"></div>' : topicCard(item || {}, sm);
  }
  /* live poll responses: a word cloud, or a wall of short answers. Only new entries animate. */
  function respHtml(kind, list, seen) {
    list = list || []; seen = seen || {};
    if (!list.length) return waiting(kind === "cloud" ? "Words appear here as they arrive" : "Answers appear here as they arrive");
    if (kind === "cloud") {
      var max = list[0].n, min = list[list.length - 1].n, ord = [];
      list.forEach(function (x, i) { if (i % 2) ord.push(x); else ord.unshift(x); });
      return '<div class="cloud">' + ord.map(function (x, i) {
        var t = max === min ? 0.45 : (x.n - min) / (max - min), k = "w:" + x.w + ":" + x.n, isNew = !seen[k]; seen[k] = 1;
        return '<span class="cw' + (isNew ? " new" : "") + (t > 0.66 ? " big" : "") + '" style="--s:' + (0.95 + t * 2.4).toFixed(2) + ';--i:' + (i % 12) + '">' + esc(x.w) + (x.n > 1 ? '<sup>' + x.n + '</sup>' : "") + '</span>';
      }).join("") + '</div>';
    }
    return '<div class="wall">' + list.map(function (x, i) { var k = "t:" + x.t, isNew = !seen[k]; seen[k] = 1; return '<div class="wcard' + (isNew ? " new" : "") + '" style="--i:' + (i % 12) + '">' + esc(x.t) + '</div>'; }).join("") + '</div>';
  }

  /* ---------- landing ---------- */
  function landing() {
    chrome({ section: "Welcome", no: "01" });
    render('<div class="two">' +
      '<div>' + chapter("01", "Welcome to Sato Pharma") + '<div style="margin-top:22px">' + hl("Play live,", "on your phone.") + '</div>' + tick() +
      '<p class="lead">Scan the QR code on the big screen, or type the 6-digit code. Answer fast: the quickest correct answers win, and only number one takes the gift.</p></div>' +
      '<div class="plate stack" style="padding:26px"><p class="shead micro">Join a quiz</p><form id="joinForm" class="stack" novalidate>' +
      '<div class="field"><label for="code">Quiz code</label><input id="code" class="input code-input" inputmode="numeric" autocomplete="off" maxlength="7" placeholder="000 000"></div>' +
      '<div id="joinErr" class="error" hidden></div><button class="btn big block" type="submit">Continue</button></form>' +
      '<p class="muted" style="margin:0;font-size:14px;text-align:center">Running the session? <a href="?host" style="font-weight:700">Host a quiz</a></p></div></div>');
    var input = document.getElementById("code");
    input.addEventListener("input", function () { var v = input.value.replace(/\D/g, "").slice(0, 6); input.value = v.length > 3 ? v.slice(0, 3) + " " + v.slice(3) : v; });
    document.getElementById("joinForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var code = input.value.replace(/\D/g, ""), err = document.getElementById("joinErr");
      if (code.length !== 6) { err.hidden = false; err.textContent = "Enter the 6 digits shown on the big screen."; return; }
      location.search = "?join=" + code;
    });
  }

  /* ---------- host setup ---------- */
  /* open a live room for a quiz (this is when the QR code is published) */
  function openRoom(id, onFail) {
    var el = document.getElementById("hostName");
    var name = (el ? el.value.trim() : "") || store("satoquiz:hostname") || "Yomna";
    store("satoquiz:hostname", name);
    rpc("quiz_create_session", { p_quiz: id, p_host: name }).then(function (r) {
      store("satoquiz:host:" + r.code, r.host_key); location.search = "?host=" + r.code;
    }).catch(function (e) { if (onFail) onFail(e); });
  }

  function estMinutes(count, secs) { return Math.max(1, Math.round((secs + count * 15) / 60)); }

  function hostSetup() {
    chrome({ section: "Host a session", no: "00" });
    var hostName = store("satoquiz:hostname") || "Yomna", busy = false;
    render('<div class="stack" style="gap:22px">' +
      '<div class="row spread" style="align-items:flex-end;gap:24px">' + hl("Tap a quiz", "to open its room.", "sm") +
      '<div class="field" style="flex:0 1 320px;min-width:220px"><label for="hostName">Host name shown on screens</label><input id="hostName" class="input" maxlength="40" value="' + esc(hostName) + '"></div></div>' +
      '<div id="hostErr" class="error" hidden></div><div id="mine"></div><div id="pick">' + waiting("Loading the quizzes") + '</div>' +
      '<p class="muted" style="margin:0;font-size:14px">Preview as admin shows every question with its answer before you open the room. Players never see it. <a href="?admin">Quiz admin</a></p></div>');
    var mine = [];
    try { for (var mi = 0; mi < localStorage.length; mi++) { var mk = localStorage.key(mi); if (/^satoquiz:host:\d{6}$/.test(mk)) mine.push(mk.slice(-6)); } } catch (e0) {}
    if (mine.length) Promise.all(mine.slice(-15).map(function (c) { return rpc("quiz_peek", { p_code: c }).then(function (p) { return { c: c, p: p }; }).catch(function () { return null; }); })).then(function (rs) {
      var open = rs.filter(function (x) { return x && x.p.status !== "finished"; });
      if (!open.length) return;
      var lab = { lobby: "Waiting to start", question: "Live", reveal: "Live", standings: "Module break" };
      document.getElementById("mine").innerHTML = '<div class="plate stack resume" style="padding:20px 22px"><p class="shead micro">Continue a room you opened on this computer</p>' + open.map(function (x) {
        return '<a class="rsm" href="?host=' + x.c + '"><span class="code">' + fmtCode(x.c) + '</span><span class="t">' + esc(x.p.title) + '</span><span class="muted">' + (lab[x.p.status] || x.p.status) + ' · ' + x.p.players + ' player' + (x.p.players === 1 ? "" : "s") + '</span><span class="go">Continue</span></a>';
      }).join("") + '</div>';
    });
    rpc("quiz_catalog", {}).then(function (list) {
      if (!list.length) { document.getElementById("pick").innerHTML = '<p class="callout">No quizzes are visible yet. Add one in <a href="?admin">Quiz admin</a>.</p>'; return; }
      document.getElementById("pick").innerHTML = '<div class="picker stag">' + list.map(function (q, k) {
        return '<div class="qopt" role="group" aria-label="' + esc(q.title) + '" style="--i:' + k + '" data-id="' + esc(q.id) + '">' +
          '<span class="top"><span class="outline-n">' + pad(k + 1) + '</span><span class="micro" style="flex:1;padding-bottom:6px">' + esc(q.subtitle || "") + '</span></span>' +
          (q.thumb ? '<span class="thumb"><img alt="" src="' + esc(q.thumb) + '"></span>' : '<span class="thumb tthumb"><span class="outline-n">' + pad(q.sections || q.count) + '</span><span class="micro">' + (q.sections ? "Modules" : "Questions") + '</span></span>') +
          '<h3>' + esc(q.title) + '</h3><p>' + esc(q.blurb || "") + '</p>' +
          '<span class="meta-line">' + (q.count - (q.polls || 0)) + ' question' + (q.count - (q.polls || 0) === 1 ? "" : "s") + (q.polls ? ' · ' + q.polls + ' reflection' + (q.polls === 1 ? "" : "s") : "") + ' · about ' + estMinutes(q.count, q.secs) + ' min</span>' +
          '<button type="button" class="open-cta" data-act="open"><span class="lbl">Open the room</span><span class="arr" aria-hidden="true"></span></button>' +
          '<button type="button" class="prev-cta" data-act="preview">Preview as admin</button></div>';
      }).join("") + '</div>';
      app.querySelectorAll(".qopt").forEach(function (b) {
        b.addEventListener("click", function (ev) {
          var act = ev.target.closest("[data-act]");
          if (act && act.dataset.act === "preview") { store("satoquiz:hostname", document.getElementById("hostName").value.trim() || "Yomna"); location.search = "?preview=" + encodeURIComponent(b.dataset.id); return; }
          if (busy) return;
          busy = true; hit(b);
          b.classList.add("opening"); b.querySelector(".open-cta .lbl").textContent = "Opening the room";
          openRoom(b.dataset.id, function (e2) {
            busy = false; b.classList.remove("opening"); b.querySelector(".open-cta .lbl").textContent = "Open the room";
            var er = document.getElementById("hostErr"); er.hidden = false; er.textContent = e2.message;
          });
        });
      });
    }).catch(function (e2) { document.getElementById("pick").innerHTML = '<div class="error">' + esc(e2.message) + '</div>'; });
  }

  /* ---------- admin sign-in (shared by preview and the admin tab) ---------- */
  function adminToken(v) {
    try { if (v === undefined) return sessionStorage.getItem("satoquiz:admin"); if (v) sessionStorage.setItem("satoquiz:admin", v); else sessionStorage.removeItem("satoquiz:admin"); } catch (e) { return null; }
  }
  function adminLogin(title, onDone, err) {
    chrome({ section: "Admin", no: "" });
    render('<div class="phone stack">' + chapter("00", "Admin") + '<div>' + hl("Sign in", title + ".", "sm") + '</div>' + tick() +
      '<p class="lead">Enter the admin PIN. Answers and controls stay hidden from players.</p>' +
      '<form id="pinForm" class="stack" novalidate><div class="field"><label for="pin">Admin PIN</label><input id="pin" class="input code-input" type="password" inputmode="numeric" autocomplete="off" maxlength="6" placeholder="••••••"></div>' +
      (err ? '<div class="error">' + esc(err) + '</div>' : "") +
      '<button class="btn big block" type="submit">Sign in</button></form>' +
      '<p class="muted" style="margin:0;font-size:14px"><a href="?host">Back to the quizzes</a></p></div>');
    var f = document.getElementById("pinForm"), pin = document.getElementById("pin");
    pin.focus();
    f.addEventListener("submit", function (ev) {
      ev.preventDefault();
      f.querySelector("button").disabled = true;
      rpc("quiz_admin_login", { p_pin: pin.value.trim() }).then(function (r) { adminToken(r.token); onDone(); })
        .catch(function (e2) { adminLogin(title, onDone, e2.message); });
    });
  }
  function adminCall(fn, args) {
    return rpc(fn, Object.assign({ p_token: adminToken() }, args || {})).catch(function (e) {
      if (/session has ended/i.test(e.message)) { adminToken(null); }
      throw e;
    });
  }

  /* ---------- admin preview: every question with its answer, before the room opens ---------- */
  function preview(id) {
    var data = null, idx = 0, showReveal = false;
    function load() {
      if (!adminToken()) return adminLogin("to preview", load);
      adminCall("quiz_preview", { p_quiz: id }).then(function (d) { data = d; if (!d.questions.length) { toast("This quiz has no questions yet."); } draw(); })
        .catch(function (e) { if (!adminToken()) adminLogin("to preview", load, e.message); else { render('<div class="phone stack"><div class="error">' + esc(e.message) + '</div><a class="btn line" href="?host">Back</a></div>'); } });
    }
    function draw() {
      var total = data.questions.length;
      if (!total) { chrome({ section: "Admin preview", no: "" }); render('<div class="phone stack">' + hl("No questions", "yet.", "sm") + '<p class="lead">Add questions in Quiz admin first.</p><div class="row"><a class="btn" href="?admin">Quiz admin</a><a class="btn line" href="?host">Back</a></div></div>'); return; }
      var it = data.questions[idx], num = pad(idx + 1), poll = isPoll(it);
      chrome({ section: "Admin preview · " + num + " of " + pad(total), no: num, left: "Not visible to players" });
      var opts = poll ? '<p class="callout">' + (it.kind === "cloud" ? "Word cloud: players type one word and the big screen builds a live word cloud." : "Open answer: players type a sentence and the big screen shows every answer.") + ' Reflections are not scored.</p>' : '<div class="opts stag">' + it.opts.map(function (o, i) {
        var c = i === it.correct;
        return '<div class="opt' + (c ? " correct" : " dim") + '" style="--i:' + i + '"><span class="L outline-n">' + LETTERS[i] + '</span><span>' + (picOnly(it.opts) ? "" : esc(o)) + '</span><span>' + (c ? '<span class="micro">Correct</span>' : "") + '</span></div>';
      }).join("") + '</div>';
      if (it.section && (idx === 0 || data.questions[idx - 1].section !== it.section)) opts += '<p class="muted" style="margin:0;font-size:14px">First question of <b>' + esc(it.section) + '</b>.</p>';
      if (it.section && idx < total - 1 && data.questions[idx + 1].section !== it.section) opts += '<p class="muted" style="margin:0;font-size:14px">After this one the room pauses on the module leaderboard.</p>';
      var route = total <= 12 ? '<div class="route prev-route">' + data.questions.map(function (_, j) {
        return '<div class="' + (j < idx ? "done" : j === idx ? "here" : "") + '" data-j="' + j + '" role="button" tabindex="0" aria-label="Question ' + (j + 1) + '"><span class="n outline-n">' + pad(j + 1) + '</span><span class="dot"></span></div>';
      }).join("") + '</div>' : "";
      var img = showReveal && it.reveal ? it.reveal : it.img;
      render('<div class="stack" style="gap:20px">' +
        '<div class="row spread" style="gap:16px"><p class="kicker-light micro" style="margin:0"><i class="dia on"></i> Admin preview · ' + esc(data.title) + '</p>' +
        '<div class="row" style="gap:10px"><a class="btn line" href="?admin&quiz=' + encodeURIComponent(id) + '">Edit in admin</a><a class="btn line" href="?host">All quizzes</a><button class="btn big" id="goLive">Open the room and show the QR</button></div></div>' +
        route +
        '<div class="two"><div class="stack">' + figHtml(img, it, true) +
        (it.reveal ? '<div><button class="btn line" id="flip">' + (showReveal ? "Show the question picture" : "Show the answer picture") + '</button></div>' : "") + '</div>' +
        '<div class="stack"><div class="qhead"><span class="outline-n">' + num + '</span><span class="micro" style="padding-bottom:8px">' + esc(it.tag || "Question") + ' · of ' + total + '</span></div>' +
        '<h2 class="qtext">' + esc(it.q) + '</h2>' + opts +
        (poll ? (it.explanation ? '<p class="callout explain">' + esc(it.explanation) + '</p>' : "") : '<p class="callout explain"><b>' + esc(it.answer) + '.</b> ' + esc(it.explanation) + '</p>') +
        '<dl class="facts"><div><dt>Time limit</dt><dd>' + it.secs + ' seconds, after a 3-second countdown</dd></div></dl>' +
        '<div class="row" style="gap:10px"><button class="btn line" id="prevQ"' + (idx === 0 ? " disabled" : "") + '>Previous</button><button class="btn line" id="nextQ"' + (idx === total - 1 ? " disabled" : "") + '>Next question</button>' +
        (total > 12 ? '<span class="muted" style="font-size:14px">Use the arrow keys to move</span>' : "") + '</div></div></div></div>');
      document.getElementById("prevQ").addEventListener("click", function () { go(idx - 1); });
      document.getElementById("nextQ").addEventListener("click", function () { go(idx + 1); });
      var fl = document.getElementById("flip"); if (fl) fl.addEventListener("click", function () { showReveal = !showReveal; draw(); });
      app.querySelectorAll(".prev-route [data-j]").forEach(function (d) { d.addEventListener("click", function () { go(+d.dataset.j); }); });
      document.getElementById("goLive").addEventListener("click", function () {
        var b = this; b.disabled = true; b.textContent = "Opening the room";
        openRoom(id, function (e) { b.disabled = false; b.textContent = "Open the room and show the QR"; toast(e.message); });
      });
    }
    function go(j) { if (!data || j < 0 || j >= data.questions.length) return; idx = j; showReveal = false; draw(); window.scrollTo(0, 0); }
    document.addEventListener("keydown", function (ev) {
      if (!data || /input|textarea/i.test((ev.target.tagName || ""))) return;
      if (ev.key === "ArrowRight") go(idx + 1); else if (ev.key === "ArrowLeft") go(idx - 1);
    });
    load();
  }

  /* ---------- quiz admin: quizzes, questions, time limits, pictures, rooms, PIN ---------- */
  function admin() {
    var D = null, tab = params.get("tab") || "quizzes", selId = params.get("quiz") || null, ed = null, confirmKey = null, first = true;
    var resCode = (params.get("room") || "").replace(/\D/g, "") || null, R = null;
    var X = null, xSel = tab === "tests" ? selId : null, xEdit = false, xTimer = null, xRank = false, xAnim = false;
    if (resCode) tab = "rooms";
    function load(after) {
      if (!adminToken()) return adminLogin("to quiz admin", function () { load(after); });
      adminCall("quiz_admin_data").then(function (d) {
        D = d;
        if (selId !== "__new" && (!selId || !d.quizzes.some(function (z) { return z.id === selId; }))) selId = d.quizzes[0] ? d.quizzes[0].id : "__new";
        if (resCode && (!R || R.code !== resCode)) loadResults();
        if (tab === "tests" && !X) setTimeout(loadExam, 0);
        if (after) after();
        draw();
      }).catch(function (e) { if (!adminToken()) adminLogin("to quiz admin", function () { load(after); }, e.message); else toast(e.message); });
    }
    function cur() { return D.quizzes.filter(function (z) { return z.id === selId; })[0] || null; }
    function ago(t) {
      var m = Math.round((Date.now() - new Date(t).getTime()) / 60000);
      return m < 1 ? "just now" : m < 60 ? m + " min ago" : m < 1440 ? Math.round(m / 60) + " h ago" : Math.round(m / 1440) + " d ago";
    }
    function field(id, label, value, opts) {
      opts = opts || {};
      var inner = opts.area ? '<textarea id="' + id + '" class="input area" rows="' + (opts.rows || 3) + '" maxlength="' + (opts.max || 600) + '">' + esc(value || "") + '</textarea>'
        : '<input id="' + id + '" class="input" ' + (opts.type ? 'type="' + opts.type + '" ' : "") + (opts.list ? 'list="' + opts.list + '" ' : "") + (opts.min != null ? 'min="' + opts.min + '" max="' + opts.max + '" ' : 'maxlength="' + (opts.max || 120) + '" ') + 'value="' + esc(value == null ? "" : value) + '"' + (opts.ph ? ' placeholder="' + esc(opts.ph) + '"' : "") + '>';
      return '<div class="field' + (opts.cls ? " " + opts.cls : "") + '"><label for="' + id + '">' + esc(label) + '</label>' + inner + (opts.help ? '<span class="help">' + esc(opts.help) + '</span>' : "") + '</div>';
    }

    /* ----- quizzes tab ----- */
    function quizzesHtml() {
      var z = selId === "__new" ? null : cur();
      var list = '<aside class="qlist"><p class="shead micro">Quizzes</p>' + D.quizzes.map(function (q) {
        return '<button type="button" class="qitem' + (q.id === selId ? " on" : "") + '" data-sel="' + esc(q.id) + '"><span class="t">' + esc(q.title) + '</span><span class="m">' + (q.mode === "exam" ? "Self-paced test · " : "") + q.questions.length + ' question' + (q.questions.length === 1 ? "" : "s") + ' · ' + (q.active ? (q.mode === "exam" ? "Open" : "Visible") : "Hidden") + '</span></button>';
      }).join("") + '<button type="button" class="btn line block" data-act="new-quiz">Add a quiz</button></aside>';
      var right = selId === "__new" ? quizForm({ id: "", title: "", subtitle: "", blurb: "", sort: "", active: false, questions: [] }, true) : z ? quizForm(z, false) + questionsHtml(z) : '<p class="callout">Choose a quiz, or add one.</p>';
      return '<div class="admin-grid">' + list + '<section class="qedit stack">' + right + '</section></div>';
    }
    function quizForm(z, isNew) {
      var del = confirmKey === "quiz:" + z.id
        ? '<span class="confirm">Delete this quiz and hide it everywhere? <button class="btn danger" data-act="del-quiz-yes">Delete quiz</button><button class="btn line" data-act="cancel-confirm">Keep it</button></span>'
        : (isNew ? "" : '<button class="btn line danger-line" data-act="del-quiz">Delete quiz</button>');
      return '<div class="plate stack" style="padding:22px"><p class="shead micro">' + (isNew ? "New quiz" : "Quiz details") + '</p>' +
        '<div class="frow">' + field("zTitle", "Title", z.title, { max: 60, ph: "e.g. Product Knowledge" }) + field("zSub", "Short line under the number", z.subtitle, { max: 60, ph: "e.g. 10 picture questions" }) + '</div>' +
        field("zBlurb", "Description shown to players", z.blurb, { area: true, rows: 2, max: 240 }) +
        '<div class="field"><label>Quiz type</label><div class="row" style="gap:8px">' + [["live", "Live room · host on the big screen, timed"], ["exam", "Self-paced test · HR ID, no timer, own order"]].map(function (k) {
          return '<button class="chipbtn wide' + ((z.mode || "live") === k[0] ? " on" : "") + '" data-act="zmode" data-m="' + k[0] + '">' + k[1] + '</button>'; }).join("") + '</div>' +
          ((z.mode || "live") === "exam" ? '<span class="help">Only the HR IDs on its list can sign in. Each person gets the questions and the answers in their own shuffled order. Time limits are ignored.</span>' : "") + '</div>' +
        '<div class="frow">' + field("zSort", "Order in the list", z.sort, { type: "number", min: 0, max: 9999, help: "Lower numbers come first" }) +
        '<label class="check"><input type="checkbox" id="zActive"' + (z.active ? " checked" : "") + '> <span>' + ((z.mode || "live") === "exam" ? "Open: people on the list can sign in" : "Visible in the host picker") + '</span></label></div>' +
        '<div class="row spread" style="gap:10px"><div class="row" style="gap:10px"><button class="btn" data-act="save-quiz">' + (isNew ? "Create quiz" : "Save quiz") + '</button>' +
        (isNew ? '<button class="btn line" data-act="cancel-new">Cancel</button>' : z.mode === "exam" ? '<button class="btn line" data-act="to-tests">People, QR and results</button>' : '<a class="btn line" href="?preview=' + encodeURIComponent(z.id) + '">Preview</a>') + '</div>' + del + '</div></div>';
    }
    function questionsHtml(z) {
      var tags = {}, secMap = {}; D.quizzes.forEach(function (q) { q.questions.forEach(function (x) { if (x.tag) tags[x.tag] = 1; if (x.section && q.id === z.id) secMap[x.section] = 1; }); });
      var dl = '<datalist id="tagList">' + Object.keys(tags).sort().map(function (t) { return '<option value="' + esc(t) + '">'; }).join("") + '</datalist>' +
        '<datalist id="secList">' + Object.keys(secMap).map(function (t) { return '<option value="' + esc(t) + '">'; }).join("") + '</datalist>';
      var total = z.questions.reduce(function (s, x) { return s + x.secs; }, 0);
      var head = '<div class="row spread"><p class="shead micro" style="flex:1">Questions · ' + z.questions.length + ' · about ' + estMinutes(z.questions.length, total) + ' min</p>' +
        (ed ? "" : '<button class="btn" data-act="new-q">Add a question</button>') + '</div>';
      var editor = ed && ed.isNew ? editorHtml(ed, z) : "";
      var rows = z.questions.map(function (x, i) {
        if (ed && !ed.isNew && ed.id === x.id) return editorHtml(ed, z);
        var conf = confirmKey === "q:" + x.id, sec = x.section && (i === 0 || z.questions[i - 1].section !== x.section) ? '<div class="qsec"><i class="dia on"></i>' + esc(x.section) + '</div>' : "";
        var kindLbl = x.kind === "cloud" ? "Word cloud · not scored" : x.kind === "text" ? "Open text · not scored" : "Answer " + esc(x.answer);
        return sec + '<div class="qrow" data-qid="' + x.id + '"><span class="n outline-n">' + pad(i + 1) + '</span>' +
          '<span class="th">' + (x.img ? '<img alt="" src="' + esc(x.img) + '">' : "") + '</span>' +
          '<span class="body"><b>' + esc(x.q) + '</b><span class="meta">' + kindLbl + ' · ' + x.secs + ' s' + (x.tag ? " · " + esc(x.tag) : "") + (x.reveal ? " · answer picture" : "") + '</span></span>' +
          (conf ? '<span class="acts confirm">Delete? <button class="btn danger sm" data-act="del-q-yes" data-id="' + x.id + '">Delete</button><button class="btn line sm" data-act="cancel-confirm">Keep</button></span>'
            : '<span class="acts"><button class="ibtn" data-act="up" data-i="' + i + '" aria-label="Move up"' + (i === 0 ? " disabled" : "") + '>&#8593;</button><button class="ibtn" data-act="down" data-i="' + i + '" aria-label="Move down"' + (i === z.questions.length - 1 ? " disabled" : "") + '>&#8595;</button>' +
              '<button class="btn line sm" data-act="edit-q" data-id="' + x.id + '">Edit</button><button class="btn line sm danger-line" data-act="del-q" data-id="' + x.id + '">Delete</button></span>') + '</div>';
      }).join("");
      return '<div class="stack" style="gap:12px">' + dl + head + editor + (rows ? '<div class="qrows">' + rows + '</div>' : (ed ? "" : '<p class="callout">No questions yet. Add the first one.</p>')) + '</div>';
    }
    function editorHtml(x, z) {
      var n = x.opts.length, kind = x.kind || "choice", poll = kind !== "choice";
      var opts = x.opts.map(function (o, i) {
        return '<div class="optrow"><label class="radio"><input type="radio" name="fCorrect" value="' + i + '"' + (x.correct === i ? " checked" : "") + '><span class="L outline-n">' + LETTERS[i] + '</span></label>' +
          '<input class="input fopt" data-i="' + i + '" maxlength="300" value="' + esc(o) + '" placeholder="Option ' + LETTERS[i] + '">' +
          (n > 2 ? '<button class="ibtn" data-act="rm-opt" data-i="' + i + '" aria-label="Remove option ' + LETTERS[i] + '">&#215;</button>' : '<span></span>') + '</div>';
      }).join("");
      function pic(key, label, url, opt) {
        return '<div class="picbox"><span class="micro">' + label + (opt ? " · optional" : "") + '</span>' +
          '<div class="pv">' + (url ? '<img alt="" src="' + esc(url) + '">' : '<span class="muted">No picture</span>') + '</div>' +
          '<input class="input" id="f' + key + '" placeholder="Paste a picture link, or upload" value="' + esc(url || "") + '">' +
          '<div class="row" style="gap:8px"><label class="btn line sm upl"><input type="file" accept="image/png,image/jpeg,image/webp,image/gif" data-up="' + key + '" hidden>Upload a picture</label>' +
          (url ? '<button class="btn line sm" data-act="clear-pic" data-k="' + key + '">Remove</button>' : "") + '</div></div>';
      }
      return '<div class="qeditor plate stack" id="qEditor"><p class="shead micro">' + (x.isNew ? "New question" : "Edit question " + pad(z.questions.findIndex(function (q) { return q.id === x.id; }) + 1)) + '</p>' +
        '<div class="field"><label>Question type</label><div class="row" style="gap:8px">' + [["choice", "Multiple choice"], ["cloud", "Word cloud"], ["text", "Open text"]].map(function (k) {
          return '<button class="chipbtn wide' + (kind === k[0] ? " on" : "") + '" data-act="kind" data-k="' + k[0] + '">' + k[1] + '</button>'; }).join("") + '</div>' +
          (poll ? '<span class="help">A reflection poll: players type their answer and the big screen shows them live. Not scored.</span>' : "") + '</div>' +
        field("fQ", "Question", x.q, { area: true, rows: 2, max: 300 }) +
        field("fSection", "Module or section · optional", x.section, { list: "secList", max: 80, ph: "e.g. Module 2 – Spoken communication", help: "The room pauses on a module leaderboard when the section changes" }) +
        '<div class="frow">' + field("fTag", "Label or level", x.tag, { list: "tagList", max: 40, ph: "e.g. Easy, Logic" }) +
        '<div class="field"><label for="fSecs">Time limit (seconds)</label><div class="row" style="gap:8px"><input id="fSecs" class="input" type="number" min="5" max="300" value="' + x.secs + '" style="max-width:110px">' +
        [10, 15, 20, 30, 45, 60].map(function (s) { return '<button class="chipbtn' + (x.secs === s ? " on" : "") + '" data-act="secs" data-s="' + s + '">' + s + '</button>'; }).join("") + '</div></div></div>' +
        (poll ? "" : '<div class="field"><label>Answer options · tick the correct one</label><div class="opts-ed">' + opts + '</div>' +
        (n < 4 ? '<div><button class="btn line sm" data-act="add-opt">Add an option</button></div>' : "") + '</div>') +
        field("fExp", poll ? "Note shown after the poll · optional" : "Explanation or debrief shown after the answer", x.explanation, { area: true, rows: 3, max: 600 }) +
        '<div class="frow">' + pic("Img", "Question picture", x.img, false) + pic("Rev", "Answer picture", x.reveal, true) + '</div>' +
        '<div id="fErr" class="error" hidden></div>' +
        '<div class="row" style="gap:10px"><button class="btn" data-act="save-q">Save question</button><button class="btn line" data-act="cancel-q">Cancel</button></div></div>';
    }
    function collect() {
      if (!ed || !document.getElementById("qEditor")) return;
      ed.q = document.getElementById("fQ").value; ed.tag = document.getElementById("fTag").value;
      ed.secs = parseInt(document.getElementById("fSecs").value, 10) || 20;
      ed.explanation = document.getElementById("fExp").value;
      ed.img = document.getElementById("fImg").value.trim(); ed.reveal = document.getElementById("fRev").value.trim();
      ed.section = document.getElementById("fSection").value;
      if ((ed.kind || "choice") !== "choice") return;
      ed.opts = [].map.call(app.querySelectorAll(".fopt"), function (el) { return el.value; });
      var c = app.querySelector('input[name="fCorrect"]:checked'); ed.correct = c ? +c.value : -1;
    }

    /* ----- rooms tab ----- */
    function roomsHtml() {
      if (!D.rooms.length) return '<p class="callout">No rooms yet. Rooms appear here when a host opens a quiz.</p>';
      if (resCode) return resultsHtml();
      return '<div class="row spread"><p class="shead micro" style="flex:1">Rooms · newest first · press Results to see the full ranking</p><button class="btn line sm" data-act="refresh">Refresh</button></div>' +
        '<div class="rtable"><div class="rhead"><span>Code</span><span>Quiz</span><span>Host</span><span>Status</span><span>Progress</span><span>Players</span><span>Opened</span><span></span></div>' +
        D.rooms.map(function (r) {
          var conf = confirmKey === "room:" + r.code;
          var st = { lobby: "Waiting", question: "Live", reveal: "Live", standings: "Break", finished: "Finished" }[r.status] || r.status;
          return '<div class="rrow"><span class="code">' + fmtCode(r.code) + '</span><span>' + esc(r.quiz_title || r.quiz_id) + '</span><span>' + esc(r.host) + '</span>' +
            '<span><span class="st st-' + r.status + '">' + st + '</span></span><span>' + (r.q_index < 0 ? "Not started" : Math.min(r.q_index + 1, r.total) + " of " + r.total) + '</span>' +
            '<span>' + r.players + '</span><span class="muted">' + ago(r.created_at) + '</span>' +
            (conf ? '<span class="acts confirm">Delete? <button class="btn danger sm" data-act="room-del-yes" data-code="' + r.code + '">Delete</button><button class="btn line sm" data-act="cancel-confirm">Keep</button></span>'
              : '<span class="acts">' + (r.q_index >= 0 ? '<button class="btn sm" data-act="room-res" data-code="' + r.code + '">Results</button>' : "") + (r.status !== "finished" ? '<button class="btn line sm" data-act="room-end" data-code="' + r.code + '">End</button>' : "") + '<button class="btn line sm danger-line" data-act="room-del" data-code="' + r.code + '">Delete</button></span>') + '</div>';
        }).join("") + '</div>';
    }

    /* ----- room results: full ranking, modules, questions, reflections ----- */
    function resultsHtml() {
      if (!R || R.code !== resCode) return '<div class="row"><button class="btn line sm" data-act="res-back">All rooms</button></div>' + waiting("Loading the results");
      var ST = R.scored_total || R.total, st = { lobby: "Waiting", question: "Live", reveal: "Live", standings: "Module break", finished: "Finished" }[R.status] || R.status;
      var d = new Date(R.created_at), when = d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" }) + " · " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
      var secs2 = R.sections || [], rk = R.ranking || [], w = rk[0];
      var head = '<div class="row spread" style="gap:14px"><div class="row" style="gap:10px"><button class="btn line sm" data-act="res-back">All rooms</button><button class="btn line sm" data-act="res-reload">Refresh</button></div>' +
        '<div class="row" style="gap:10px"><button class="btn sm" data-act="res-csv">Download ranking (CSV)</button>' + (R.questions.some(function (q) { return q.responses && q.responses.length; }) ? '<button class="btn line sm" data-act="res-csv-ref">Download reflections (CSV)</button>' : "") + '</div></div>';
      var hero = '<div class="res-hero"><div><p class="kicker micro"><b></b>Room ' + fmtCode(R.code) + ' · ' + esc(st) + '</p>' + hl(R.quiz_title || "Quiz", "results.", "sm") +
        '<p class="muted" style="margin:6px 0 0">' + esc(when) + ' · hosted by ' + esc(R.host) + ' · ' + rk.length + ' player' + (rk.length === 1 ? "" : "s") + ' · ' + ST + ' scored questions' + (R.status !== "finished" ? ' · reached question ' + Math.min(R.q_index + 1, R.total) + ' of ' + R.total : "") + '</p></div>' +
        (w && w.correct ? '<div class="mstar"><i class="dia on"></i><span><span class="micro">Number one</span><b>' + esc(w.name) + '</b><span class="muted">' + w.correct + ' of ' + ST + ' correct · ' + secs(w.ms) + '</span></span></div>' : "") + '</div>';
      var cols = secs2.map(function (s, k) { var p = sectionParts(s.name); return '<span class="mc" title="' + esc(s.name) + '">' + esc(p.num ? "M" + p.n : "S" + (k + 1)) + '</span>'; }).join("");
      var gt = 'grid-template-columns: 50px minmax(160px, 1fr) 90px 90px' + (secs2.length ? " repeat(" + secs2.length + ", 46px)" : "") + ';';
      var table = '<div class="res-table"><div class="res-row res-head" style="' + gt + '"><span>Rank</span><span>Player</span><span>Correct</span><span>Time</span>' + cols + '</div>' +
        rk.map(function (r) {
          return '<div class="res-row' + (r.rank <= 3 ? " top" : "") + '" style="' + gt + '"><span class="pos outline-n">' + r.rank + '</span><span class="nm">' + esc(r.name) + (r.answered < ST && R.status === "finished" ? '<small>' + r.answered + ' answered</small>' : "") + '</span><span class="sc">' + r.correct + '/' + ST + '</span><span class="tm">' + secs(r.ms) + '</span>' +
            (r.by_section || []).map(function (n, k) { return '<span class="mc">' + n + '<small>/' + secs2[k].total + '</small></span>'; }).join("") + '</div>';
        }).join("") + '</div>' +
        (secs2.length ? '<p class="muted" style="margin:8px 0 0;font-size:13px">' + secs2.map(function (s, k) { var p = sectionParts(s.name); return (p.num ? "M" + p.n : "S" + (k + 1)) + " = " + esc(p.title); }).join(" · ") + '</p>' : "");
      var qs = R.questions.map(function (q) {
        var poll = q.kind !== "choice", pct = q.answers ? Math.round(100 * q.right / q.answers) : 0;
        var body = !q.asked ? '<span class="muted">Not reached</span>' : poll
          ? (q.responses && q.responses.length ? '<div class="res-resp">' + q.responses.map(function (x) { return '<span><b>' + esc(x.name) + '</b> ' + esc(x.t) + '</span>'; }).join("") + '</div>' : '<span class="muted">No answers</span>')
          : '<span class="res-bar"><i style="width:' + pct + '%"></i></span><span class="muted">' + q.right + ' of ' + q.answers + ' right (' + pct + '%)' + (q.fastest ? ' · fastest ' + esc(q.fastest.name) + ' ' + secs(q.fastest.ms) : "") + '</span>';
        return '<div class="res-q' + (poll ? " poll" : "") + '"><span class="n outline-n">' + pad(q.n) + '</span><div class="stack" style="gap:6px"><b>' + esc(q.q) + '</b>' +
          '<span class="micro" style="color:var(--blue)">' + esc(poll ? (q.kind === "cloud" ? "Word cloud · reflection" : "Open text · reflection") : "Answer " + q.answer) + '</span>' + body + '</div></div>';
      });
      var grouped = "", lastSec = null;
      R.questions.forEach(function (q, k) { if (q.section && q.section !== lastSec) { grouped += '<div class="qsec"><i class="dia on"></i>' + esc(q.section) + '</div>'; lastSec = q.section; } grouped += qs[k]; });
      return '<div class="stack" style="gap:22px">' + head + hero +
        '<div class="stack" style="gap:10px"><p class="shead micro">Full ranking · most correct first, then fastest total time on correct answers</p>' + (rk.length ? table : '<p class="callout">Nobody joined this room.</p>') + '</div>' +
        '<div class="stack" style="gap:10px"><p class="shead micro">Question by question</p>' + grouped + '</div></div>';
    }
    function loadResults() {
      adminCall("quiz_admin_results", { p_code: resCode }).then(function (r) { R = r; draw(); }).catch(function (e) { toast(e.message); resCode = null; draw(); });
    }
    function csvDownload(name, rows) {
      var csv = "﻿" + rows.map(function (r) { return r.map(function (v) { v = String(v == null ? "" : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(","); }).join("\r\n");
      var url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })), l = document.createElement("a");
      l.href = url; l.download = name; document.body.appendChild(l); l.click(); l.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    }
    function csvName(kind) { return (R.quiz_title || "quiz").replace(/[^\w]+/g, "-").replace(/^-|-$/g, "") + "_" + R.code + "_" + kind + ".csv"; }

    /* ----- Excel export of a self-paced test: every answer, and where the class is strong or has a gap ----- */
    var EXCELJS = "https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js";
    function needExcel() {
      if (window.ExcelJS) return Promise.resolve(window.ExcelJS);
      return new Promise(function (ok, no) {
        var s = document.createElement("script"); s.src = EXCELJS;
        s.onload = function () { window.ExcelJS ? ok(window.ExcelJS) : no(new Error("The Excel library did not load. Try again.")); };
        s.onerror = function () { no(new Error("The Excel library did not load. Check the connection and try again.")); };
        document.head.appendChild(s);
      });
    }
    function examWorkbook(XL, E) {
      var NAVY = "FF0A1B2E", BLUE = "FF0A527D", HAIR = "FFB9C7D4", MUTED = "FF5A6B7C";
      var GOOD = { fill: "FFE3F1E6", font: "FF1E6B34" }, BAD = { fill: "FFF8E1E1", font: "FF9B1C1C" }, AMBER = { fill: "FFFDF1DC", font: "FF8A5A00" }, ALLBAD = { fill: "FF9B1C1C", font: "FFFFFFFF" };
      var fill = function (c, argb) { c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: argb } }; };
      var thin = { style: "thin", color: { argb: HAIR } };
      var head = function (row) { row.eachCell(function (c) { fill(c, NAVY); c.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10 }; c.alignment = { vertical: "middle", horizontal: "center", wrapText: true }; }); row.height = 30; };
      var grid = function (c) { c.border = { top: thin, left: thin, bottom: thin, right: thin }; };
      var Q = E.questions, byId = {}; Q.forEach(function (q) { byId[q.id] = q; });
      var secs = []; Q.forEach(function (q) { var s = q.section || "Questions"; if (secs.indexOf(s) < 0) secs.push(s); });
      var started = E.people.filter(function (p) { return p.started_at; }), sent = started.filter(function (p) { return p.submitted_at; });
      var pool = sent.length ? sent : started, poolNote = sent.length ? "From the " + sent.length + " sent test" + (sent.length === 1 ? "" : "s") + "." : "Nobody has sent yet: from the answers given so far by " + started.length + " people.";
      var wb = new XL.Workbook(); wb.creator = "Sato Pharma · Talent Acquisition"; wb.created = new Date();
      var stamp = "Exported " + cairo(new Date().toISOString()) + " Cairo";

      /* tab 1: every answer */
      var ws = wb.addWorksheet("Answers", { views: [{ state: "frozen", xSplit: 3, ySplit: 5 }] });
      var fixed = ["Place", "Name", "HR ID", "Status", "Score", "%", "Time (min)"].concat(secs);
      ws.getCell("A1").value = E.title + " · every answer"; ws.getCell("A1").font = { bold: true, size: 16, color: { argb: BLUE } };
      ws.getCell("A2").value = stamp + " · each cell is the letter they picked · green right, red wrong, blank not answered"; ws.getCell("A2").font = { size: 10, color: { argb: MUTED } };
      var h = ws.getRow(4); h.values = fixed.concat(Q.map(function (q) { return "Q" + pad(q.n); })); head(h);
      Q.forEach(function (q, i) { h.getCell(fixed.length + 1 + i).note = { texts: [{ text: (q.section ? q.section + " · " : "") + q.q }] }; });
      var key = ws.getRow(5); key.values = ["", "Right answer"].concat(new Array(fixed.length - 2).fill("")).concat(Q.map(function (q) { return LETTERS[q.correct]; }));
      key.eachCell({ includeEmpty: true }, function (c, k) { if (k > 7 && k <= fixed.length) return; fill(c, "FFEAF1F7"); c.font = { bold: true, color: { argb: BLUE } }; c.alignment = { horizontal: k > 2 ? "center" : "left" }; grid(c); });
      E.people.forEach(function (p) {
        var got = {}; (p.answers || []).forEach(function (a) { got[a.q] = a; });
        var bySec = secs.map(function (s) { var qs = Q.filter(function (q) { return (q.section || "Questions") === s; }); return qs.filter(function (q) { return got[q.id] && got[q.id].ok; }).length + "/" + qs.length; });
        var status = p.submitted_at ? "Sent" : p.started_at ? "Answering · " + (p.answers || []).length + " of " + Q.length : "Not started";
        var r = ws.addRow([p.place || "", p.name, p.hr_id, status, p.submitted_at ? p.score : "", p.submitted_at ? p.score / Q.length : "", p.secs != null ? Math.round(p.secs / 6) / 10 : ""].concat(p.started_at ? bySec : secs.map(function () { return ""; }))
          .concat(Q.map(function (q) { var a = got[q.id]; return a && a.c != null ? LETTERS[a.c] : ""; })));
        r.eachCell({ includeEmpty: true }, function (c, k) { grid(c); if (k > 3) c.alignment = { horizontal: "center" }; });
        r.getCell(6).numFmt = "0%";
        Q.forEach(function (q, i) { var a = got[q.id], c = r.getCell(fixed.length + 1 + i); if (!a) return; var t = a.ok ? GOOD : BAD; fill(c, t.fill); c.font = { bold: true, color: { argb: t.font } }; });
      });
      ws.getColumn(1).width = 7; ws.getColumn(2).width = 24; ws.getColumn(3).width = 11; ws.getColumn(4).width = 18; ws.getColumn(5).width = 7; ws.getColumn(6).width = 7; ws.getColumn(7).width = 10;
      secs.forEach(function (s, i) { ws.getColumn(8 + i).width = Math.max(12, s.length + 2); });
      Q.forEach(function (q, i) { ws.getColumn(fixed.length + 1 + i).width = 5.5; });

      /* tab 2: analysis */
      var stat = Q.map(function (q) {
        var picks = q.opts.map(function () { return 0; }), right = 0, n = 0;
        pool.forEach(function (p) { (p.answers || []).forEach(function (a) { if (a.q !== q.id || a.c == null) return; n++; if (a.ok) right++; if (picks[a.c] != null) picks[a.c]++; }); });
        var wrongIdx = -1; picks.forEach(function (v, i) { if (i !== q.correct && v > 0 && (wrongIdx < 0 || v > picks[wrongIdx])) wrongIdx = i; });
        var pct = n ? right / n : null;
        var verdict = !n ? "No answers yet" : pct === 1 ? "Everyone right" : pct === 0 ? "Everyone wrong" : pct < 0.5 ? "Gap" : pct < 0.75 ? "Watch" : "Strong";
        return { q: q, n: n, right: right, pct: pct, picks: picks, wrongIdx: wrongIdx, verdict: verdict };
      });
      var wa = wb.addWorksheet("Analysis");
      wa.getCell("A1").value = E.title + " · analysis"; wa.getCell("A1").font = { bold: true, size: 16, color: { argb: BLUE } };
      wa.getCell("A2").value = stamp + " · " + poolNote; wa.getCell("A2").font = { size: 10, color: { argb: MUTED } };
      var scores = sent.map(function (p) { return p.score / Q.length; });
      var avg = scores.length ? scores.reduce(function (s, v) { return s + v; }, 0) / scores.length : null;
      var count = function (v) { return stat.filter(function (s) { return s.verdict === v; }).length; };
      var facts = [["People on the list", E.people.length], ["Sent", sent.length], ["Still answering", started.length - sent.length], ["Average score", avg], ["Highest", scores.length ? Math.max.apply(null, scores) : null], ["Lowest", scores.length ? Math.min.apply(null, scores) : null],
        ["Everyone right", count("Everyone right")], ["Everyone wrong", count("Everyone wrong")], ["Gaps · under half right", count("Gap")], ["Watch · half to three quarters right", count("Watch")], ["Strong · three quarters or more right", count("Strong")]];
      var y = 4;
      wa.getCell("A" + y).value = "THE CLASS"; wa.getCell("A" + y).font = { bold: true, size: 10, color: { argb: BLUE } }; y++;
      facts.forEach(function (f, i) {
        wa.mergeCells("A" + y + ":C" + y); var a = wa.getCell("A" + y), b = wa.getCell("D" + y); a.value = f[0]; b.value = f[1] == null ? "" : f[1]; grid(a); grid(b);
        a.font = { color: { argb: MUTED } }; b.font = { bold: true }; b.alignment = { horizontal: "center" }; if (i >= 3 && i <= 5) b.numFmt = "0%";
        var t = f[0] === "Everyone right" ? GOOD : f[0] === "Everyone wrong" ? BAD : f[0].indexOf("Gaps") === 0 ? BAD : f[0].indexOf("Watch") === 0 ? AMBER : null;
        if (t && f[1]) { fill(b, t.fill); b.font = { bold: true, color: { argb: t.font } }; }
        y++;
      });
      y++;
      wa.getCell("A" + y).value = "BY SECTION"; wa.getCell("A" + y).font = { bold: true, size: 10, color: { argb: BLUE } }; y++;
      var sh = wa.getRow(y); sh.values = ["Section", "", "", "Questions", "Right overall", "Gaps", "Everyone wrong"]; head(sh); wa.mergeCells("A" + y + ":C" + y); y++;
      secs.forEach(function (s) {
        var ss = stat.filter(function (x) { return (x.q.section || "Questions") === s; }), n = ss.reduce(function (t, x) { return t + x.n; }, 0), rt = ss.reduce(function (t, x) { return t + x.right; }, 0);
        var r = wa.getRow(y); r.values = [s, "", "", ss.length, n ? rt / n : "", ss.filter(function (x) { return x.verdict === "Gap"; }).length, ss.filter(function (x) { return x.verdict === "Everyone wrong"; }).length];
        wa.mergeCells("A" + y + ":C" + y); r.eachCell({ includeEmpty: true }, function (c, k) { grid(c); if (k > 3) c.alignment = { horizontal: "center" }; }); r.getCell(5).numFmt = "0%"; y++;
      });
      y++;
      wa.getCell("A" + y).value = "QUESTION BY QUESTION · the biggest gap first"; wa.getCell("A" + y).font = { bold: true, size: 10, color: { argb: BLUE } }; y++;
      var cols = ["Q", "Section", "Question", "Right answer", "Answered", "Right", "Wrong", "% right", "Verdict", "Most picked wrong answer", "Picked by"].concat(LETTERS.slice(0, Math.max.apply(null, Q.map(function (q) { return q.opts.length; }))).split("").map(function (l) { return "Picked " + l; }));
      var th = wa.getRow(y); th.values = cols; head(th); var top = y; y++;
      stat.slice().sort(function (a, b) { return (a.pct == null ? 2 : a.pct) - (b.pct == null ? 2 : b.pct) || a.q.n - b.q.n; }).forEach(function (s) {
        var q = s.q, r = wa.getRow(y);
        r.values = ["Q" + pad(q.n), q.section || "", q.q, LETTERS[q.correct] + " · " + q.opts[q.correct], s.n, s.right, s.n - s.right, s.pct == null ? "" : s.pct, s.verdict,
          s.wrongIdx >= 0 ? LETTERS[s.wrongIdx] + " · " + q.opts[s.wrongIdx] : "", s.wrongIdx >= 0 ? s.picks[s.wrongIdx] : ""].concat(s.picks);
        r.eachCell({ includeEmpty: true }, function (c, k) { grid(c); c.alignment = { vertical: "top", wrapText: k === 3 || k === 4 || k === 10, horizontal: k === 3 || k === 4 || k === 10 ? "left" : "center" }; });
        r.getCell(8).numFmt = "0%";
        var t = s.verdict === "Everyone right" ? GOOD : s.verdict === "Everyone wrong" ? ALLBAD : s.verdict === "Gap" ? BAD : s.verdict === "Watch" ? AMBER : null;
        if (t) { fill(r.getCell(9), t.fill); r.getCell(9).font = { bold: true, color: { argb: t.font } }; }
        var rc = r.getCell(12 + q.correct); fill(rc, GOOD.fill); rc.font = { bold: true, color: { argb: GOOD.font } };
        y++;
      });
      wa.views = [{ state: "frozen", ySplit: top }];
      [7, 16, 58, 34, 10, 8, 8, 9, 15, 34, 10].forEach(function (w, i) { wa.getColumn(i + 1).width = w; });
      for (var k = 12; k <= cols.length; k++) wa.getColumn(k).width = 9;
      return wb;
    }
    function examXlsx(btn) {
      busy(btn, true); var was = btn.textContent; btn.textContent = "Preparing the Excel";
      Promise.all([adminCall("quiz_admin_exam_export", { p_quiz: xSel }), needExcel()]).then(function (res) {
        return examWorkbook(res[1], res[0]).xlsx.writeBuffer().then(function (buf) {
          var url = URL.createObjectURL(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })), l = document.createElement("a");
          l.href = url; l.download = (res[0].title || "test").replace(/[^\w]+/g, "-").replace(/^-|-$/g, "") + "_answers-and-analysis.xlsx";
          document.body.appendChild(l); l.click(); l.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
          toast("Excel downloaded: Answers and Analysis");
        });
      }).catch(function (e) { toast(e.message); }).then(function () { btn.textContent = was; busy(btn, false); });
    }

    /* ----- tests tab: self-paced tests, their people, the QR and the results ----- */
    function cairo(t) { return t ? new Date(t).toLocaleString("en-GB", { timeZone: "Africa/Cairo", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : ""; }
    function exams() { return D.quizzes.filter(function (z) { return z.mode === "exam"; }); }
    function loadExam() {
      clearTimeout(xTimer);
      if (tab !== "tests" || !xSel) return;
      adminCall("quiz_admin_exam", { p_quiz: xSel }).then(function (x) { if (x.id !== xSel) return; X = x; if (!xEdit && !confirmKey) draw(); })
        .catch(function (e) { toast(e.message); })
        .then(function () { clearTimeout(xTimer); if (tab === "tests" && xSel) xTimer = setTimeout(loadExam, 6000); });
    }
    /* the final ranking of a self-paced test: most right first, then the quicker finish. Big-screen ready. */
    function rankingPage() {
      var sent = X.people.filter(function (p) { return p.place; }), w = sent[0], waitingN = X.people.length - sent.length;
      chrome({ section: "Final ranking ◆", no: "", left: sent.length + " of " + X.people.length + " sent", closing: true });
      var plate = function (p, cls) {
        if (!p) return '<div></div>';
        return '<div class="gplate ' + cls + '"><div class="rank">' + p.place + '</div><div class="who">' + esc(p.name) + '</div><div class="sub">' + p.score + "/" + X.total + " right · " + mins(p.secs) + '</div></div>';
      };
      var rest = sent.slice(3).map(function (p, i) {
        return '<div class="brow' + '" style="--i:' + i + '"><span class="pos outline-n">' + p.place + '</span><span class="nm">' + esc(p.name) + '</span><span class="sc">' + p.score + "/" + X.total + '</span><span class="tm">' + mins(p.secs) + '</span></div>';
      }).join("");
      var anim = xAnim; xAnim = false;
      render('<div class="stack' + (anim ? " seq" : "") + '" style="gap:34px"><div class="end-hero"><div><p class="kicker micro"><b></b>' + esc(X.title) + ' · ' + (waitingN ? sent.length + " of " + X.people.length + " sent" : "Everyone sent") + '</p>' +
        '<h1 class="end-hl" style="margin-top:18px"><span>' + (w ? "Number one is" : "No tests sent") + '</span><b>' + (w ? esc(w.name) + "." : "yet.") + '</b></h1>' + tick() +
        '<p class="lead">Ranked by right answers first, then by the quicker finish, from opening the test to sending it.' + (waitingN ? " " + waitingN + " still to send · the ranking updates by itself." : "") + '</p></div></div>' +
        (w ? '<div class="podium">' + plate(sent[1], "p2") + plate(sent[0], "p1") + plate(sent[2], "p3") + '</div>' : "") +
        '<div class="rest stack" style="gap:30px">' + (rest ? '<div class="stack" style="max-width:820px;width:100%;margin:0 auto"><p class="kicker micro"><b></b>Places 4 to ' + sent.length + '</p><div class="board' + (anim ? " stag" : "") + '">' + rest + '</div></div>' : "") +
        '<div class="row" style="justify-content:center;gap:10px"><button class="btn line" data-act="x-rank-no">Back to the test</button></div></div></div>', !first);
    }
    function testsHtml() {
      var list = exams();
      if (!list.length) return '<p class="callout">No self-paced tests yet. In Quizzes, choose a quiz and set its type to Self-paced test.</p>';
      if (!xSel || !list.some(function (z) { return z.id === xSel; })) { xSel = list[0].id; X = null; setTimeout(loadExam, 0); }
      var side = '<aside class="qlist"><p class="shead micro">Self-paced tests</p>' + list.map(function (z) {
        return '<button type="button" class="qitem' + (z.id === xSel ? " on" : "") + '" data-act="x-sel" data-id="' + esc(z.id) + '"><span class="t">' + esc(z.title) + '</span><span class="m">' + z.questions.length + ' questions · ' + (z.active ? "Open" : "Closed") + '</span></button>';
      }).join("") + '</aside>';
      if (!X) return '<div class="admin-grid">' + side + '<section class="stack">' + waiting("Loading the people") + '</section></div>';
      var sent = X.people.filter(function (p) { return p.submitted_at; }), going = X.people.filter(function (p) { return p.started_at && !p.submitted_at; });
      var avg = sent.length ? Math.round(100 * sent.reduce(function (s, p) { return s + p.score; }, 0) / (sent.length * X.total)) : null;
      var url = examUrl(X.id);
      var top = '<div class="xtop"><div class="plate xqr"><div class="qr">' + qrSvg(url) + '</div></div><div class="stack" style="gap:12px">' +
        '<p class="kicker micro"><b></b>' + (X.active ? "Open for sign-in" : "Closed · open it in Quizzes") + '</p>' + hl(X.title, "the test.", "sm") +
        '<p class="muted" style="margin:0;word-break:break-all">' + esc(url) + '</p>' +
        '<dl class="facts"><div><dt>On the list</dt><dd>' + X.people.length + '</dd></div><div><dt>Sent</dt><dd>' + sent.length + (avg != null ? ' · average ' + avg + '%' : "") + '</dd></div><div><dt>Answering now</dt><dd>' + going.length + '</dd></div><div><dt>Not started</dt><dd>' + (X.people.length - sent.length - going.length) + '</dd></div></dl>' +
        '<div class="row" style="gap:10px"><button class="btn" data-act="x-qr">Show the QR full screen</button><button class="btn" data-act="x-rank">Show the final ranking</button><button class="btn line" data-act="x-xlsx">Download every answer + analysis (Excel)</button><button class="btn line" data-act="x-csv">Download results (CSV)</button><button class="btn line" data-act="x-refresh">Refresh</button></div></div></div>';
      var people = '<div class="xtable"><div class="xrow xhead"><span>Name</span><span>HR ID</span><span>Status</span><span>Score</span><span>Sent</span><span></span></div>' + X.people.map(function (p) {
        var st = p.submitted_at ? '<span class="st st-finished">Sent</span>' : p.started_at ? '<span class="st st-question">' + p.answered + ' of ' + X.total + '</span>' + (p.claimable ? ' <span class="muted">waiting for a new phone</span>' : "") : '<span class="st">Not started</span>';
        var c = confirmKey === "x-move:" + p.hr_id ? '<span class="acts confirm">Move to the next phone that signs in? <button class="btn sm" data-act="x-move-yes" data-hr="' + esc(p.hr_id) + '">Move</button><button class="btn line sm" data-act="cancel-confirm">Keep</button></span>'
          : confirmKey === "x-del:" + p.hr_id ? '<span class="acts confirm">Clear their test? Their answers are deleted. <button class="btn danger sm" data-act="x-del-yes" data-hr="' + esc(p.hr_id) + '">Clear</button><button class="btn line sm" data-act="cancel-confirm">Keep</button></span>'
          : '<span class="acts">' + (p.started_at && !p.submitted_at && !p.claimable ? '<button class="btn line sm" data-act="x-move" data-hr="' + esc(p.hr_id) + '">New phone</button>' : "") + (p.started_at ? '<button class="btn line sm danger-line" data-act="x-del" data-hr="' + esc(p.hr_id) + '">Clear</button>' : "") + '</span>';
        return '<div class="xrow' + (p.submitted_at ? " sent" : "") + '"><span class="nm"><b>' + esc(p.name) + '</b>' + (p.note ? '<small>' + esc(p.note) + '</small>' : "") + '</span><span class="hr">' + esc(p.hr_id) + '</span><span>' + st + '</span>' +
          '<span class="sc">' + (p.submitted_at ? (p.place ? '#' + p.place + ' · ' : "") + '<b>' + p.score + '</b>/' + X.total + ' · ' + Math.round(100 * p.score / X.total) + '%' + (p.secs != null ? '<small>' + mins(p.secs) + '</small>' : "") : "") + '</span><span class="muted">' + cairo(p.submitted_at) + '</span>' + c + '</div>';
      }).join("") + '</div>';
      var roster = xEdit
        ? '<div class="plate stack" style="padding:20px"><p class="shead micro">Who can sign in · one person per line: HR ID, name, note (optional)</p>' +
          '<textarea id="xRoster" class="input area" rows="' + Math.max(6, X.people.length + 2) + '">' + esc(X.people.map(function (p) { return p.hr_id + ", " + p.name + (p.note ? ", " + p.note : ""); }).join("\n")) + '</textarea>' +
          '<p class="muted" style="margin:0;font-size:13px">Removing someone from the list stops them signing in. A test they already started or sent is kept.</p>' +
          '<div class="row" style="gap:10px"><button class="btn" data-act="x-roster-save">Save the list</button><button class="btn line" data-act="x-edit-no">Cancel</button></div></div>'
        : '<div><button class="btn line" data-act="x-edit">Edit who can sign in</button></div>';
      var qs = X.questions.map(function (q) {
        var pct = q.answers ? Math.round(100 * q.right / q.answers) : 0;
        return '<div class="res-q"><span class="n outline-n">' + pad(q.n) + '</span><div class="stack" style="gap:6px"><b>' + esc(q.q) + '</b><span class="micro" style="color:var(--blue)">' + (q.section ? esc(q.section) + " · " : "") + 'Answer ' + esc(q.answer) + '</span>' +
          (q.answers ? '<span class="res-bar"><i style="width:' + pct + '%"></i></span><span class="muted">' + q.right + ' of ' + q.answers + ' right (' + pct + '%)</span>' : '<span class="muted">No tests sent yet</span>') + '</div></div>';
      }).join("");
      return '<div class="admin-grid">' + side + '<section class="stack" style="gap:24px">' + top +
        '<div class="stack" style="gap:10px"><p class="shead micro">People · updates by itself every few seconds</p>' + people + roster + '</div>' +
        '<div class="stack" style="gap:10px"><p class="shead micro">Question by question · from the tests that were sent · numbered as in the master list</p>' + qs + '</div></section></div>';
    }

    /* ----- settings tab ----- */
    function settingsHtml() {
      return '<div class="two"><div class="plate stack" style="padding:22px"><p class="shead micro">Change the admin PIN</p>' +
        field("pNew", "New PIN (6 digits)", "", { type: "password", max: 6 }) + field("pNew2", "Type it again", "", { type: "password", max: 6 }) +
        '<div id="pErr" class="error" hidden></div><div><button class="btn" data-act="set-pin">Change PIN</button></div></div>' +
        '<div class="stack"><p class="callout">Signing in lasts 12 hours on this browser. Players never see the admin pages, the answers or this PIN.</p>' +
        '<dl class="facts"><div><dt>Quizzes</dt><dd>' + D.quizzes.length + '</dd></div><div><dt>Questions</dt><dd>' + D.quizzes.reduce(function (s, z) { return s + z.questions.length; }, 0) + '</dd></div><div><dt>Rooms</dt><dd>' + D.rooms.length + ' recent</dd></div></dl>' +
        '<div><button class="btn line" data-act="signout">Sign out</button></div></div></div>';
    }

    function draw() {
      if (tab === "tests" && xRank && X && X.id === xSel) return rankingPage();
      chrome({ section: "Quiz admin", no: "", left: "Admin" });
      var tabsHtml = '<div class="atabs" role="tablist">' + [["quizzes", "Quizzes"], ["rooms", "Rooms"], ["tests", "Tests"], ["settings", "Settings"]].map(function (t) {
        return '<button role="tab" class="atab' + (tab === t[0] ? " on" : "") + '" aria-selected="' + (tab === t[0]) + '" data-tab="' + t[0] + '">' + t[1] + '</button>';
      }).join("") + '</div>';
      var body = tab === "rooms" ? roomsHtml() : tab === "tests" ? testsHtml() : tab === "settings" ? settingsHtml() : quizzesHtml();
      render('<div class="stack" style="gap:22px"><div class="row spread" style="align-items:flex-end;gap:20px">' + hl("Quiz admin.", "Control everything.", "sm") +
        '<div class="row" style="gap:10px"><a class="btn line" href="?host">Host a quiz</a></div></div>' + tabsHtml + body + '</div>', !first);
      first = false;
    }
    function busy(btn, on) { if (btn) { btn.disabled = on; } }
    function showErr(id, m) { var el = document.getElementById(id); if (el) { el.hidden = false; el.textContent = m; } else toast(m); }

    app.addEventListener("click", function (ev) {
      if (!D) return;
      var t = ev.target.closest("[data-act],[data-sel],[data-tab]");
      if (!t || !app.contains(t)) return;
      if (t.dataset.tab) { collect(); tab = t.dataset.tab; confirmKey = null; resCode = null; xEdit = false; xRank = false; draw(); if (tab === "rooms") load(); if (tab === "tests") loadExam(); return; }
      if (t.dataset.sel) { selId = t.dataset.sel; ed = null; confirmKey = null; draw(); return; }
      var act = t.dataset.act, z = cur();
      ev.preventDefault();
      if (act === "new-quiz") { selId = "__new"; ed = null; draw(); }
      else if (act === "cancel-new") { selId = null; load(); }
      else if (act === "cancel-confirm") { confirmKey = null; draw(); }
      else if (act === "save-quiz") {
        busy(t, true);
        var p = { id: selId === "__new" ? "" : selId, title: document.getElementById("zTitle").value, subtitle: document.getElementById("zSub").value,
          blurb: document.getElementById("zBlurb").value, sort: document.getElementById("zSort").value || null, active: document.getElementById("zActive").checked,
          mode: (app.querySelector('[data-act="zmode"].on') || { dataset: { m: "live" } }).dataset.m };
        if (p.sort === null) delete p.sort;
        adminCall("quiz_admin_save_quiz", { p: p }).then(function (r) { selId = r.id; toast("Quiz saved"); load(); }).catch(function (e) { busy(t, false); toast(e.message); });
      }
      else if (act === "zmode") { app.querySelectorAll('[data-act="zmode"]').forEach(function (b) { b.classList.toggle("on", b === t); }); }
      else if (act === "to-tests") { tab = "tests"; xSel = selId; X = null; draw(); loadExam(); }
      else if (act === "x-sel") { xSel = t.dataset.id; X = null; xEdit = false; draw(); loadExam(); }
      else if (act === "x-refresh") { loadExam(); }
      else if (act === "x-xlsx") { examXlsx(t); }
      else if (act === "x-rank") { xRank = true; xAnim = true; xEdit = false; confirmKey = null; draw(); window.scrollTo(0, 0); }
      else if (act === "x-rank-no") { xRank = false; draw(); window.scrollTo(0, 0); }
      else if (act === "x-qr") { var zq = document.createElement("div"); zq.className = "zoom zqr"; zq.innerHTML = '<div class="zqr-in"><div class="qr">' + qrSvg(examUrl(xSel)) + '</div><p>' + esc(X ? X.title : "") + '</p><span>Scan, then sign in with your HR ID</span></div>'; zq.addEventListener("click", function () { zq.remove(); }); document.body.appendChild(zq); }
      else if (act === "x-edit") { xEdit = true; draw(); }
      else if (act === "x-edit-no") { xEdit = false; draw(); }
      else if (act === "x-roster-save") {
        var rows = document.getElementById("xRoster").value.split(/\r?\n/).map(function (l) { var p = l.split(/\t|,/).map(function (s) { return s.trim(); }); return { hr_id: p[0] || "", name: p[1] || "", note: p.slice(2).join(", ") }; }).filter(function (r) { return r.hr_id; });
        busy(t, true);
        adminCall("quiz_admin_exam_roster", { p_quiz: xSel, p_rows: rows }).then(function (r) { toast(r.people + " people on the list"); xEdit = false; loadExam(); }).catch(function (e) { busy(t, false); toast(e.message); });
      }
      else if (act === "x-move" || act === "x-del") { confirmKey = act + ":" + t.dataset.hr; draw(); }
      else if (act === "x-move-yes" || act === "x-del-yes") {
        adminCall("quiz_admin_exam_attempt", { p_quiz: xSel, p_hr_id: t.dataset.hr, p_action: act === "x-move-yes" ? "move" : "delete" })
          .then(function () { confirmKey = null; toast(act === "x-move-yes" ? "The next phone that signs in takes the test over" : "Test cleared. They start again with a new order"); loadExam(); })
          .catch(function (e) { confirmKey = null; toast(e.message); draw(); });
      }
      else if (act === "x-csv") {
        csvDownload((X.title || "test").replace(/[^\w]+/g, "-").replace(/^-|-$/g, "") + "_results.csv", [["Place", "Name", "HR ID", "Note", "Status", "Score", "Out of", "Time taken (min)", "Answered", "Started (Cairo)", "Sent (Cairo)"]].concat(X.people.map(function (p) {
          return [p.place || "", p.name, p.hr_id, p.note, p.submitted_at ? "Sent" : p.started_at ? "Answering" : "Not started", p.submitted_at ? p.score : "", X.total, p.secs != null ? (p.secs / 60).toFixed(1) : "", p.answered, cairo(p.started_at), cairo(p.submitted_at)]; })));
      }
      else if (act === "del-quiz") { confirmKey = "quiz:" + selId; draw(); }
      else if (act === "del-quiz-yes") { adminCall("quiz_admin_delete_quiz", { p_id: selId }).then(function () { toast("Quiz deleted"); selId = null; confirmKey = null; load(); }).catch(function (e) { toast(e.message); }); }
      else if (act === "new-q") { var lastQ = z.questions[z.questions.length - 1]; ed = { isNew: true, kind: "choice", section: lastQ ? lastQ.section || "" : "", q: "", tag: "", secs: 20, opts: ["", "", ""], correct: -1, explanation: "", img: "", reveal: "" }; draw(); document.getElementById("fQ").focus(); }
      else if (act === "kind") { collect(); ed.kind = t.dataset.k; if (ed.kind !== "choice" && ed.secs < 40) ed.secs = ed.kind === "cloud" ? 40 : 60; if (ed.kind === "choice" && ed.opts.length < 2) { ed.opts = ["", "", ""]; ed.correct = -1; } draw(); }
      else if (act === "edit-q") { var x = z.questions.filter(function (q) { return q.id === t.dataset.id; })[0]; ed = JSON.parse(JSON.stringify(x)); ed.opts = ed.opts.slice(); draw(); document.getElementById("qEditor").scrollIntoView({ block: "center" }); }
      else if (act === "cancel-q") { ed = null; draw(); }
      else if (act === "add-opt") { collect(); if (ed.opts.length < 4) ed.opts.push(""); draw(); }
      else if (act === "rm-opt") { collect(); var i = +t.dataset.i; ed.opts.splice(i, 1); if (ed.correct === i) ed.correct = -1; else if (ed.correct > i) ed.correct--; draw(); }
      else if (act === "secs") { collect(); ed.secs = +t.dataset.s; draw(); }
      else if (act === "clear-pic") { collect(); if (t.dataset.k === "Img") ed.img = ""; else ed.reveal = ""; draw(); }
      else if (act === "save-q") {
        collect(); busy(t, true);
        var payload = { id: ed.isNew ? "" : ed.id, quiz_id: selId, kind: ed.kind || "choice", section: ed.section || "", q: ed.q, tag: ed.tag, secs: ed.secs, opts: ed.opts, correct: ed.correct, explanation: ed.explanation, img: ed.img, reveal: ed.reveal };
        adminCall("quiz_admin_save_question", { p: payload }).then(function () { ed = null; toast("Question saved"); load(); })
          .catch(function (e) { busy(t, false); showErr("fErr", e.message); });
      }
      else if (act === "del-q") { confirmKey = "q:" + t.dataset.id; draw(); }
      else if (act === "del-q-yes") { adminCall("quiz_admin_delete_question", { p_id: t.dataset.id }).then(function () { confirmKey = null; toast("Question deleted"); load(); }).catch(function (e) { toast(e.message); }); }
      else if (act === "up" || act === "down") {
        var ids = z.questions.map(function (q) { return q.id; }), j = +t.dataset.i, k = act === "up" ? j - 1 : j + 1;
        if (k < 0 || k >= ids.length) return;
        var tmp = ids[j]; ids[j] = ids[k]; ids[k] = tmp;
        adminCall("quiz_admin_reorder", { p_quiz: selId, p_ids: ids }).then(function () { load(); }).catch(function (e) { toast(e.message); });
      }
      else if (act === "refresh") { load(); }
      else if (act === "room-res") { resCode = t.dataset.code; R = null; draw(); window.scrollTo(0, 0); loadResults(); }
      else if (act === "res-back") { resCode = null; R = null; draw(); load(); }
      else if (act === "res-reload") { loadResults(); }
      else if (act === "res-csv") {
        var ST = R.scored_total || R.total, sh = (R.sections || []).map(function (s) { return s.name + " (/" + s.total + ")"; });
        csvDownload(csvName("ranking"), [["Rank", "Name", "Correct", "Out of", "Total time (s)", "Answered"].concat(sh)].concat((R.ranking || []).map(function (r) {
          return [r.rank, r.name, r.correct, ST, (r.ms / 1000).toFixed(1), r.answered].concat(r.by_section || []); })));
      }
      else if (act === "res-csv-ref") {
        var rows = [["Question no.", "Module", "Question", "Name", "Answer"]];
        R.questions.forEach(function (q) { (q.responses || []).forEach(function (x) { rows.push([q.n, q.section || "", q.q, x.name, x.t]); }); });
        csvDownload(csvName("reflections"), rows);
      }
      else if (act === "room-end") { adminCall("quiz_admin_room", { p_code: t.dataset.code, p_action: "end" }).then(function () { toast("Room ended"); load(); }).catch(function (e) { toast(e.message); }); }
      else if (act === "room-del") { confirmKey = "room:" + t.dataset.code; draw(); }
      else if (act === "room-del-yes") { adminCall("quiz_admin_room", { p_code: t.dataset.code, p_action: "delete" }).then(function () { confirmKey = null; toast("Room deleted"); load(); }).catch(function (e) { toast(e.message); }); }
      else if (act === "set-pin") {
        var a1 = document.getElementById("pNew").value, a2 = document.getElementById("pNew2").value;
        if (a1 !== a2) return showErr("pErr", "The two PINs don't match.");
        busy(t, true);
        adminCall("quiz_admin_set_pin", { p_new: a1 }).then(function () { toast("PIN changed"); draw(); }).catch(function (e) { busy(t, false); showErr("pErr", e.message); });
      }
      else if (act === "signout") { adminCall("quiz_admin_logout").catch(function () {}).then(function () { adminToken(null); location.search = "?host"; }); }
    });
    app.addEventListener("change", function (ev) {
      var inp = ev.target;
      if (inp.dataset && inp.dataset.up && inp.files && inp.files[0]) {
        collect();
        var key = inp.dataset.up, fd = new FormData();
        fd.append("token", adminToken()); fd.append("file", inp.files[0]);
        toast("Uploading the picture");
        fetch(UPLOAD_URL, { method: "POST", body: fd }).then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.message || "Upload failed."); return j; }); })
          .then(function (j) { if (key === "Img") ed.img = j.url; else ed.reveal = j.url; toast("Picture uploaded"); draw(); })
          .catch(function (e) { showErr("fErr", e.message); });
      } else if (inp.id === "fImg" || inp.id === "fRev") { collect(); draw(); }
    });
    load();
  }

  /* ---------- host live ---------- */
  function hostRun(code) {
    var key = store("satoquiz:host:" + code);
    if (!key) {
      chrome({ section: "Host", no: "" });
      render('<div class="phone stack">' + hl("This room was opened", "on another device.", "sm") + tick() + '<p class="lead">Host controls only work in the browser that opened the room. Open a new room to continue.</p><div><a class="btn" href="?host">Open a new room</a></div></div>');
      return;
    }
    var S = null, acting = false, startLocal = 0, lastSig = "", lastDraw = "", seen = {}, lastAns = -1, lastTick = null, revealedAt = null, lobbyDrawn = false, animSig = "", lastResp = "", respSeen = {}, respQ = -1, breakAt = null;
    var joinUrl = BASE + "?join=" + code;
    var mr = document.getElementById("mastRight");
    mr.innerHTML = '<button class="sound" id="snd" type="button"></button>';
    function sndLabel() { document.getElementById("snd").textContent = SND.on ? "Sound on" : "Sound off"; }
    sndLabel();
    document.getElementById("snd").addEventListener("click", function () { SND.on = !SND.on; store("satoquiz:sound", SND.on); audio(); sndLabel(); if (SND.on) SFX.blip(); });
    document.addEventListener("pointerdown", function () { audio(); }, { once: true });
    /* Automatic reveals skip while a request is in flight. A host click always goes through: the server
       applies an action only to the question it names (p_from), so a repeat can never skip one. */
    function act(action, btn) {
      if (!S || (acting && !btn)) return;
      if (btn) { btn.disabled = true; audio(); }
      acting = true;
      rpc("quiz_host_action", { p_code: code, p_host_key: key, p_action: action, p_from: S.q_index, p_status: S.status })
        .catch(function (e) { toast(e.message); if (btn) btn.disabled = false; })
        .then(function () { acting = false; poll.now(); });
    }
    function optsHtml(item, reveal) {
      var total = 0, dist = S.dist || {};
      Object.keys(dist).forEach(function (k) { total += dist[k]; });
      return '<div class="opts' + (reveal ? " stag" : "") + '">' + item.opts.map(function (o, i) {
        var n = dist[String(i)] || 0, pct = total ? n / total : 0;
        var cls = reveal ? (i === S.correct ? " correct" : " dim") : "";
        return '<div class="opt' + cls + '" style="--i:' + i + '"><span class="L outline-n">' + LETTERS[i] + '</span><span>' + (picOnly(item.opts) ? "" : esc(o)) + '</span>' +
          (reveal ? '<span class="count">' + n + '</span><span class="bar" style="width:calc((100% - 64px) * ' + pct.toFixed(3) + ')"></span>' : "<span></span>") + '</div>';
      }).join("") + '</div>';
    }
    function draw() {
      var q = { title: S.quiz_title || "Quiz" }, joinTag = "Join " + fmtCode(code), tp = titleParts(q.title), ST = S.scored_total || S.total;
      MAST_TITLE = S.quiz_title || null;
      if (respQ !== S.q_index) { respQ = S.q_index; respSeen = {}; }
      var still = (S.status + "|" + S.q_index) === animSig; animSig = S.status + "|" + S.q_index; STILL = still;
      if (S.status !== "question") hideCountdown();
      if (S.status === "lobby") {
        chrome({ host: S.host, section: "The room is open", no: "00", left: joinTag });
        render('<div class="two">' +
          '<div class="plate stack qr-plate" style="align-items:center;padding:26px"><p class="micro" style="margin:0">Scan to join</p><div class="qr">' + qrSvg(joinUrl) + '</div>' +
          '<p class="micro" style="margin:0;color:var(--muted)">or open the link and type the code</p><div class="bigcode" aria-label="Code ' + fmtCode(code) + '">' + (lobbyDrawn ? fmtCode(code) : codeDigits(code)) + '</div><div class="url">' + esc(joinUrl) + '</div></div>' +
          '<div class="stack" style="gap:20px">' + chapter(pad(S.players.length), "Players in the room") + hl(tp[0], tp[1], "sm") +
          (S.players.length ? '<div class="names">' + S.players.map(function (p) { var isNew = !seen[p]; seen[p] = 1; return '<span' + (isNew ? ' class="new"' : "") + '><i class="dia"></i><span class="nm">' + esc(p) + '</span></span>'; }).join("") + '</div>' : waiting("Waiting for the first player")) +
          '<p class="callout">Most correct answers first, then the fastest total time on correct answers. Only number one wins the gift.</p>' +
          '<div><button class="btn big" id="start"' + (S.players.length ? "" : " disabled") + '>Start the quiz</button></div></div></div>', still);
        document.getElementById("start").addEventListener("click", function () { act("next", this); });
        if (S.players.length && lobbyDrawn) SFX.blip();
        lobbyDrawn = true;
      } else if (S.status === "question") {
        var item = S.question || { q: "", opts: [], img: "", tag: "" };
        chrome({ host: S.host, section: "Question " + pad(S.q_index + 1) + " of " + pad(S.total), no: pad(S.q_index + 1), left: joinTag });
        var hold = Date.now() < startLocal;
        lastAns = S.answered; lastTick = null; lastResp = JSON.stringify(S.responses || []);
        if (isPoll(item)) {
          render('<div class="stack" style="gap:22px">' + routeHtml(S.q_index, S.total) +
            '<div class="stack poll-host' + (hold ? " hold" : " anim") + '" id="qbody" style="gap:18px"><div class="qhead"><span class="outline-n">' + pad(S.q_index + 1) + '</span><span class="micro" style="padding-bottom:8px">' + esc((item.section ? sectionParts(item.section).head + " · " : "") + (item.kind === "cloud" ? "Reflection · word cloud · not scored" : "Reflection · open answer · not scored")) + '</span></div>' +
            '<h2 class="qtext poll-q">' + esc(item.q) + '</h2>' +
            '<div class="strip"><div><span class="micro">Time left</span><span class="v" id="left">' + S.duration + '</span></div><div><span class="micro">Answered</span><span class="v" id="ans">' + S.answered + " / " + S.players.length + '</span></div></div>' +
            '<div class="timeline" id="tl" style="width:100%"></div>' +
            '<div class="resp" id="resp">' + respHtml(item.kind, S.responses, respSeen) + '</div>' +
            '<div><button class="btn line" id="reveal">Close the poll</button></div></div></div>');
          document.getElementById("reveal").addEventListener("click", function () { act("reveal", this); });
          return;
        }
        render('<div class="stack" style="gap:22px">' + routeHtml(S.q_index, S.total) +
          '<div class="two' + (hold ? " hold" : " anim") + '" id="qbody">' + figHtml(item.img, item) +
          '<div class="stack"><div class="qhead"><span class="outline-n">' + pad(S.q_index + 1) + '</span><span class="micro" style="padding-bottom:8px">' + esc(item.tag) + ' · of ' + S.total + '</span></div>' +
          '<h2 class="qtext">' + esc(item.q) + '</h2>' + optsHtml(item, false) +
          '<div class="strip"><div><span class="micro">Time left</span><span class="v" id="left">' + S.duration + '</span></div><div><span class="micro">Answered</span><span class="v" id="ans">' + S.answered + " / " + S.players.length + '</span></div></div>' +
          '<div class="timeline" id="tl" style="width:100%"></div>' +
          '<div><button class="btn line" id="reveal">Reveal the answer</button></div></div></div></div>');
        document.getElementById("reveal").addEventListener("click", function () { act("reveal", this); });
      } else if (S.status === "reveal") {
        var it = S.question || { q: "", opts: [], img: "", tag: "" }, last = S.q_index + 1 >= S.total;
        var nextLbl = last ? "Show the final ranking" : S.break_next ? "Show the module leaderboard" : "Next question";
        chrome({ host: S.host, section: "Answer " + pad(S.q_index + 1) + " of " + pad(S.total), no: pad(S.q_index + 1), left: joinTag });
        if (isPoll(it)) {
          render('<div class="stack" style="gap:22px">' + routeHtml(S.q_index, S.total) +
            '<div class="stack" style="gap:18px"><div class="qhead"><span class="outline-n">' + pad(S.q_index + 1) + '</span><span class="micro" style="padding-bottom:8px">What the room said · ' + S.answered + ' answer' + (S.answered === 1 ? "" : "s") + '</span></div>' +
            '<h2 class="qtext poll-q">' + esc(it.q) + '</h2><div class="resp done">' + respHtml(it.kind, S.responses, respSeen) + '</div>' +
            (S.explanation ? '<p class="callout explain">' + esc(S.explanation) + '</p>' : "") +
            '<div><button class="btn big" id="next">' + nextLbl + '</button></div></div></div>');
          document.getElementById("next").addEventListener("click", function () { act("next", this); });
          if (revealedAt !== S.q_index) { revealedAt = S.q_index; setTimeout(SFX.reveal, 150); }
          return;
        }
        render('<div class="stack" style="gap:22px">' + routeHtml(S.q_index, S.total) +
          '<div class="two"><div class="stack">' + figHtml(S.reveal || it.img, it, true, "Answer picture") +
          '<p class="callout explain"><b>' + esc(S.answer) + '.</b> ' + esc(S.explanation) + '</p></div>' +
          '<div class="stack"><div class="qhead"><span class="outline-n">' + pad(S.q_index + 1) + '</span><span class="micro" style="padding-bottom:8px">The answer</span></div>' +
          '<h2 class="qtext">' + esc(it.q) + '</h2>' + optsHtml(it, true) +
          '<dl class="facts"><div><dt>Fastest correct</dt><dd>' + (S.fastest ? "<b>" + esc(S.fastest.name) + "</b> · " + secs(S.fastest.ms) : "Nobody this time. A tricky one!") + '</dd></div></dl>' +
          ((S.gomode || []).length ? '<p class="shead micro">Go mode</p><div class="gm-list">' + S.gomode.slice(0, 6).map(function (g, k) { return '<span style="animation-delay:' + (0.5 + k * 0.12) + 's"><i class="dia on"></i>' + esc(g.name) + ' <b>' + g.streak + ' in a row</b></span>'; }).join("") + '</div>' : "") +
          '<p class="shead micro">Ranking so far</p>' + boardHtml(S.board || [], ST, 3) +
          '<div><button class="btn big" id="next">' + nextLbl + '</button></div></div></div></div>');
        document.getElementById("next").addEventListener("click", function () { act("next", this); });
        if (revealedAt !== S.q_index) { revealedAt = S.q_index; setTimeout(SFX.reveal, 150); if ((S.gomode || []).length) setTimeout(SFX.rise, 700); }
      } else if (S.status === "standings") {
        var cp = sectionParts(S.section), np = sectionParts(S.next_section), mb = S.module_board || [], star = mb[0] && mb[0].correct ? mb[0] : null;
        var startLbl = S.next_section ? (np.num ? "Start " + np.head : "Start the next part") : "Continue";
        chrome({ host: S.host, section: (cp.head || "Section") + " · complete", no: cp.num, left: joinTag });
        render('<div class="stack" style="gap:24px"><div class="row spread" style="align-items:flex-end;gap:24px"><div>' + chapter(cp.num || "◆", (cp.head || "Section") + " complete") +
          '<div style="margin-top:16px">' + hl(cp.num ? cp.head : cp.title, "complete.", "sm") + '</div><p class="lead" style="margin:10px 0 0">' + esc(cp.num ? cp.title : "") + '</p></div>' +
          '<button class="btn big" id="next">' + esc(startLbl) + '</button></div>' + tick() +
          '<div class="two"><div class="stack"><p class="kicker micro"><b></b>This module · top 5</p>' + (mb.length ? boardHtml(mb, S.section_total, 5) : waiting("No answers yet")) +
          (star ? '<div class="mstar"><i class="dia on"></i><span><span class="micro">Module star</span><b>' + esc(star.name) + '</b><span class="muted">' + star.correct + ' of ' + S.section_total + ' correct · ' + secs(star.ms) + '</span></span></div>' : "") + '</div>' +
          '<div class="stack"><p class="kicker micro"><b></b>Overall ranking · top 10</p>' + boardHtml(S.board || [], ST, 10) + '</div></div>' +
          (S.next_section ? '<p class="callout">Up next: <b>' + esc(S.next_section) + '</b>. The room stays open during the module. Players keep their place, and newcomers can still join with code ' + fmtCode(code) + '.</p>' : "") + '</div>');
        document.getElementById("next").addEventListener("click", function () { act("next", this); });
        if (breakAt !== S.q_index) { breakAt = S.q_index; setTimeout(SFX.rise, 200); if (star) setTimeout(function () { burst({ count: 110, power: 10, y: .4 }); }, REDUCED ? 0 : 600); }
      } else {
        var b = S.board || [], w = b[0];
        chrome({ host: S.host, section: "Final ranking ◆", no: "", left: S.players.length + " players", closing: true });
        var plate = function (r, cls) {
          if (!r) return '<div></div>';
          return '<div class="gplate ' + cls + '"><div class="rank">' + r.rank + '</div><div class="who">' + esc(r.name) + '</div><div class="sub">' + r.correct + "/" + ST + " correct · " + secs(r.ms) + '</div>' +
            (r.rank === 1 ? '<div class="gift">' + GIFT + 'Wins the gift</div>' : "") + '</div>';
        };
        render('<div class="stack seq" style="gap:34px"><div class="end-hero"><div><p class="kicker micro"><b></b>' + esc(q.title) + ' · Complete</p>' +
          '<h1 class="end-hl" style="margin-top:18px"><span>' + (w ? "The winner is" : "No winner") + '</span><b>' + (w ? esc(w.name) + "." : "this time.") + '</b></h1>' + tick() +
          '<p class="lead">' + S.players.length + ' players, ' + ST + ' scored questions. Ranked by correct answers first, then by the fastest total time.</p></div>' +
          (w ? '<div class="stamp"><div><span class="micro">Number one</span><strong>The gift</strong>' + GIFT + '</div></div>' : "") + '</div>' +
          '<div class="podium">' + plate(b[1], "p2") + plate(b[0], "p1") + plate(b[2], "p3") + '</div>' +
          '<div class="rest stack" style="gap:30px">' + (b.length > 3 ? '<div class="stack" style="max-width:820px;width:100%;margin:0 auto"><p class="kicker micro"><b></b>Places 4 to ' + Math.min(10, b.length) + '</p>' + boardHtml(b.slice(3), ST, 7) + '</div>' : "") +
          '<div class="row" style="justify-content:center;gap:10px"><a class="btn line" href="?admin&tab=rooms&room=' + code + '">Full results and download</a><a class="btn line" href="?host">Start a new session</a></div></div></div>');
        if (w) {
          setTimeout(SFX.drum, 200);
          setTimeout(function () { SFX.fanfare(); burst({ colors: GOLD, count: 170, power: 13, y: .62, lift: 7 }); }, REDUCED ? 0 : 2300);
          setTimeout(function () { burst({ colors: GOLD, count: 70, power: 9, x: .2, y: .7 }); burst({ colors: GOLD, count: 70, power: 9, x: .8, y: .7 }); }, REDUCED ? 0 : 3100);
        }
      }
    }
    function tickTimer() {
      if (!S || S.status !== "question") return;
      var toGo = startLocal - Date.now();
      var sec = countdown(toGo, "Question " + pad(S.q_index + 1) + " · " + ((S.question && S.question.tag) || "Get ready"));
      if (sec != null && sec > 0) SFX.count();
      if (sec === 0) SFX.go();
      if (toGo > 0) return;
      release("qbody", ".opts");
      var left = S.duration - (Date.now() - startLocal) / 1000, el = document.getElementById("left"), tl = document.getElementById("tl");
      if (el) {
        var s = Math.max(0, Math.ceil(left));
        el.textContent = s; tl.style.width = Math.max(0, 100 * left / S.duration) + "%"; tl.classList.toggle("low", left <= 5); el.classList.toggle("low", left <= 5 && left > 0);
        if (left <= 5 && left > 0 && s !== lastTick) { lastTick = s; SFX.tick(); }
      }
      if (left <= -0.6 || (S.players.length && S.answered >= S.players.length)) act("reveal");
    }
    setInterval(tickTimer, 250);
    var poll = poller(function () {
      return rpc("quiz_host_state", { p_code: code, p_host_key: key }).then(function (s) {
        var sig = s.status + "|" + s.q_index;
        if (s.status === "question" && s.elapsed_ms != null && sig !== lastSig) startLocal = Date.now() - s.elapsed_ms;
        var full = sig + "|" + (s.status === "lobby" ? s.players.length : "") + (s.status === "finished" || s.status === "reveal" || s.status === "standings" ? JSON.stringify(s.board) + JSON.stringify(s.module_board || "") : "") + (s.status === "reveal" ? JSON.stringify(s.responses || "") : "");
        S = s; lastSig = sig;
        if (full !== lastDraw) { lastDraw = full; draw(); window.scrollTo(0, 0); }
        else if (s.status === "question") {
          var rs = document.getElementById("resp"), rj = JSON.stringify(s.responses || []);
          if (rs && rj !== lastResp) { lastResp = rj; rs.innerHTML = respHtml(s.question && s.question.kind, s.responses, respSeen); }
          var a = document.getElementById("ans"); if (a) { a.textContent = s.answered + " / " + s.players.length; if (s.answered !== lastAns) { lastAns = s.answered; a.classList.remove("tickn"); void a.offsetWidth; a.classList.add("tickn"); SFX.blip(); } } }
      }).catch(function (e) {
        if (/not found/i.test(e.message)) { poll.stop(); render('<div class="phone stack">' + hl("Room", "not found.", "sm") + '<p class="lead">' + esc(e.message) + '</p><div><a class="btn" href="?host">Open a new room</a></div></div>'); }
      });
    }, 1000);
  }

  /* ---------- player ---------- */
  function player(code) {
    var me = store("satoquiz:player:" + code);
    if (!me) return joinForm(code);
    var S = null, lastKey = "", startLocal = 0, picking = false, pending = null, pendingText = null, sending = false, cdFired = {}, animSig = "", flashed = {};
    function draw() {
      var q = { title: S.quiz_title || "Quiz" }, ST = S.scored_total || S.total;
      MAST_TITLE = S.quiz_title || null;
      var still = (S.status + "|" + S.q_index) === animSig; animSig = S.status + "|" + S.q_index; STILL = still;
      if (S.status !== "question") hideCountdown();
      if (S.status === "lobby") {
        chrome({ host: S.host, section: "Lobby", no: "00" });
        render('<div class="phone stack">' + chapter(pad(S.players), "Players in the room") + '<div>' + hl("You're in,", S.name.split(" ")[0] + ".", "sm") + '</div>' + tick() +
          '<p class="lead">Watch the big screen. ' + esc(S.host) + ' will start the quiz in a moment.</p>' + waiting("Waiting for the first question") +
          '<p class="callout" style="margin-top:8px">Most correct answers first, then the fastest time. Only number one wins the gift.</p></div>', still);
      } else if (S.status === "question") {
        var item = S.question || { q: "", opts: [], img: "", tag: "" }, mine = S.my_choice != null ? S.my_choice : pending;
        chrome({ host: S.host, section: "Question " + pad(S.q_index + 1) + " of " + pad(S.total), no: pad(S.q_index + 1) });
        var hold = Date.now() < startLocal, ptop = '<div class="ptop"><span class="left"><span class="outline-n">' + pad(S.q_index + 1) + '</span><span class="micro" style="padding-bottom:6px">of ' + S.total + '</span></span><span class="secs" id="secs">' + S.duration + ' s</span></div>';
        if (isPoll(item)) {
          var myT = S.my_text != null ? S.my_text : pendingText;
          render('<div class="phone stack' + (hold ? " hold" : (still ? "" : " anim")) + '" id="qbody" style="gap:14px">' + ptop +
            '<div class="timeline" id="tl" style="width:100%"></div><p class="micro" style="margin:0;color:var(--blue)">Reflection · not scored</p><h2 class="qtext" style="font-size:22px">' + esc(item.q) + '</h2>' +
            (myT != null ? '<div class="callout sent"><span class="micro">You sent</span><p>' + esc(myT) + '</p></div>' + waiting("Look at the big screen")
              : '<form id="pollForm" class="stack pollbox" novalidate>' + (item.kind === "cloud" ? '<input id="ptext" class="input" maxlength="30" autocomplete="off" autocapitalize="off" placeholder="One word">' : '<textarea id="ptext" class="input area" rows="4" maxlength="280" placeholder="Type your answer"></textarea>') +
                '<button class="btn big block" type="submit">Send</button></form>') + '<div id="lock"></div></div>');
          var pf = document.getElementById("pollForm");
          if (pf) pf.addEventListener("submit", function (ev) { ev.preventDefault(); sendText(document.getElementById("ptext").value); });
          return;
        }
        render('<div class="phone stack' + (hold ? " hold" : (still ? "" : " anim")) + '" id="qbody" style="gap:14px">' + ptop +
          '<div class="timeline" id="tl" style="width:100%"></div><h2 class="qtext" style="font-size:22px">' + esc(item.q) + '</h2>' +
          (item.img ? '<div class="plate pimg" id="pimg" style="padding:10px"><img alt="Question picture, tap to enlarge" src="' + esc(item.img) + '"></div>' : "") +
          '<div class="answers">' + item.opts.map(function (o, i) {
            return '<button class="answer" style="--i:' + i + '" data-i="' + i + '" aria-pressed="' + (mine === i) + '"' + (mine != null ? " disabled" : "") + '><span class="L outline-n">' + LETTERS[i] + '</span><span>' + (picOnly(item.opts) ? "Picture " + LETTERS[i] : esc(o)) + '</span><span class="dia"></span></button>';
          }).join("") + '</div><div id="lock">' + (mine != null ? waiting("Answer " + LETTERS[mine] + " is locked in") : "") + '</div></div>');
        var pq = document.getElementById("pimg"); if (pq) pq.addEventListener("click", function () { zoom(item.img); });
        app.querySelectorAll(".answer").forEach(function (b) { b.addEventListener("click", function () { pick(+b.dataset.i); }); });
      } else if (S.status === "reveal") {
        var it = { reveal: S.reveal }, cls, head;
        chrome({ host: S.host, section: "Answer " + pad(S.q_index + 1) + " of " + pad(S.total), no: pad(S.q_index + 1) });
        if (isPoll(S.question)) {
          render('<div class="phone stack anim"><div class="callout">' + hl("Thanks for", "sharing.", "sm") + '</div>' +
            '<dl class="facts">' + (S.my_text ? '<div><dt>You said</dt><dd>' + esc(S.my_text) + '</dd></div>' : '<div><dt>Your answer</dt><dd class="muted">None this time. Reflections are not scored.</dd></div>') +
            (S.live_rank ? '<div><dt>Your rank now</dt><dd><span class="liverank">#' + S.live_rank + '</span> of ' + S.players + '</dd></div>' : "") + '</dl>' +
            (S.explanation ? '<p style="margin:0">' + esc(S.explanation) + '</p>' : "") + waiting("Look at the big screen") + '</div>');
          return;
        }
        if (S.my_choice == null) { cls = "result-none"; head = hl("No answer", "this time.", "sm"); buzz(120); }
        else if (S.my_correct) { cls = "result-right"; head = hl("Correct.", secs(S.my_ms), "sm"); buzz([30, 40, 30]); setTimeout(function () { burst({ count: S.streak >= 3 ? 110 : 60, power: 8, y: .28 }); }, 200); }
        else { cls = "result-wrong"; head = hl("Not this", "time.", "sm"); buzz(220); }
        var go = "";
        if (S.my_correct && S.streak >= 3) {
          var ds = ""; for (var d = 0; d < Math.min(S.streak, 10); d++) ds += '<i style="--d:' + d + '"></i>';
          go = '<div class="stack" style="gap:10px"><div><span class="gomode"><span class="d"></span>Go mode · ' + S.streak + ' in a row</span></div><div class="streak" aria-hidden="true">' + ds + '</div></div>';
          if ((S.streak === 3 || S.streak === 5 || S.streak === 10) && !flashed[S.q_index]) { flashed[S.q_index] = 1; var st = S.streak; setTimeout(function () { goFlash(st); buzz([40, 30, 40, 30, 120]); }, 350); }
        }
        render('<div class="phone stack anim ' + cls + '"><div class="callout">' + head + '</div>' + go +
          '<dl class="facts"><div><dt>Correct answer</dt><dd><b style="color:var(--deep)">' + esc(S.answer) + '</b></dd></div>' +
          (S.live_rank ? '<div><dt>Your rank now</dt><dd><span class="liverank">#' + S.live_rank + '</span> of ' + S.players + '</dd></div>' : "") +
          (S.my_choice != null ? '<div><dt>You picked</dt><dd>' + LETTERS[S.my_choice] + '</dd></div>' : "") + '</dl>' +
          '<p style="margin:0">' + esc(S.explanation) + '</p>' +
          (it.reveal ? '<div class="plate pimg" id="pimg" style="padding:10px"><img alt="Answer picture" src="' + esc(it.reveal) + '"></div>' : "") +
          waiting("The next question is coming up") + '</div>');
        var pi = document.getElementById("pimg"); if (pi) pi.addEventListener("click", function () { zoom(it.reveal); });
      } else if (S.status === "standings") {
        var cp = sectionParts(S.section);
        chrome({ host: S.host, section: (cp.head || "Section") + " · complete", no: cp.num });
        render('<div class="phone stack">' + chapter(cp.num || "◆", (cp.head || "Section") + " complete") + '<div>' + hl(cp.num ? cp.head : cp.title, "done.", "sm") + '</div>' + tick() +
          '<dl class="facts"><div><dt>This module</dt><dd><b style="color:var(--deep)">' + S.my_module + '</b> of ' + S.section_total + ' correct</dd></div>' +
          '<div><dt>Overall rank</dt><dd><span class="liverank">#' + S.my_rank + '</span> of ' + S.players + '</dd></div><div><dt>Correct so far</dt><dd>' + S.my_score + '</dd></div></dl>' +
          (S.next_section ? '<p class="lead">Up next: <b>' + esc(S.next_section) + '</b>. Keep this page open. The quiz continues after the module.</p>' : "") +
          waiting("Waiting for " + S.host) + '</div>', still);
        if (!still) buzz([30, 40, 30]);
      } else {
        var rank = S.my_rank, win = rank === 1, top = S.top || [];
        chrome({ host: S.host, section: "Final ranking ◆", no: "", closing: true });
        render('<div class="phone stack" style="gap:22px"><p class="kicker micro"><b></b>' + esc(q.title) + ' · Complete</p>' +
          '<div class="row spread" style="align-items:flex-end"><div class="prank' + (win ? " win" : "") + '">#' + rank + '</div>' +
          (win ? '<div class="stamp slam" style="width:118px;height:118px"><div><span class="micro">Number one</span><strong style="font-size:22px">The gift</strong>' + GIFT + '</div></div>' : "") + '</div>' +
          '<h1 class="end-hl">' + (win ? "You win" : rank <= 3 ? "Top three," : "Thanks for playing,") + '<b>' + (win ? "the gift." : rank <= 3 ? "well done." : esc(S.name.split(" ")[0]) + ".") + '</b></h1>' + tick() +
          '<p class="lead">' + (win ? "Show this screen to " + esc(S.host) + " to collect your gift." : "You finished #" + rank + " of " + S.players + ". The gift goes to number one.") + '</p>' +
          '<dl class="facts" style="border-top-color:var(--gold)"><div style="border-bottom-color:var(--n-hair)"><dt style="color:var(--gold)">Correct</dt><dd style="color:var(--n-text)">' + S.my_score + " of " + ST + '</dd></div>' +
          '<div style="border-bottom-color:var(--n-hair)"><dt style="color:var(--gold)">Total time</dt><dd style="color:var(--n-text)">' + secs(S.my_total_ms) + '</dd></div></dl>' +
          '<p class="kicker micro"><b></b>Top three</p>' + boardHtml(top, ST, 3) + '</div>');
        if (win) { buzz([60, 60, 60, 60, 300]); setTimeout(function () { burst({ colors: GOLD, count: 150, power: 11, y: .3 }); }, 400); setTimeout(function () { burst({ colors: GOLD, count: 80, power: 9, y: .5 }); }, 1300); }
        else if (rank <= 3) buzz([40, 40, 40]);
      }
    }
    function pick(i) {
      if (picking || !S || S.status !== "question" || S.my_choice != null || Date.now() < startLocal) return;
      picking = true; pending = i; buzz(15);
      app.querySelectorAll(".answer").forEach(function (b) { b.disabled = true; b.setAttribute("aria-pressed", String(+b.dataset.i === i)); if (+b.dataset.i === i) hit(b); });
      document.getElementById("lock").innerHTML = waiting("Answer " + LETTERS[i] + " is locked in");
      rpc("quiz_answer", { p_code: code, p_token: me.token, p_q: S.q_index, p_choice: i })
        .then(function () { S.my_choice = i; })
        .catch(function (e) { pending = null; toast(e.message); lastKey = ""; poll.now(); })
        .then(function () { picking = false; });
    }
    function sendText(v) {
      v = String(v || "").trim();
      if (!v || sending || !S || S.status !== "question" || S.my_text != null || Date.now() < startLocal) { if (!v) toast("Type your answer first."); return; }
      sending = true; buzz(15);
      var b = app.querySelector("#pollForm button"); if (b) b.disabled = true;
      rpc("quiz_respond", { p_code: code, p_token: me.token, p_q: S.q_index, p_text: v })
        .then(function () { S.my_text = v; pendingText = v; draw(); })
        .catch(function (e) { toast(e.message); if (b) b.disabled = false; })
        .then(function () { sending = false; });
    }
    function tickTimer() {
      if (!S || S.status !== "question") return;
      var toGo = startLocal - Date.now();
      var sec = countdown(toGo, "Question " + pad(S.q_index + 1) + " of " + S.total);
      if (sec === 0 && !cdFired[S.q_index]) { cdFired[S.q_index] = 1; buzz(60); }
      if (toGo > 0) return;
      release("qbody", ".answers");
      var left = S.duration - (Date.now() - startLocal) / 1000, tl = document.getElementById("tl"), sc = document.getElementById("secs");
      if (!tl) return;
      tl.style.width = Math.max(0, 100 * left / S.duration) + "%"; tl.classList.toggle("low", left <= 5);
      sc.textContent = Math.max(0, Math.ceil(left)) + " s"; sc.classList.toggle("low", left <= 5 && left > 0);
      if (left <= 0 && S.my_choice == null && pending == null && S.my_text == null && pendingText == null) {
        app.querySelectorAll(".answer, #pollForm button, #ptext").forEach(function (b) { b.disabled = true; });
        var lk = document.getElementById("lock"); if (lk && !lk.innerHTML) lk.innerHTML = waiting("Time is up");
      }
    }
    setInterval(tickTimer, 200);
    var poll = poller(function () {
      return rpc("quiz_player_state", { p_code: code, p_token: me.token }).then(function (s) {
        var key = s.status + "|" + s.q_index + "|" + (s.status === "lobby" ? s.players : "") + "|" + (s.my_choice != null ? s.my_choice : "") + "|" + (s.my_text != null ? "t" : "");
        if (s.status === "question" && (!S || S.status !== "question" || S.q_index !== s.q_index)) { startLocal = Date.now() - (s.elapsed_ms || 0); pending = null; pendingText = null; }
        S = s;
        if (key !== lastKey && !(s.status === "question" && pending != null && s.my_choice == null)) { lastKey = key; draw(); window.scrollTo(0, 0); }
      }).catch(function (e) {
        if (/join again|not found/i.test(e.message)) { poll.stop(); store("satoquiz:player:" + code, null); joinForm(code); }
      });
    }, 1300);
  }

  function joinForm(code) {
    chrome({ section: "Join", no: "01" });
    render('<div class="phone stack" id="jcard">' + waiting("Finding the quiz") + '</div>');
    rpc("quiz_peek", { p_code: code }).then(function (p) {
      var q = { title: p.title || "Quiz", blurb: p.blurb || "", total: p.total || 0 }, card = document.getElementById("jcard");
      MAST_TITLE = p.title || null;
      chrome({ host: p.host, section: "Join", no: "01" });
      if (p.status === "finished") { card.innerHTML = hl("This quiz", "has finished.", "sm") + tick() + '<p class="lead">Ask ' + esc(p.host) + ' for the code of the next one.</p><div><a class="btn line" href="./">Enter another code</a></div>'; return; }
      card.innerHTML = chapter("01", "Room " + fmtCode(code)) + '<div>' + hl("Welcome to", q.title + ".", "sm") + '</div>' + tick() +
        '<p class="lead">' + esc(q.blurb) + '</p>' +
        '<form id="nameForm" class="stack" novalidate><div class="field"><label for="pname">Your name</label><input id="pname" class="input" maxlength="40" autocomplete="name" placeholder="First and last name"></div>' +
        '<div id="nErr" class="error" hidden></div><button class="btn big block" type="submit">Join the quiz</button></form>' +
        '<dl class="facts"><div><dt>In the room</dt><dd>' + p.players + ' player' + (p.players === 1 ? "" : "s") + '</dd></div><div><dt>Questions</dt><dd>' + q.total + (p.status !== "lobby" ? " · already started, you can still join" : "") + '</dd></div></dl>';
      var f = document.getElementById("nameForm");
      f.addEventListener("submit", function (e) {
        e.preventDefault();
        var btn = f.querySelector("button"), err = document.getElementById("nErr"), name = document.getElementById("pname").value;
        btn.disabled = true; err.hidden = true;
        rpc("quiz_join", { p_code: code, p_name: name }).then(function (r) {
          store("satoquiz:player:" + code, { token: r.token, name: r.name }); player(code);
        }).catch(function (e2) { btn.disabled = false; err.hidden = false; err.textContent = e2.message; });
      });
    }).catch(function (e) {
      document.getElementById("jcard").innerHTML = hl("Quiz", "not found.", "sm") + tick() + '<p class="lead">' + esc(e.message) + '</p><div><a class="btn line" href="./">Try another code</a></div>';
    });
  }

  /* ---------- self-paced test: HR ID sign-in, no timer, everyone's own order ---------- */
  /* The database deals each person their own question order and their own answer order, and keeps the
     answer key to itself. Answers save as they are tapped and can be changed until the test is sent. */
  var EXAM_KEY = function (id) { return "satoquiz:exam:" + id; };
  function examUrl(id) { return BASE + "?exam=" + encodeURIComponent(id); }
  function exam(id) {
    var mine = store(EXAM_KEY(id)), S = null, idx = 0, confirmSend = false, saving = {}, pollT = null;
    function signIn(err) {
      chrome({ section: "Sign in", no: "01" });
      render('<div class="phone stack" id="xcard">' + waiting("Finding the test") + '</div>');
      rpc("quiz_exam_info", { p_quiz: id }).then(function (z) {
        MAST_TITLE = z.title; chrome({ section: "Sign in", no: "01" });
        var tp = titleParts(z.title);
        document.getElementById("xcard").innerHTML = chapter("01", z.subtitle || "Test") + '<div>' + hl(tp[0], tp[1], "sm") + '</div>' + tick() +
          '<p class="lead">' + esc(z.blurb) + '</p>' +
          '<form id="hrForm" class="stack" novalidate><div class="field"><label for="hrid">Your HR ID</label><input id="hrid" class="input xid" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="12" placeholder="e.g. AI-0029"></div>' +
          '<div id="hErr" class="error"' + (err ? "" : " hidden") + '>' + esc(err || "") + '</div><button class="btn big block" type="submit">Start the test</button></form>' +
          '<dl class="facts"><div><dt>Questions</dt><dd>' + z.total + '</dd></div><div><dt>Timer</dt><dd>None. Take your time.</dd></div><div><dt>Order</dt><dd>Your own. Questions and answers are shuffled for each person.</dd></div></dl>';
        var f = document.getElementById("hrForm");
        f.addEventListener("submit", function (e) {
          e.preventDefault();
          var b = f.querySelector("button"), er = document.getElementById("hErr"), v = document.getElementById("hrid").value.trim();
          if (!v) { er.hidden = false; er.textContent = "Enter your HR ID."; return; }
          b.disabled = true; er.hidden = true;
          rpc("quiz_exam_start", { p_quiz: id, p_hr_id: v, p_token: mine ? mine.token : null }).then(function (s) {
            mine = { token: s.token }; store(EXAM_KEY(id), mine); S = s; idx = firstOpen(); draw();
          }).catch(function (e2) { b.disabled = false; er.hidden = false; er.textContent = e2.message; });
        });
      }).catch(function (e) {
        document.getElementById("xcard").innerHTML = hl("Test", "not available.", "sm") + tick() + '<p class="lead">' + esc(e.message) + '</p>';
      });
    }
    function answered() { return S.questions.filter(function (q) { return q.my != null; }).length; }
    function firstOpen() { for (var k = 0; k < S.questions.length; k++) if (S.questions[k].my == null) return k; return S.questions.length - 1; }
    function draw() {
      MAST_TITLE = S.title;
      if (S.submitted) return done();
      var total = S.questions.length, q = S.questions[idx], n = answered(), all = n === total;
      chrome({ section: "Question " + pad(idx + 1) + " of " + pad(total), no: pad(idx + 1), left: S.name });
      var grid = '<div class="xgrid" aria-label="Jump to a question">' + S.questions.map(function (x, k) {
        return '<button type="button" class="xg' + (x.my != null ? " ok" : "") + (k === idx ? " here" : "") + '" data-j="' + k + '" aria-label="Question ' + (k + 1) + (x.my != null ? ", answered" : "") + '">' + (k + 1) + '</button>';
      }).join("") + '</div>';
      var send = all ? (confirmSend
          ? '<div class="plate stack xsend"><p style="margin:0"><b>Send your answers now?</b> You can’t change them after you send.</p><div class="row" style="gap:10px"><button class="btn big" data-x="send-yes">Send my answers</button><button class="btn line" data-x="send-no">Keep checking</button></div></div>'
          : '<button class="btn big block" data-x="send">All ' + total + ' answered · Send my answers</button>')
        : '<p class="muted xleft">' + (total - n) + ' still to answer. Send appears when every question has an answer.</p>';
      render('<div class="phone stack" style="gap:16px">' +
        '<div class="ptop"><span class="left"><span class="outline-n">' + pad(idx + 1) + '</span><span class="micro" style="padding-bottom:6px">of ' + total + '</span></span><span class="xcount"><b>' + n + '</b> of ' + total + ' answered</span></div>' +
        '<div class="xbar"><i style="width:' + (100 * n / total) + '%"></i></div>' +
        '<h2 class="qtext" style="font-size:21px">' + esc(q.q) + '</h2>' +
        (q.img ? '<div class="plate pimg" id="pimg" style="padding:10px"><img alt="Question picture, tap to enlarge" src="' + esc(q.img) + '"></div>' : "") +
        '<div class="answers">' + q.opts.map(function (o, i) {
          return '<button class="answer" data-i="' + i + '" aria-pressed="' + (q.my === i) + '"><span class="L outline-n">' + LETTERS[i] + '</span><span>' + esc(o) + '</span><span class="dia"></span></button>';
        }).join("") + '</div>' +
        '<div class="row spread" style="gap:10px"><button class="btn line" data-x="prev"' + (idx === 0 ? " disabled" : "") + '>Previous</button><button class="btn line" data-x="next"' + (idx === total - 1 ? " disabled" : "") + '>Next</button></div>' +
        send + '<p class="shead micro" style="margin:6px 0 0">All questions · tap a number to go back to it</p>' + grid + '</div>', true);
      var pq = document.getElementById("pimg"); if (pq) pq.addEventListener("click", function () { zoom(q.img); });
    }
    /* the ranking: the phone shows its place only at the end (everyone on the list sent, or HR closed the test) */
    function refresh() {
      clearTimeout(pollT);
      rpc("quiz_exam_state", { p_token: mine.token }).then(function (s) { S = s; done(); })
        .catch(function () { pollT = setTimeout(refresh, 10000); });
    }
    function done() {
      clearTimeout(pollT);
      var pct = Math.round(100 * S.score / S.total), win = S.place === 1;
      var row = function (dt, dd) { return '<div style="border-bottom-color:var(--n-hair)"><dt style="color:var(--gold)">' + dt + '</dt><dd style="color:var(--n-text)">' + dd + '</dd></div>'; };
      chrome({ section: S.place ? "Final ranking ◆" : "Sent ◆", no: "", closing: true, left: S.name });
      render('<div class="phone stack" style="gap:22px"><p class="kicker micro"><b></b>' + esc(S.title) + ' · ' + (S.place ? "Final ranking" : "Sent") + '</p>' +
        (S.place ? '<div class="prank' + (win ? " win" : "") + '">#' + S.place + '</div>' : "") +
        '<h1 class="end-hl">' + (win ? "Number one," : S.place && S.place <= 3 ? "Top three," : "Well done,") + '<b>' + esc(S.name.split(" ")[0]) + '.</b></h1>' + tick() +
        '<dl class="facts" style="border-top-color:var(--gold)">' +
        row("Your place", S.place ? '#' + S.place + ' of ' + S.ranked : '<span style="color:var(--n-muted)">Shows here when everyone has sent</span>') +
        row("Your score", S.score + ' of ' + S.total + ' · ' + pct + '%') +
        (S.secs != null ? row("Time taken", mins(S.secs)) : "") +
        row("HR ID", esc(S.hr_id)) + '</dl>' +
        '<p class="lead">' + (S.place ? "Ranked by right answers first, then by the quicker finish. " : "Your answers are with HR. Keep this page open: your place appears here at the end. ") + 'We go through the right answers together in the session.</p></div>');
      if (!S.place) pollT = setTimeout(refresh, 10000);
    }
    function go(j) { if (j < 0 || j >= S.questions.length) return; idx = j; confirmSend = false; draw(); window.scrollTo(0, 0); }
    function pick(i) {
      var q = S.questions[idx], before = q.my, at = idx;
      q.my = i; buzz(15); draw();
      saving[q.id] = (saving[q.id] || 0) + 1;
      rpc("quiz_exam_answer", { p_token: mine.token, p_qid: q.id, p_choice: i }).then(function () {
        saving[q.id]--;
        if (at === idx && before == null && idx < S.questions.length - 1) setTimeout(function () { if (at === idx) go(idx + 1); }, 380);
      }).catch(function (e) {
        saving[q.id]--; q.my = before; draw(); toast(e.message);
        if (/sign in again|already sent/i.test(e.message)) reload();
      });
    }
    function reload() {
      rpc("quiz_exam_state", { p_token: mine.token }).then(function (s) { S = s; if (idx >= s.questions.length) idx = 0; draw(); })
        .catch(function (e) { store(EXAM_KEY(id), null); mine = null; signIn(e.message); });
    }
    app.addEventListener("click", function (ev) {
      if (!S || S.submitted) return;
      var a = ev.target.closest(".answer"); if (a && app.contains(a)) return pick(+a.dataset.i);
      var g = ev.target.closest("[data-j]"); if (g) return go(+g.dataset.j);
      var x = ev.target.closest("[data-x]"); if (!x) return;
      var k = x.dataset.x;
      if (k === "prev") go(idx - 1); else if (k === "next") go(idx + 1);
      else if (k === "send") { confirmSend = true; draw(); }
      else if (k === "send-no") { confirmSend = false; draw(); }
      else if (k === "send-yes") {
        if (Object.keys(saving).some(function (s) { return saving[s] > 0; })) { toast("Saving your last answer. Try again in a second."); return; }
        x.disabled = true; x.textContent = "Sending";
        rpc("quiz_exam_submit", { p_token: mine.token }).then(function (r) { S.submitted = true; S.score = r.score; S.total = r.total; buzz([40, 40, 40]); done(); window.scrollTo(0, 0); refresh(); })
          .catch(function (e) { toast(e.message); confirmSend = false; reload(); });
      }
    });
    document.addEventListener("keydown", function (ev) {
      if (!S || S.submitted || /input|textarea/i.test(ev.target.tagName || "")) return;
      if (ev.key === "ArrowRight") go(idx + 1); else if (ev.key === "ArrowLeft") go(idx - 1);
    });
    if (mine && mine.token) {
      chrome({ section: "Loading", no: "" }); render('<div class="phone stack">' + waiting("Opening your test") + '</div>');
      rpc("quiz_exam_state", { p_token: mine.token }).then(function (s) {
        if (s.quiz_id !== id) throw new Error("");
        S = s; idx = firstOpen(); draw();
      }).catch(function () { store(EXAM_KEY(id), null); mine = null; signIn(); });
    } else signIn();
  }

  /* ---------- route ---------- */
  if (!params.has("preview") && !params.has("admin") && !params.has("exam") && (!params.has("host") || !(params.get("host") || "").replace(/\D/g, ""))) splash();
  if (params.has("exam")) exam(params.get("exam"));
  else if (params.has("join")) player(params.get("join").replace(/\D/g, ""));
  else if (params.has("host")) { var hc = (params.get("host") || "").replace(/\D/g, ""); if (hc.length === 6) hostRun(hc); else hostSetup(); }
  else if (params.has("preview")) preview(params.get("preview"));
  else if (params.has("admin")) admin();
  else landing();
})();
