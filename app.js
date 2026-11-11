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
  function picOnly(opts) { return opts.every(function (x, j) { return x === LETTERS[j]; }); }
  function pad(n) { return String(n).padStart(2, "0"); }
  function fmtCode(c) { return String(c).slice(0, 3) + " " + String(c).slice(3); }
  var UPLOAD_URL = SB_URL + "/functions/v1/quiz-upload";
  var STILL = false;
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
    document.getElementById("mastSub").textContent = o.host ? "Human Resources · Talent Acquisition · Hosted by " + o.host : "Human Resources · Talent Acquisition · Head Office";
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
      '<div id="hostErr" class="error" hidden></div><div id="pick">' + waiting("Loading the quizzes") + '</div>' +
      '<p class="muted" style="margin:0;font-size:14px">Preview as admin shows every question with its answer before you open the room. Players never see it. <a href="?admin">Quiz admin</a></p></div>');
    rpc("quiz_catalog", {}).then(function (list) {
      if (!list.length) { document.getElementById("pick").innerHTML = '<p class="callout">No quizzes are visible yet. Add one in <a href="?admin">Quiz admin</a>.</p>'; return; }
      document.getElementById("pick").innerHTML = '<div class="picker stag">' + list.map(function (q, k) {
        return '<div class="qopt" role="group" aria-label="' + esc(q.title) + '" style="--i:' + k + '" data-id="' + esc(q.id) + '">' +
          '<span class="top"><span class="outline-n">' + pad(k + 1) + '</span><span class="micro" style="flex:1;padding-bottom:6px">' + esc(q.subtitle || "") + '</span></span>' +
          '<span class="thumb">' + (q.thumb ? '<img alt="" src="' + esc(q.thumb) + '">' : "") + '</span><h3>' + esc(q.title) + '</h3><p>' + esc(q.blurb || "") + '</p>' +
          '<span class="meta-line">' + q.count + ' question' + (q.count === 1 ? "" : "s") + ' · about ' + estMinutes(q.count, q.secs) + ' min</span>' +
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
      var it = data.questions[idx], num = pad(idx + 1);
      chrome({ section: "Admin preview · " + num + " of " + pad(total), no: num, left: "Not visible to players" });
      var opts = '<div class="opts stag">' + it.opts.map(function (o, i) {
        var c = i === it.correct;
        return '<div class="opt' + (c ? " correct" : " dim") + '" style="--i:' + i + '"><span class="L outline-n">' + LETTERS[i] + '</span><span>' + (picOnly(it.opts) ? "" : esc(o)) + '</span><span>' + (c ? '<span class="micro">Correct</span>' : "") + '</span></div>';
      }).join("") + '</div>';
      var route = total <= 12 ? '<div class="route prev-route">' + data.questions.map(function (_, j) {
        return '<div class="' + (j < idx ? "done" : j === idx ? "here" : "") + '" data-j="' + j + '" role="button" tabindex="0" aria-label="Question ' + (j + 1) + '"><span class="n outline-n">' + pad(j + 1) + '</span><span class="dot"></span></div>';
      }).join("") + '</div>' : "";
      var img = showReveal && it.reveal ? it.reveal : it.img;
      render('<div class="stack" style="gap:20px">' +
        '<div class="row spread" style="gap:16px"><p class="kicker-light micro" style="margin:0"><i class="dia on"></i> Admin preview · ' + esc(data.title) + '</p>' +
        '<div class="row" style="gap:10px"><a class="btn line" href="?admin&quiz=' + encodeURIComponent(id) + '">Edit in admin</a><a class="btn line" href="?host">All quizzes</a><button class="btn big" id="goLive">Open the room and show the QR</button></div></div>' +
        route +
        '<div class="two"><div class="stack"><div class="plate figure sm">' + (img ? '<img alt="Question picture" src="' + esc(img) + '">' : '<p class="muted">No picture</p>') + '</div>' +
        (it.reveal ? '<div><button class="btn line" id="flip">' + (showReveal ? "Show the question picture" : "Show the answer picture") + '</button></div>' : "") + '</div>' +
        '<div class="stack"><div class="qhead"><span class="outline-n">' + num + '</span><span class="micro" style="padding-bottom:8px">' + esc(it.tag || "Question") + ' · of ' + total + '</span></div>' +
        '<h2 class="qtext">' + esc(it.q) + '</h2>' + opts +
        '<p class="callout explain"><b>' + esc(it.answer) + '.</b> ' + esc(it.explanation) + '</p>' +
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
    function load(after) {
      if (!adminToken()) return adminLogin("to quiz admin", function () { load(after); });
      adminCall("quiz_admin_data").then(function (d) {
        D = d;
        if (selId !== "__new" && (!selId || !d.quizzes.some(function (z) { return z.id === selId; }))) selId = d.quizzes[0] ? d.quizzes[0].id : "__new";
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
        return '<button type="button" class="qitem' + (q.id === selId ? " on" : "") + '" data-sel="' + esc(q.id) + '"><span class="t">' + esc(q.title) + '</span><span class="m">' + q.questions.length + ' question' + (q.questions.length === 1 ? "" : "s") + ' · ' + (q.active ? "Visible" : "Hidden") + '</span></button>';
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
        '<div class="frow">' + field("zSort", "Order in the list", z.sort, { type: "number", min: 0, max: 9999, help: "Lower numbers come first" }) +
        '<label class="check"><input type="checkbox" id="zActive"' + (z.active ? " checked" : "") + '> <span>Visible in the host picker</span></label></div>' +
        '<div class="row spread" style="gap:10px"><div class="row" style="gap:10px"><button class="btn" data-act="save-quiz">' + (isNew ? "Create quiz" : "Save quiz") + '</button>' +
        (isNew ? '<button class="btn line" data-act="cancel-new">Cancel</button>' : '<a class="btn line" href="?preview=' + encodeURIComponent(z.id) + '">Preview</a>') + '</div>' + del + '</div></div>';
    }
    function questionsHtml(z) {
      var tags = {}; D.quizzes.forEach(function (q) { q.questions.forEach(function (x) { if (x.tag) tags[x.tag] = 1; }); });
      var dl = '<datalist id="tagList">' + Object.keys(tags).sort().map(function (t) { return '<option value="' + esc(t) + '">'; }).join("") + '</datalist>';
      var total = z.questions.reduce(function (s, x) { return s + x.secs; }, 0);
      var head = '<div class="row spread"><p class="shead micro" style="flex:1">Questions · ' + z.questions.length + ' · about ' + estMinutes(z.questions.length, total) + ' min</p>' +
        (ed ? "" : '<button class="btn" data-act="new-q">Add a question</button>') + '</div>';
      var editor = ed && ed.isNew ? editorHtml(ed, z) : "";
      var rows = z.questions.map(function (x, i) {
        if (ed && !ed.isNew && ed.id === x.id) return editorHtml(ed, z);
        var conf = confirmKey === "q:" + x.id;
        return '<div class="qrow" data-qid="' + x.id + '"><span class="n outline-n">' + pad(i + 1) + '</span>' +
          '<span class="th">' + (x.img ? '<img alt="" src="' + esc(x.img) + '">' : "") + '</span>' +
          '<span class="body"><b>' + esc(x.q) + '</b><span class="meta">Answer ' + esc(x.answer) + ' · ' + x.secs + ' s' + (x.tag ? " · " + esc(x.tag) : "") + (x.reveal ? " · answer picture" : "") + '</span></span>' +
          (conf ? '<span class="acts confirm">Delete? <button class="btn danger sm" data-act="del-q-yes" data-id="' + x.id + '">Delete</button><button class="btn line sm" data-act="cancel-confirm">Keep</button></span>'
            : '<span class="acts"><button class="ibtn" data-act="up" data-i="' + i + '" aria-label="Move up"' + (i === 0 ? " disabled" : "") + '>&#8593;</button><button class="ibtn" data-act="down" data-i="' + i + '" aria-label="Move down"' + (i === z.questions.length - 1 ? " disabled" : "") + '>&#8595;</button>' +
              '<button class="btn line sm" data-act="edit-q" data-id="' + x.id + '">Edit</button><button class="btn line sm danger-line" data-act="del-q" data-id="' + x.id + '">Delete</button></span>') + '</div>';
      }).join("");
      return '<div class="stack" style="gap:12px">' + dl + head + editor + (rows ? '<div class="qrows">' + rows + '</div>' : (ed ? "" : '<p class="callout">No questions yet. Add the first one.</p>')) + '</div>';
    }
    function editorHtml(x, z) {
      var n = x.opts.length;
      var opts = x.opts.map(function (o, i) {
        return '<div class="optrow"><label class="radio"><input type="radio" name="fCorrect" value="' + i + '"' + (x.correct === i ? " checked" : "") + '><span class="L outline-n">' + LETTERS[i] + '</span></label>' +
          '<input class="input fopt" data-i="' + i + '" maxlength="120" value="' + esc(o) + '" placeholder="Option ' + LETTERS[i] + '">' +
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
        field("fQ", "Question", x.q, { area: true, rows: 2, max: 300 }) +
        '<div class="frow">' + field("fTag", "Label or level", x.tag, { list: "tagList", max: 40, ph: "e.g. Easy, Logic" }) +
        '<div class="field"><label for="fSecs">Time limit (seconds)</label><div class="row" style="gap:8px"><input id="fSecs" class="input" type="number" min="5" max="300" value="' + x.secs + '" style="max-width:110px">' +
        [10, 15, 20, 30, 45, 60].map(function (s) { return '<button class="chipbtn' + (x.secs === s ? " on" : "") + '" data-act="secs" data-s="' + s + '">' + s + '</button>'; }).join("") + '</div></div></div>' +
        '<div class="field"><label>Answer options · tick the correct one</label><div class="opts-ed">' + opts + '</div>' +
        (n < 4 ? '<div><button class="btn line sm" data-act="add-opt">Add an option</button></div>' : "") + '</div>' +
        field("fExp", "Explanation shown after the answer", x.explanation, { area: true, rows: 3, max: 600 }) +
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
      ed.opts = [].map.call(app.querySelectorAll(".fopt"), function (el) { return el.value; });
      var c = app.querySelector('input[name="fCorrect"]:checked'); ed.correct = c ? +c.value : -1;
    }

    /* ----- rooms tab ----- */
    function roomsHtml() {
      if (!D.rooms.length) return '<p class="callout">No rooms yet. Rooms appear here when a host opens a quiz.</p>';
      return '<div class="row spread"><p class="shead micro" style="flex:1">Rooms · newest first</p><button class="btn line sm" data-act="refresh">Refresh</button></div>' +
        '<div class="rtable"><div class="rhead"><span>Code</span><span>Quiz</span><span>Host</span><span>Status</span><span>Progress</span><span>Players</span><span>Opened</span><span></span></div>' +
        D.rooms.map(function (r) {
          var conf = confirmKey === "room:" + r.code;
          var st = { lobby: "Waiting", question: "Live", reveal: "Live", finished: "Finished" }[r.status] || r.status;
          return '<div class="rrow"><span class="code">' + fmtCode(r.code) + '</span><span>' + esc(r.quiz_title || r.quiz_id) + '</span><span>' + esc(r.host) + '</span>' +
            '<span><span class="st st-' + r.status + '">' + st + '</span></span><span>' + (r.q_index < 0 ? "Not started" : Math.min(r.q_index + 1, r.total) + " of " + r.total) + '</span>' +
            '<span>' + r.players + '</span><span class="muted">' + ago(r.created_at) + '</span>' +
            (conf ? '<span class="acts confirm">Delete? <button class="btn danger sm" data-act="room-del-yes" data-code="' + r.code + '">Delete</button><button class="btn line sm" data-act="cancel-confirm">Keep</button></span>'
              : '<span class="acts">' + (r.status !== "finished" ? '<button class="btn line sm" data-act="room-end" data-code="' + r.code + '">End</button>' : "") + '<button class="btn line sm danger-line" data-act="room-del" data-code="' + r.code + '">Delete</button></span>') + '</div>';
        }).join("") + '</div>';
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
      chrome({ section: "Quiz admin", no: "", left: "Admin" });
      var tabsHtml = '<div class="atabs" role="tablist">' + [["quizzes", "Quizzes"], ["rooms", "Rooms"], ["settings", "Settings"]].map(function (t) {
        return '<button role="tab" class="atab' + (tab === t[0] ? " on" : "") + '" aria-selected="' + (tab === t[0]) + '" data-tab="' + t[0] + '">' + t[1] + '</button>';
      }).join("") + '</div>';
      var body = tab === "rooms" ? roomsHtml() : tab === "settings" ? settingsHtml() : quizzesHtml();
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
      if (t.dataset.tab) { collect(); tab = t.dataset.tab; confirmKey = null; draw(); if (tab === "rooms") load(); return; }
      if (t.dataset.sel) { selId = t.dataset.sel; ed = null; confirmKey = null; draw(); return; }
      var act = t.dataset.act, z = cur();
      ev.preventDefault();
      if (act === "new-quiz") { selId = "__new"; ed = null; draw(); }
      else if (act === "cancel-new") { selId = null; load(); }
      else if (act === "cancel-confirm") { confirmKey = null; draw(); }
      else if (act === "save-quiz") {
        busy(t, true);
        var p = { id: selId === "__new" ? "" : selId, title: document.getElementById("zTitle").value, subtitle: document.getElementById("zSub").value,
          blurb: document.getElementById("zBlurb").value, sort: document.getElementById("zSort").value || null, active: document.getElementById("zActive").checked };
        if (p.sort === null) delete p.sort;
        adminCall("quiz_admin_save_quiz", { p: p }).then(function (r) { selId = r.id; toast("Quiz saved"); load(); }).catch(function (e) { busy(t, false); toast(e.message); });
      }
      else if (act === "del-quiz") { confirmKey = "quiz:" + selId; draw(); }
      else if (act === "del-quiz-yes") { adminCall("quiz_admin_delete_quiz", { p_id: selId }).then(function () { toast("Quiz deleted"); selId = null; confirmKey = null; load(); }).catch(function (e) { toast(e.message); }); }
      else if (act === "new-q") { ed = { isNew: true, q: "", tag: "", secs: 20, opts: ["", "", ""], correct: -1, explanation: "", img: "", reveal: "" }; draw(); document.getElementById("fQ").focus(); }
      else if (act === "edit-q") { var x = z.questions.filter(function (q) { return q.id === t.dataset.id; })[0]; ed = JSON.parse(JSON.stringify(x)); ed.opts = ed.opts.slice(); draw(); document.getElementById("qEditor").scrollIntoView({ block: "center" }); }
      else if (act === "cancel-q") { ed = null; draw(); }
      else if (act === "add-opt") { collect(); if (ed.opts.length < 4) ed.opts.push(""); draw(); }
      else if (act === "rm-opt") { collect(); var i = +t.dataset.i; ed.opts.splice(i, 1); if (ed.correct === i) ed.correct = -1; else if (ed.correct > i) ed.correct--; draw(); }
      else if (act === "secs") { collect(); ed.secs = +t.dataset.s; draw(); }
      else if (act === "clear-pic") { collect(); if (t.dataset.k === "Img") ed.img = ""; else ed.reveal = ""; draw(); }
      else if (act === "save-q") {
        collect(); busy(t, true);
        var payload = { id: ed.isNew ? "" : ed.id, quiz_id: selId, q: ed.q, tag: ed.tag, secs: ed.secs, opts: ed.opts, correct: ed.correct, explanation: ed.explanation, img: ed.img, reveal: ed.reveal };
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
    var S = null, acting = false, startLocal = 0, lastSig = "", lastDraw = "", seen = {}, lastAns = -1, lastTick = null, revealedAt = null, lobbyDrawn = false, animSig = "";
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
      rpc("quiz_host_action", { p_code: code, p_host_key: key, p_action: action, p_from: S.q_index })
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
      var q = { title: S.quiz_title || "Quiz" }, joinTag = "Join " + fmtCode(code), tp = titleParts(q.title);
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
        lastAns = S.answered; lastTick = null;
        render('<div class="stack" style="gap:22px">' + routeHtml(S.q_index, S.total) +
          '<div class="two' + (hold ? " hold" : " anim") + '" id="qbody"><div class="plate figure"><img alt="Question picture" src="' + esc(item.img) + '"></div>' +
          '<div class="stack"><div class="qhead"><span class="outline-n">' + pad(S.q_index + 1) + '</span><span class="micro" style="padding-bottom:8px">' + esc(item.tag) + ' · of ' + S.total + '</span></div>' +
          '<h2 class="qtext">' + esc(item.q) + '</h2>' + optsHtml(item, false) +
          '<div class="strip"><div><span class="micro">Time left</span><span class="v" id="left">' + S.duration + '</span></div><div><span class="micro">Answered</span><span class="v" id="ans">' + S.answered + " / " + S.players.length + '</span></div></div>' +
          '<div class="timeline" id="tl" style="width:100%"></div>' +
          '<div><button class="btn line" id="reveal">Reveal the answer</button></div></div></div></div>');
        document.getElementById("reveal").addEventListener("click", function () { act("reveal", this); });
      } else if (S.status === "reveal") {
        var it = S.question || { q: "", opts: [], img: "", tag: "" }, last = S.q_index + 1 >= S.total;
        chrome({ host: S.host, section: "Answer " + pad(S.q_index + 1) + " of " + pad(S.total), no: pad(S.q_index + 1), left: joinTag });
        render('<div class="stack" style="gap:22px">' + routeHtml(S.q_index, S.total) +
          '<div class="two"><div class="stack"><div class="plate figure sm"><img alt="Answer picture" src="' + esc(S.reveal || it.img) + '"></div>' +
          '<p class="callout explain"><b>' + esc(S.answer) + '.</b> ' + esc(S.explanation) + '</p></div>' +
          '<div class="stack"><div class="qhead"><span class="outline-n">' + pad(S.q_index + 1) + '</span><span class="micro" style="padding-bottom:8px">The answer</span></div>' +
          '<h2 class="qtext">' + esc(it.q) + '</h2>' + optsHtml(it, true) +
          '<dl class="facts"><div><dt>Fastest correct</dt><dd>' + (S.fastest ? "<b>" + esc(S.fastest.name) + "</b> · " + secs(S.fastest.ms) : "Nobody this time. A tricky one!") + '</dd></div></dl>' +
          ((S.gomode || []).length ? '<p class="shead micro">Go mode</p><div class="gm-list">' + S.gomode.slice(0, 6).map(function (g, k) { return '<span style="animation-delay:' + (0.5 + k * 0.12) + 's"><i class="dia on"></i>' + esc(g.name) + ' <b>' + g.streak + ' in a row</b></span>'; }).join("") + '</div>' : "") +
          '<p class="shead micro">Ranking so far</p>' + boardHtml(S.board || [], S.total, 3) +
          '<div><button class="btn big" id="next">' + (last ? "Show the final ranking" : "Next question") + '</button></div></div></div></div>');
        document.getElementById("next").addEventListener("click", function () { act("next", this); });
        if (revealedAt !== S.q_index) { revealedAt = S.q_index; setTimeout(SFX.reveal, 150); if ((S.gomode || []).length) setTimeout(SFX.rise, 700); }
      } else {
        var b = S.board || [], w = b[0];
        chrome({ host: S.host, section: "Final ranking ◆", no: "", left: S.players.length + " players", closing: true });
        var plate = function (r, cls) {
          if (!r) return '<div></div>';
          return '<div class="gplate ' + cls + '"><div class="rank">' + r.rank + '</div><div class="who">' + esc(r.name) + '</div><div class="sub">' + r.correct + "/" + S.total + " correct · " + secs(r.ms) + '</div>' +
            (r.rank === 1 ? '<div class="gift">' + GIFT + 'Wins the gift</div>' : "") + '</div>';
        };
        render('<div class="stack seq" style="gap:34px"><div class="end-hero"><div><p class="kicker micro"><b></b>' + esc(q.title) + ' · Complete</p>' +
          '<h1 class="end-hl" style="margin-top:18px"><span>' + (w ? "The winner is" : "No winner") + '</span><b>' + (w ? esc(w.name) + "." : "this time.") + '</b></h1>' + tick() +
          '<p class="lead">' + S.players.length + ' players, ' + S.total + ' questions. Ranked by correct answers first, then by the fastest total time.</p></div>' +
          (w ? '<div class="stamp"><div><span class="micro">Number one</span><strong>The gift</strong>' + GIFT + '</div></div>' : "") + '</div>' +
          '<div class="podium">' + plate(b[1], "p2") + plate(b[0], "p1") + plate(b[2], "p3") + '</div>' +
          '<div class="rest stack" style="gap:30px">' + (b.length > 3 ? '<div class="stack" style="max-width:820px;width:100%;margin:0 auto"><p class="kicker micro"><b></b>Places 4 to ' + Math.min(10, b.length) + '</p>' + boardHtml(b.slice(3), S.total, 7) + '</div>' : "") +
          '<div class="row" style="justify-content:center"><a class="btn line" href="?host">Start a new session</a></div></div></div>');
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
        var full = sig + "|" + (s.status === "lobby" ? s.players.length : "") + (s.status === "finished" || s.status === "reveal" ? JSON.stringify(s.board) : "");
        S = s; lastSig = sig;
        if (full !== lastDraw) { lastDraw = full; draw(); window.scrollTo(0, 0); }
        else if (s.status === "question") { var a = document.getElementById("ans"); if (a) { a.textContent = s.answered + " / " + s.players.length; if (s.answered !== lastAns) { lastAns = s.answered; a.classList.remove("tickn"); void a.offsetWidth; a.classList.add("tickn"); SFX.blip(); } } }
      }).catch(function (e) {
        if (/not found/i.test(e.message)) { poll.stop(); render('<div class="phone stack">' + hl("Room", "not found.", "sm") + '<p class="lead">' + esc(e.message) + '</p><div><a class="btn" href="?host">Open a new room</a></div></div>'); }
      });
    }, 1000);
  }

  /* ---------- player ---------- */
  function player(code) {
    var me = store("satoquiz:player:" + code);
    if (!me) return joinForm(code);
    var S = null, lastKey = "", startLocal = 0, picking = false, pending = null, cdFired = {}, animSig = "", flashed = {};
    function draw() {
      var q = { title: S.quiz_title || "Quiz" };
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
        var hold = Date.now() < startLocal;
        render('<div class="phone stack' + (hold ? " hold" : (still ? "" : " anim")) + '" id="qbody" style="gap:14px"><div class="ptop"><span class="left"><span class="outline-n">' + pad(S.q_index + 1) + '</span><span class="micro" style="padding-bottom:6px">of ' + S.total + '</span></span><span class="secs" id="secs">' + S.duration + ' s</span></div>' +
          '<div class="timeline" id="tl" style="width:100%"></div><h2 class="qtext" style="font-size:22px">' + esc(item.q) + '</h2>' +
          '<div class="plate pimg" id="pimg" style="padding:10px"><img alt="Question picture, tap to enlarge" src="' + esc(item.img) + '"></div>' +
          '<div class="answers">' + item.opts.map(function (o, i) {
            return '<button class="answer" style="--i:' + i + '" data-i="' + i + '" aria-pressed="' + (mine === i) + '"' + (mine != null ? " disabled" : "") + '><span class="L outline-n">' + LETTERS[i] + '</span><span>' + (picOnly(item.opts) ? "Picture " + LETTERS[i] : esc(o)) + '</span><span class="dia"></span></button>';
          }).join("") + '</div><div id="lock">' + (mine != null ? waiting("Answer " + LETTERS[mine] + " is locked in") : "") + '</div></div>');
        document.getElementById("pimg").addEventListener("click", function () { zoom(item.img); });
        app.querySelectorAll(".answer").forEach(function (b) { b.addEventListener("click", function () { pick(+b.dataset.i); }); });
      } else if (S.status === "reveal") {
        var it = { reveal: S.reveal }, cls, head;
        chrome({ host: S.host, section: "Answer " + pad(S.q_index + 1) + " of " + pad(S.total), no: pad(S.q_index + 1) });
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
      } else {
        var rank = S.my_rank, win = rank === 1, top = S.top || [];
        chrome({ host: S.host, section: "Final ranking ◆", no: "", closing: true });
        render('<div class="phone stack" style="gap:22px"><p class="kicker micro"><b></b>' + esc(q.title) + ' · Complete</p>' +
          '<div class="row spread" style="align-items:flex-end"><div class="prank' + (win ? " win" : "") + '">#' + rank + '</div>' +
          (win ? '<div class="stamp slam" style="width:118px;height:118px"><div><span class="micro">Number one</span><strong style="font-size:22px">The gift</strong>' + GIFT + '</div></div>' : "") + '</div>' +
          '<h1 class="end-hl">' + (win ? "You win" : rank <= 3 ? "Top three," : "Thanks for playing,") + '<b>' + (win ? "the gift." : rank <= 3 ? "well done." : esc(S.name.split(" ")[0]) + ".") + '</b></h1>' + tick() +
          '<p class="lead">' + (win ? "Show this screen to " + esc(S.host) + " to collect your gift." : "You finished #" + rank + " of " + S.players + ". The gift goes to number one.") + '</p>' +
          '<dl class="facts" style="border-top-color:var(--gold)"><div style="border-bottom-color:var(--n-hair)"><dt style="color:var(--gold)">Correct</dt><dd style="color:var(--n-text)">' + S.my_score + " of " + S.total + '</dd></div>' +
          '<div style="border-bottom-color:var(--n-hair)"><dt style="color:var(--gold)">Total time</dt><dd style="color:var(--n-text)">' + secs(S.my_total_ms) + '</dd></div></dl>' +
          '<p class="kicker micro"><b></b>Top three</p>' + boardHtml(top, S.total, 3) + '</div>');
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
      if (left <= 0 && S.my_choice == null && pending == null) {
        app.querySelectorAll(".answer").forEach(function (b) { b.disabled = true; });
        var lk = document.getElementById("lock"); if (lk && !lk.innerHTML) lk.innerHTML = waiting("Time is up");
      }
    }
    setInterval(tickTimer, 200);
    var poll = poller(function () {
      return rpc("quiz_player_state", { p_code: code, p_token: me.token }).then(function (s) {
        var key = s.status + "|" + s.q_index + "|" + (s.status === "lobby" ? s.players : "") + "|" + (s.my_choice != null ? s.my_choice : "");
        if (s.status === "question" && (!S || S.status !== "question" || S.q_index !== s.q_index)) { startLocal = Date.now() - (s.elapsed_ms || 0); pending = null; }
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

  /* ---------- route ---------- */
  if (!params.has("preview") && !params.has("admin") && (!params.has("host") || !(params.get("host") || "").replace(/\D/g, ""))) splash();
  if (params.has("join")) player(params.get("join").replace(/\D/g, ""));
  else if (params.has("host")) { var hc = (params.get("host") || "").replace(/\D/g, ""); if (hc.length === 6) hostRun(hc); else hostSetup(); }
  else if (params.has("preview")) preview(params.get("preview"));
  else if (params.has("admin")) admin();
  else landing();
})();
