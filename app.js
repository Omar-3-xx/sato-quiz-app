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
  function pad(n) { return String(n).padStart(2, "0"); }
  function fmtCode(c) { return String(c).slice(0, 3) + " " + String(c).slice(3); }
  function quiz(id) { return window.QUIZZES[id]; }
  function render(html) { app.innerHTML = html; }
  function toast(msg) { var t = document.createElement("div"); t.className = "toast"; t.textContent = msg; document.body.appendChild(t); setTimeout(function () { t.remove(); }, 3200); }
  function waiting(text) { return '<div class="waiting"><span class="dots"><i></i><i></i><i></i></span>' + esc(text) + '</div>'; }
  function tick() { return '<div class="tick"><i></i><i></i><i></i></div>'; }
  function hl(light, bold, cls) { return '<h1 class="hl' + (cls ? " " + cls : "") + '">' + esc(light) + '<b>' + esc(bold) + '</b></h1>'; }
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
      return '<rect x="' + (cx - a) + '" y="' + (cy - a) + '" width="' + tile + '" height="' + tile + '" fill="' + fill + '" stroke="' + deep + '" stroke-width="1"/>' +
        '<rect x="' + (cx - b) + '" y="' + (cy - b) + '" width="' + 2 * b + '" height="' + 2 * b + '" fill="none" stroke="' + light + '" stroke-width=".5"/>' +
        '<polygon points="' + cx + "," + (cy - r) + " " + (cx + r) + "," + cy + " " + cx + "," + (cy + r) + " " + (cx - r) + "," + cy + '" fill="' + deep + '"/>';
    }
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.innerHTML = '<defs><path id="fl" d="M ' + (mid + half) + " " + (H - start) + " L " + (mid + half) + " " + start + '"/><path id="fr" d="M ' + (W - mid - half) + " " + start + " L " + (W - mid - half) + " " + (H - start) + '"/></defs>' +
      '<rect x="' + o + '" y="' + o + '" width="' + (W - 2 * o) + '" height="' + (H - 2 * o) + '" fill="none" stroke="' + deep + '" stroke-width="1"/>' +
      '<rect x="' + i + '" y="' + i + '" width="' + (W - 2 * i) + '" height="' + (H - 2 * i) + '" fill="none" stroke="' + light + '" stroke-width=".5"/>' +
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
    var x0 = ((w / 2 - wl / 2) % wl) - wl;
    for (var x = x0; x < w; x += wl) {
      up += "M" + x.toFixed(2) + " " + m + "Q" + (x + wl / 4).toFixed(2) + " " + (m - amp).toFixed(2) + " " + (x + wl / 2).toFixed(2) + " " + m + "T" + (x + wl).toFixed(2) + " " + m;
      dn += "M" + x.toFixed(2) + " " + m + "Q" + (x + wl / 4).toFixed(2) + " " + (m + amp).toFixed(2) + " " + (x + wl / 2).toFixed(2) + " " + m + "T" + (x + wl).toFixed(2) + " " + m;
    }
    svg.setAttribute("viewBox", "0 0 " + w + " " + h); svg.setAttribute("preserveAspectRatio", "none");
    svg.innerHTML = '<path d="' + up + '"/><path d="' + dn + '"/>';
  }
  var rsz; window.addEventListener("resize", function () { clearTimeout(rsz); rsz = setTimeout(function () { drawFrame(); drawBand(); }, 120); });

  var GIFT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" aria-hidden="true"><rect x="3" y="8" width="18" height="4"/><path d="M12 8v13M19 12v9H5v-9"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/></svg>';
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
    return '<div class="board">' + rows.slice(0, limit).map(function (r) {
      return '<div class="brow' + (r.rank === 1 ? " first" : "") + '"><span class="pos outline-n">' + r.rank + '</span><span class="nm">' + esc(r.name) + '</span><span class="sc">' + r.correct + "/" + total + '</span><span class="tm">' + secs(r.ms) + '</span></div>';
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
  function hostSetup() {
    chrome({ section: "Host a session", no: "00" });
    var chosen = window.QUIZ_ORDER[0], hostName = store("satoquiz:hostname") || "Yomna";
    var thumbs = { "rep-brain-test": 3, "mind-tricks-short": 1, "mind-tricks-full": 30 };
    var cards = window.QUIZ_ORDER.map(function (id, k) {
      var q = quiz(id), mins = Math.round(q.items.length * (id === "rep-brain-test" ? 1.4 : 0.9));
      return '<button type="button" class="qopt" data-id="' + id + '" aria-pressed="' + (id === chosen) + '">' +
        '<span class="top"><span class="outline-n">' + pad(k + 1) + '</span><span class="micro" style="flex:1;padding-bottom:6px">' + esc(q.subtitle) + '</span><span class="dia" style="margin-bottom:10px"></span></span>' +
        '<span class="thumb"><img alt="" src="' + esc(q.items[thumbs[id]].img) + '"></span><h3>' + esc(q.title) + '</h3><p>' + esc(q.blurb) + '</p>' +
        '<dl class="facts" style="margin-top:4px"><div><dt>Questions</dt><dd>' + q.items.length + '</dd></div><div><dt>About</dt><dd>' + mins + ' minutes</dd></div></dl></button>';
    }).join("");
    render('<div class="stack" style="gap:26px">' + chapter("00", "Host a session") + hl("Choose", "the quiz.", "sm") +
      '<div class="picker">' + cards + '</div>' +
      '<div class="row spread" style="align-items:flex-end;border-top:1px solid var(--hair);padding-top:22px">' +
      '<div class="field" style="flex:1;min-width:240px;max-width:380px"><label for="hostName">Host name shown on screens</label><input id="hostName" class="input" maxlength="40" value="' + esc(hostName) + '"></div>' +
      '<div class="stack" style="gap:8px;align-items:flex-end"><div id="hostErr" class="error" hidden></div><button id="create" class="btn big">Open the quiz room</button></div></div></div>');
    app.querySelectorAll(".qopt").forEach(function (b) {
      b.addEventListener("click", function () { chosen = b.dataset.id; app.querySelectorAll(".qopt").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); });
    });
    document.getElementById("create").addEventListener("click", function () {
      var btn = this, name = document.getElementById("hostName").value.trim() || "Yomna";
      btn.disabled = true; store("satoquiz:hostname", name);
      rpc("quiz_create_session", { p_quiz: chosen, p_host: name }).then(function (r) {
        store("satoquiz:host:" + r.code, r.host_key); location.search = "?host=" + r.code;
      }).catch(function (e) { btn.disabled = false; var er = document.getElementById("hostErr"); er.hidden = false; er.textContent = e.message; });
    });
  }

  /* ---------- host live ---------- */
  function hostRun(code) {
    var key = store("satoquiz:host:" + code);
    if (!key) {
      chrome({ section: "Host", no: "" });
      render('<div class="phone stack">' + hl("This room was opened", "on another device.", "sm") + tick() + '<p class="lead">Host controls only work in the browser that opened the room. Open a new room to continue.</p><div><a class="btn" href="?host">Open a new room</a></div></div>');
      return;
    }
    var S = null, acting = false, startLocal = 0, lastSig = "", lastDraw = "";
    var joinUrl = BASE + "?join=" + code;
    function act(action) {
      if (acting || !S) return; acting = true;
      rpc("quiz_host_action", { p_code: code, p_host_key: key, p_action: action, p_from: S.q_index })
        .catch(function (e) { toast(e.message); }).then(function () { acting = false; poll.now(); });
    }
    function optsHtml(item, reveal) {
      var total = 0, dist = S.dist || {};
      Object.keys(dist).forEach(function (k) { total += dist[k]; });
      return '<div class="opts">' + item.opts.map(function (o, i) {
        var n = dist[String(i)] || 0, pct = total ? n / total : 0;
        var cls = reveal ? (i === S.correct ? " correct" : " dim") : "";
        return '<div class="opt' + cls + '"><span class="L outline-n">' + LETTERS[i] + '</span><span>' + esc(o) + '</span>' +
          (reveal ? '<span class="count">' + n + '</span><span class="bar" style="width:calc((100% - 64px) * ' + pct.toFixed(3) + ')"></span>' : "<span></span>") + '</div>';
      }).join("") + '</div>';
    }
    function draw() {
      var q = quiz(S.quiz_id), joinTag = "Join " + fmtCode(code), tp = titleParts(q.title);
      if (S.status === "lobby") {
        chrome({ host: S.host, section: "The room is open", no: "00", left: joinTag });
        render('<div class="two">' +
          '<div class="plate stack" style="align-items:center;padding:26px"><p class="micro" style="margin:0">Scan to join</p><div class="qr">' + qrSvg(joinUrl) + '</div>' +
          '<p class="micro" style="margin:0;color:var(--muted)">or open the link and type the code</p><div class="bigcode">' + fmtCode(code) + '</div><div class="url">' + esc(joinUrl) + '</div></div>' +
          '<div class="stack" style="gap:20px">' + chapter(pad(S.players.length), "Players in the room") + hl(tp[0], tp[1], "sm") +
          (S.players.length ? '<div class="names">' + S.players.map(function (p) { return '<span><i class="dia"></i><span class="nm">' + esc(p) + '</span></span>'; }).join("") + '</div>' : waiting("Waiting for the first player")) +
          '<p class="callout">Most correct answers first, then the fastest total time on correct answers. Only number one wins the gift.</p>' +
          '<div><button class="btn big" id="start"' + (S.players.length ? "" : " disabled") + '>Start the quiz</button></div></div></div>');
        document.getElementById("start").addEventListener("click", function () { act("next"); });
      } else if (S.status === "question") {
        var item = q.items[S.q_index];
        chrome({ host: S.host, section: "Question " + pad(S.q_index + 1) + " of " + pad(S.total), no: pad(S.q_index + 1), left: joinTag });
        render('<div class="stack" style="gap:22px">' + routeHtml(S.q_index, S.total) +
          '<div class="two"><div class="plate figure"><img alt="Question picture" src="' + esc(item.img) + '"></div>' +
          '<div class="stack"><div class="qhead"><span class="outline-n">' + pad(S.q_index + 1) + '</span><span class="micro" style="padding-bottom:8px">' + esc(item.tag) + ' · of ' + S.total + '</span></div>' +
          '<h2 class="qtext">' + esc(item.q) + '</h2>' + optsHtml(item, false) +
          '<div class="strip"><div><span class="micro">Time left</span><span class="v" id="left">' + S.duration + '</span></div><div><span class="micro">Answered</span><span class="v" id="ans">' + S.answered + " / " + S.players.length + '</span></div></div>' +
          '<div class="timeline" id="tl" style="width:100%"></div>' +
          '<div><button class="btn line" id="reveal">Reveal the answer</button></div></div></div></div>');
        document.getElementById("reveal").addEventListener("click", function () { act("reveal"); });
      } else if (S.status === "reveal") {
        var it = q.items[S.q_index], last = S.q_index + 1 >= S.total;
        chrome({ host: S.host, section: "Answer " + pad(S.q_index + 1) + " of " + pad(S.total), no: pad(S.q_index + 1), left: joinTag });
        render('<div class="stack" style="gap:22px">' + routeHtml(S.q_index, S.total) +
          '<div class="two"><div class="stack"><div class="plate figure sm"><img alt="Answer picture" src="' + esc(it.reveal || it.img) + '"></div>' +
          '<p class="callout explain"><b>' + esc(S.answer) + '.</b> ' + esc(S.explanation) + '</p></div>' +
          '<div class="stack"><div class="qhead"><span class="outline-n">' + pad(S.q_index + 1) + '</span><span class="micro" style="padding-bottom:8px">The answer</span></div>' +
          '<h2 class="qtext">' + esc(it.q) + '</h2>' + optsHtml(it, true) +
          '<dl class="facts"><div><dt>Fastest correct</dt><dd>' + (S.fastest ? "<b>" + esc(S.fastest.name) + "</b> · " + secs(S.fastest.ms) : "Nobody this time. A tricky one!") + '</dd></div></dl>' +
          '<p class="shead micro">Ranking so far</p>' + boardHtml(S.board || [], S.total, 3) +
          '<div><button class="btn big" id="next">' + (last ? "Show the final ranking" : "Next question") + '</button></div></div></div></div>');
        document.getElementById("next").addEventListener("click", function () { act("next"); });
      } else {
        var b = S.board || [], w = b[0];
        chrome({ host: S.host, section: "Final ranking ◆", no: "", left: S.players.length + " players", closing: true });
        var plate = function (r, cls) {
          if (!r) return '<div></div>';
          return '<div class="gplate ' + cls + '"><div class="rank">' + r.rank + '</div><div class="who">' + esc(r.name) + '</div><div class="sub">' + r.correct + "/" + S.total + " correct · " + secs(r.ms) + '</div>' +
            (r.rank === 1 ? '<div class="gift">' + GIFT + 'Wins the gift</div>' : "") + '</div>';
        };
        render('<div class="stack" style="gap:34px"><div class="end-hero"><div><p class="kicker micro"><b></b>' + esc(q.title) + ' · Complete</p>' +
          '<h1 class="end-hl" style="margin-top:18px">' + (w ? "The winner is" : "No winner") + '<b>' + (w ? esc(w.name) + "." : "this time.") + '</b></h1>' + tick() +
          '<p class="lead">' + S.players.length + ' players, ' + S.total + ' questions. Ranked by correct answers first, then by the fastest total time.</p></div>' +
          (w ? '<div class="stamp"><div><span class="micro">Number one</span><strong>The gift</strong>' + GIFT + '</div></div>' : "") + '</div>' +
          '<div class="podium">' + plate(b[1], "p2") + plate(b[0], "p1") + plate(b[2], "p3") + '</div>' +
          (b.length > 3 ? '<div class="stack" style="max-width:820px;width:100%;margin:0 auto"><p class="kicker micro"><b></b>Places 4 to ' + Math.min(10, b.length) + '</p>' + boardHtml(b.slice(3), S.total, 7) + '</div>' : "") +
          '<div class="row" style="justify-content:center"><a class="btn line" href="?host">Start a new session</a></div></div>');
      }
    }
    function tickTimer() {
      if (!S || S.status !== "question") return;
      var left = S.duration - (Date.now() - startLocal) / 1000, el = document.getElementById("left"), tl = document.getElementById("tl");
      if (el) { el.textContent = Math.max(0, Math.ceil(left)); tl.style.width = Math.max(0, 100 * left / S.duration) + "%"; tl.classList.toggle("low", left <= 5); }
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
        else if (s.status === "question") { var a = document.getElementById("ans"); if (a) a.textContent = s.answered + " / " + s.players.length; }
      }).catch(function (e) {
        if (/not found/i.test(e.message)) { poll.stop(); render('<div class="phone stack">' + hl("Room", "not found.", "sm") + '<p class="lead">' + esc(e.message) + '</p><div><a class="btn" href="?host">Open a new room</a></div></div>'); }
      });
    }, 1000);
  }

  /* ---------- player ---------- */
  function player(code) {
    var me = store("satoquiz:player:" + code);
    if (!me) return joinForm(code);
    var S = null, lastKey = "", startLocal = 0, picking = false, pending = null;
    function draw() {
      var q = quiz(S.quiz_id);
      if (S.status === "lobby") {
        chrome({ host: S.host, section: "Lobby", no: "00" });
        render('<div class="phone stack">' + chapter(pad(S.players), "Players in the room") + '<div>' + hl("You're in,", S.name.split(" ")[0] + ".", "sm") + '</div>' + tick() +
          '<p class="lead">Watch the big screen. ' + esc(S.host) + ' will start the quiz in a moment.</p>' + waiting("Waiting for the first question") +
          '<p class="callout" style="margin-top:8px">Most correct answers first, then the fastest time. Only number one wins the gift.</p></div>');
      } else if (S.status === "question") {
        var item = q.items[S.q_index], mine = S.my_choice != null ? S.my_choice : pending;
        chrome({ host: S.host, section: "Question " + pad(S.q_index + 1) + " of " + pad(S.total), no: pad(S.q_index + 1) });
        render('<div class="phone stack" style="gap:14px"><div class="ptop"><span class="left"><span class="outline-n">' + pad(S.q_index + 1) + '</span><span class="micro" style="padding-bottom:6px">of ' + S.total + '</span></span><span class="secs" id="secs">' + S.duration + ' s</span></div>' +
          '<div class="timeline" id="tl" style="width:100%"></div><h2 class="qtext" style="font-size:22px">' + esc(item.q) + '</h2>' +
          '<div class="plate pimg" id="pimg" style="padding:10px"><img alt="Question picture, tap to enlarge" src="' + esc(item.img) + '"></div>' +
          '<div class="answers">' + item.opts.map(function (o, i) {
            return '<button class="answer" data-i="' + i + '" aria-pressed="' + (mine === i) + '"' + (mine != null ? " disabled" : "") + '><span class="L outline-n">' + LETTERS[i] + '</span><span>' + esc(o) + '</span><span class="dia"></span></button>';
          }).join("") + '</div><div id="lock">' + (mine != null ? waiting("Answer " + LETTERS[mine] + " is locked in") : "") + '</div></div>');
        document.getElementById("pimg").addEventListener("click", function () { zoom(item.img); });
        app.querySelectorAll(".answer").forEach(function (b) { b.addEventListener("click", function () { pick(+b.dataset.i); }); });
      } else if (S.status === "reveal") {
        var it = q.items[S.q_index], cls, head;
        chrome({ host: S.host, section: "Answer " + pad(S.q_index + 1) + " of " + pad(S.total), no: pad(S.q_index + 1) });
        if (S.my_choice == null) { cls = "result-none"; head = hl("No answer", "this time.", "sm"); }
        else if (S.my_correct) { cls = "result-right"; head = hl("Correct.", secs(S.my_ms), "sm"); }
        else { cls = "result-wrong"; head = hl("Not this", "time.", "sm"); }
        render('<div class="phone stack ' + cls + '"><div class="callout">' + head + '</div>' +
          '<dl class="facts"><div><dt>Correct answer</dt><dd><b style="color:var(--deep)">' + esc(S.answer) + '</b></dd></div>' +
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
          (win ? '<div class="stamp" style="width:118px;height:118px"><div><span class="micro">Number one</span><strong style="font-size:22px">The gift</strong>' + GIFT + '</div></div>' : "") + '</div>' +
          '<h1 class="end-hl">' + (win ? "You win" : rank <= 3 ? "Top three," : "Thanks for playing,") + '<b>' + (win ? "the gift." : rank <= 3 ? "well done." : esc(S.name.split(" ")[0]) + ".") + '</b></h1>' + tick() +
          '<p class="lead">' + (win ? "Show this screen to " + esc(S.host) + " to collect your gift." : "You finished #" + rank + " of " + S.players + ". The gift goes to number one.") + '</p>' +
          '<dl class="facts" style="border-top-color:var(--gold)"><div style="border-bottom-color:var(--n-hair)"><dt style="color:var(--gold)">Correct</dt><dd style="color:var(--n-text)">' + S.my_score + " of " + S.total + '</dd></div>' +
          '<div style="border-bottom-color:var(--n-hair)"><dt style="color:var(--gold)">Total time</dt><dd style="color:var(--n-text)">' + secs(S.my_total_ms) + '</dd></div></dl>' +
          '<p class="kicker micro"><b></b>Top three</p>' + boardHtml(top, S.total, 3) + '</div>');
      }
    }
    function pick(i) {
      if (picking || !S || S.status !== "question" || S.my_choice != null) return;
      picking = true; pending = i;
      app.querySelectorAll(".answer").forEach(function (b) { b.disabled = true; b.setAttribute("aria-pressed", String(+b.dataset.i === i)); });
      document.getElementById("lock").innerHTML = waiting("Answer " + LETTERS[i] + " is locked in");
      rpc("quiz_answer", { p_code: code, p_token: me.token, p_q: S.q_index, p_choice: i })
        .then(function () { S.my_choice = i; })
        .catch(function (e) { pending = null; toast(e.message); lastKey = ""; poll.now(); })
        .then(function () { picking = false; });
    }
    function tickTimer() {
      if (!S || S.status !== "question") return;
      var left = S.duration - (Date.now() - startLocal) / 1000, tl = document.getElementById("tl"), sc = document.getElementById("secs");
      if (!tl) return;
      tl.style.width = Math.max(0, 100 * left / S.duration) + "%"; tl.classList.toggle("low", left <= 5);
      sc.textContent = Math.max(0, Math.ceil(left)) + " s";
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
      var q = quiz(p.quiz_id), card = document.getElementById("jcard");
      chrome({ host: p.host, section: "Join", no: "01" });
      if (p.status === "finished") { card.innerHTML = hl("This quiz", "has finished.", "sm") + tick() + '<p class="lead">Ask ' + esc(p.host) + ' for the code of the next one.</p><div><a class="btn line" href="./">Enter another code</a></div>'; return; }
      card.innerHTML = chapter("01", "Room " + fmtCode(code)) + '<div>' + hl("Welcome to", q.title + ".", "sm") + '</div>' + tick() +
        '<p class="lead">' + esc(q.blurb) + '</p>' +
        '<form id="nameForm" class="stack" novalidate><div class="field"><label for="pname">Your name</label><input id="pname" class="input" maxlength="40" autocomplete="name" placeholder="First and last name"></div>' +
        '<div id="nErr" class="error" hidden></div><button class="btn big block" type="submit">Join the quiz</button></form>' +
        '<dl class="facts"><div><dt>In the room</dt><dd>' + p.players + ' player' + (p.players === 1 ? "" : "s") + '</dd></div><div><dt>Questions</dt><dd>' + q.items.length + (p.status !== "lobby" ? " · already started, you can still join" : "") + '</dd></div></dl>';
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
  if (params.has("join")) player(params.get("join").replace(/\D/g, ""));
  else if (params.has("host")) { var hc = (params.get("host") || "").replace(/\D/g, ""); if (hc.length === 6) hostRun(hc); else hostSetup(); }
  else landing();
})();
