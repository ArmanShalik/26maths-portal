// ============================================================
//  APP.JS — Battle Station 2026
//  VERSION 4 — Pure JSONP, no fetch, no async/await
// ============================================================

var allRecords   = [];
var allData      = null;
var currentQuery = "";

// ── Battle cry phrases ────────────────────────────────────
var BATTLE_CRIES = [
  "Every hour you waste today is a mark you cannot earn back.",
  "The exam does not care about your excuses. Start now.",
  "Your future self is watching what you do right now.",
  "Comfort today means regret on exam day. Choose wisely.",
  "The student who outworks you will outscore you. Do not let that happen.",
  "Discipline is doing it even when you do not feel like it. Especially then.",
  "You do not rise to the occasion. You fall to your level of preparation.",
  "Three months. One chance. Everything you have got. No holding back.",
  "The A/L paper does not negotiate. Neither should you.",
  "Sleep when you are done. Work while it still matters.",
  "Right now, somewhere, your competition is studying. Are you?",
  "Pain of discipline or pain of regret. One lasts a moment, one lasts years.",
  "Your rank on exam day is decided by what you do today.",
  "Hard work beats talent when talent does not work hard.",
  "Every question you practice today is one you will not fear on exam day.",
];

function getUrgencyMessage(daysLeft) {
  if (daysLeft > 75) return daysLeft + " days to build the version of yourself that can pass this exam.";
  if (daysLeft > 60) return daysLeft + " days left. The foundation determines everything. Lay it right.";
  if (daysLeft > 45) return daysLeft + " days. Past-paper season starts NOW. No more delays.";
  if (daysLeft > 30) return daysLeft + " days. Every weak topic is a ticking time bomb. Defuse them.";
  if (daysLeft > 20) return daysLeft + " days. Final acceleration phase. No more easy sessions.";
  if (daysLeft > 10) return daysLeft + " days. This is it. Leave everything in the papers.";
  if (daysLeft > 3)  return daysLeft + " DAYS. Revision only. Sleep, eat, revise. Nothing else.";
  return "EXAM DAY IS HERE. You have prepared. Trust your work. Write everything you know.";
}

// ── Boot ─────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function() {

  document.getElementById("yearLabel").textContent = CONFIG.YEAR_LABEL || "A/L 2026";

  var symbol = document.getElementById("brandSymbol");
  if (CONFIG.LOGO && CONFIG.LOGO.trim() !== "") {
    symbol.innerHTML = '<img src="' + CONFIG.LOGO + '" alt="Logo" />';
  } else {
    symbol.textContent = "\u03a3";
  }

  var examLabel = document.getElementById("examDateLabel");
  if (examLabel && CONFIG.EXAM_DATE) {
    var parts = CONFIG.EXAM_DATE.split("-").map(Number);
    var d = new Date(parts[0], parts[1] - 1, parts[2]);
    examLabel.textContent = (CONFIG.EXAM_LABEL || "G.C.E. ADVANCED LEVEL") + " \u00b7 " +
      d.toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" }).toUpperCase();
  }

  initBattleCry();
  initPrepTimeline();

  document.getElementById("queryInput").addEventListener("keydown", function(e) {
    if (e.key === "Enter") lookup();
  });
});

// ── Countdown (self-starting IIFE) ───────────────────────
(function() {
  var examTs = new Date(2026, 7, 10, 0, 0, 0, 0).getTime(); // Aug 10 2026 local midnight

  function pad(n, w) {
    var s = String(Math.floor(n < 0 ? 0 : n));
    while (s.length < w) s = "0" + s;
    return s;
  }
  function set(id, v) { var e = document.getElementById(id); if (e) e.textContent = v; }

  function tick() {
    try {
      var diff = examTs - Date.now();
      if (diff <= 0) {
        clearInterval(h);
        var c = document.getElementById("countdownClock");
        if (c) c.innerHTML = '<div style="color:#ffb347;font-size:clamp(16px,3vw,28px);text-align:center;line-height:1.5;">EXAM DAY IS HERE</div>';
        return;
      }
      var t = Math.floor(diff / 1000);
      set("cdDays",  pad(Math.floor(t / 86400), 3));
      set("cdHours", pad(Math.floor((t % 86400) / 3600), 2));
      set("cdMins",  pad(Math.floor((t % 3600) / 60), 2));
      set("cdSecs",  pad(t % 60, 2));
      var c = document.getElementById("countdownClock");
      if (c) {
        var d = Math.floor(t / 86400);
        c.className = "countdown-clock" + (d < 10 ? " urgent-critical" : d < 30 ? " urgent-high" : d < 60 ? " urgent-mid" : "");
      }
    } catch(e) { /* never die */ }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { tick(); h = setInterval(tick, 1000); });
  } else {
    tick();
  }
  var h = setInterval(tick, 1000);
}());

// ── Prep timeline bar ─────────────────────────────────────
function initPrepTimeline() {
  try {
    var examDate  = new Date(2026, 7, 10, 0, 0, 0, 0);
    var startStr  = (CONFIG.PREP_START || "2026-05-10").split("-").map(Number);
    var prepStart = new Date(startStr[0], startStr[1]-1, startStr[2], 0, 0, 0, 0);
    var now       = new Date();

    var total = examDate - prepStart;
    var used  = now - prepStart;
    var pct   = Math.max(0, Math.min(100, (used / total) * 100));
    var pctStr = pct.toFixed(1) + "%";

    var sl = document.getElementById("prepStartLabel");
    if (sl) sl.textContent = prepStart.toLocaleDateString("en-GB", {day:"numeric",month:"short"}).toUpperCase();

    setTimeout(function() {
      var fill   = document.getElementById("prepBarFill");
      var marker = document.getElementById("prepBarMarker");
      var pctEl  = document.getElementById("prepPct");
      if (fill)   fill.style.width    = pctStr;
      if (marker) marker.style.left   = pctStr;
      if (pctEl)  pctEl.textContent   = Math.round(pct) + "% used";
    }, 500);
  } catch(e) {}
}

// ── Battle cry rotation ───────────────────────────────────
var _cryIndex = 0;

function initBattleCry() {
  try {
    var examDate = new Date(2026, 7, 10, 0, 0, 0, 0);
    var daysLeft = Math.max(0, Math.floor((examDate - new Date()) / 86400000));
    var el = document.getElementById("battleCryText");
    if (el) el.textContent = getUrgencyMessage(daysLeft);
    setInterval(rotateCry, 8000);
  } catch(e) {}
}

function rotateCry() {
  try {
    _cryIndex = (_cryIndex + 1) % BATTLE_CRIES.length;
    var el = document.getElementById("battleCryText");
    if (!el) return;
    el.style.opacity = "0";
    setTimeout(function() {
      el.textContent = BATTLE_CRIES[_cryIndex];
      el.style.transition = "opacity 0.4s";
      el.style.opacity = "1";
    }, 300);
  } catch(e) {}
}

// ============================================================
//  NETWORK — Pure JSONP, works from any origin, no fetch needed
// ============================================================
function callAPI(params, onDone) {
  // Create a unique callback name
  var cbName = "_apicb" + Date.now();

  // Build query string
  var qs = "";
  Object.keys(params).forEach(function(k) {
    qs += (qs ? "&" : "?") + encodeURIComponent(k) + "=" + encodeURIComponent(params[k]);
  });

  var script = document.createElement("script");
  var settled = false;

  // Hard timeout — always fires onDone even if API never responds
  var timer = setTimeout(function() {
    if (settled) return;
    settled = true;
    window[cbName] = function() {}; // defuse in case late response arrives
    if (script.parentNode) script.parentNode.removeChild(script);
    delete window[cbName];
    onDone({ error: "Request timed out after 12 seconds.\n\nCheck:\n1. API_URL in config.js is correct\n2. Code.gs was redeployed as a NEW VERSION after latest edits\n3. Deployment access is set to Anyone (not just Anyone with Google Account)" });
  }, 12000);

  // This function is called by the loaded script
  window[cbName] = function(data) {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    if (script.parentNode) script.parentNode.removeChild(script);
    delete window[cbName];
    onDone(data);
  };

  // Script load error (bad URL, network down, etc.)
  script.onerror = function() {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    if (script.parentNode) script.parentNode.removeChild(script);
    delete window[cbName];
    onDone({ error: "Cannot reach API URL.\n\nCheck:\n1. API_URL in config.js\n2. Internet connection\n3. Deployment is set to Anyone" });
  };

  script.src = CONFIG.API_URL + qs + "&callback=" + cbName;
  document.head.appendChild(script);
}

// ── Lookup ────────────────────────────────────────────────
function lookup() {
  var q = document.getElementById("queryInput").value.trim();
  if (!q) return;
  currentQuery = q;

  setError("");
  document.getElementById("results").style.display = "none";
  showSpinner(true);
  setSearchBtn(true);
  Charts.destroyAll();

  // Validate API_URL first
  if (!CONFIG.API_URL || CONFIG.API_URL.indexOf("script.google.com") === -1) {
    showSpinner(false);
    setSearchBtn(false);
    setError("API_URL in config.js is not set. Paste your Apps Script Web App URL.");
    return;
  }

  callAPI({ action: "getFullData", query: q }, function(data) {
    showSpinner(false);
    setSearchBtn(false);
    if (data.error) {
      setError(data.error);
      return;
    }
    try {
      processData(data);
    } catch(e) {
      setError("Display error: " + e.message);
      console.error(e);
    }
  });
}

// ── Process & render data ─────────────────────────────────
function processData(data) {
  allData    = data;
  allRecords = data.records;

  document.getElementById("studentName").textContent = data.student;

  if (data.quote) {
    document.getElementById("quoteText").textContent = data.quote;
    var examDate = new Date(2026, 7, 10, 0, 0, 0, 0);
    var daysLeft = Math.max(0, Math.floor((examDate - new Date()) / 86400000));
    document.getElementById("quoteDaysLeft").textContent = "\u23f1 " + daysLeft + " days left to the exam \u2014 use them.";
    document.getElementById("quoteCard").style.display = "block";
  }

  renderMarksPanel(allRecords[0], true);
  renderReview(allRecords[0]);
  renderHistory(allRecords);

  document.getElementById("chartsGrid").style.display = "grid";
  setTimeout(function() {
    Charts.trend(allRecords);
    Charts.compare(allRecords[0]);
    Charts.parts(allRecords);
  }, 100);

  if (data.paperStats && data.paperStats.questions && data.paperStats.questions.length > 0) {
    renderPaperAnalysis(data.paperStats, data.classStats);
  } else {
    document.getElementById("paperAnalysisSection").style.display = "none";
  }

  document.getElementById("results").style.display = "block";
  document.getElementById("results").scrollIntoView({ behavior: "smooth", block: "start" });
}

// ── Marks panel ───────────────────────────────────────────
function renderMarksPanel(rec, isLatest) {
  var pA = pct(rec.partA, rec.maxA);
  var pB = pct(rec.partB, rec.maxB);
  var pT = pct(rec.total, rec.maxTotal);

  var gradeColors = { A:"var(--green)", B:"var(--green)", C:"var(--gold)", S:"var(--fire-amber)", W:"var(--fire-mid)", F:"var(--fire)" };
  var gc = gradeColors[rec.grade] || "var(--cream)";

  document.getElementById("marksPanel").innerHTML =
    '<div class="marks-panel" style="animation:fadeUp .4s ease both">' +
    '<div class="marks-topbar">' +
    '<div><div class="paper-title">' + rec.paper + '</div><div class="paper-date">' + rec.date + '</div></div>' +
    '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">' +
    (isLatest ? '<span class="badge-latest">Latest</span>' : '') +
    '<span style="font-family:var(--fm);font-size:20px;font-weight:700;color:' + gc + '">' + rec.grade + '</span>' +
    '</div></div>' +
    '<div class="score-grid">' +
    scoreCell(rec.partA, rec.maxA, pA, "Part A") +
    scoreCell(rec.partB, rec.maxB, pB, "Part B") +
    scoreCell(rec.total, rec.maxTotal, pT, "Total") +
    '</div>' +
    '<div class="class-compare">' +
    '<div class="cc-cell"><div class="cc-val you">' + rec.total + '</div><div class="cc-lbl">Your Score</div></div>' +
    '<div class="cc-cell"><div class="cc-val">' + (rec.classAverage || "\u2014") + '</div><div class="cc-lbl">Class Avg</div></div>' +
    '<div class="cc-cell"><div class="cc-val top">' + (rec.classHighest || "\u2014") + '</div><div class="cc-lbl">Highest</div></div>' +
    '</div>' +
    (rec.studentRank && rec.classSize ?
      '<div style="padding:12px 20px;border-top:1px solid var(--border)">' +
      '<span class="rank-badge">\ud83c\udfc6 \u00a0Rank ' + rec.studentRank + ' of ' + rec.classSize + ' students</span>' +
      (rec.studentRank > 1
        ? '<span style="font-family:var(--fm);font-size:11px;color:var(--fire-mid);margin-left:10px">' + (rec.studentRank-1) + ' student' + (rec.studentRank-1>1?'s':'') + ' ahead \u2014 close the gap.</span>'
        : '<span style="font-family:var(--fm);font-size:11px;color:var(--green);margin-left:10px">Top of the class \u2014 now defend it.</span>')
      + '</div>' : '') +
    '</div>';

  setTimeout(function() {
    var fills = document.querySelectorAll(".score-bar-fill");
    for (var i = 0; i < fills.length; i++) {
      fills[i].style.width = fills[i].getAttribute("data-w");
    }
  }, 80);
}

function scoreCell(val, max, p, label) {
  return '<div class="score-cell">' +
    '<div class="score-value">' + val + '<span class="score-max">/' + max + '</span></div>' +
    '<div class="score-pct">' + p + '%</div>' +
    '<div class="score-bar"><div class="score-bar-fill" style="width:0" data-w="' + p + '%"></div></div>' +
    '<div class="score-label">' + label + '</div>' +
    '</div>';
}

// ── Review block ──────────────────────────────────────────
function renderReview(rec) {
  var gTags = rec.good.split(",").map(function(t) { return '<span class="tag tag-good">' + t.trim() + '</span>'; }).join("");
  var bTags = rec.improve.split(",").map(function(t) { return '<span class="tag tag-bad">' + t.trim() + '</span>'; }).join("");

  document.getElementById("reviewPanel").innerHTML =
    '<div style="margin-bottom:20px">' +
    '<div class="section-label">Tutor Feedback</div>' +
    '<div class="marks-panel">' +
    '<div class="review-section">' +
    '<div class="review-block good"><div class="review-block-title">\u2713 \u00a0Strong Areas \u2014 Keep These Sharp</div><div class="tags-wrap">' + gTags + '</div></div>' +
    '<div class="review-block improve"><div class="review-block-title">\u26a0 \u00a0These Will Cost You Marks \u2014 Fix Them Now</div><div class="tags-wrap">' + bTags + '</div></div>' +
    '<div class="review-block notes"><div class="review-block-title">\u270e \u00a0Tutor\'s Direct Message to You</div><p class="review-text">' + rec.review + '</p></div>' +
    '</div></div></div>';
}

// ── Paper analysis ─────────────────────────────────────────
function renderPaperAnalysis(stats, classStats) {
  var qs = stats.questions;
  if (!qs || qs.length === 0) return;

  document.getElementById("paperAnalysisSection").style.display = "block";

  var avgSuccessRate = Math.round(
    qs.reduce(function(s,q) { return s + (q.attempted>0 ? (q.correct/q.attempted)*100 : 0); }, 0) / qs.length
  );

  document.getElementById("paperSummaryRow").innerHTML =
    '<div class="cc-cell"><div class="cc-val" style="color:var(--cream)">' + (classStats?classStats.size:"--") + '</div><div class="cc-lbl">Students</div></div>' +
    '<div class="cc-cell"><div class="cc-val" style="color:var(--blue)">' + (classStats?classStats.average:"--") + '</div><div class="cc-lbl">Class Avg</div></div>' +
    '<div class="cc-cell"><div class="cc-val" style="color:var(--green)">' + (classStats?classStats.highest:"--") + '</div><div class="cc-lbl">Highest</div></div>' +
    '<div class="cc-cell"><div class="cc-val" style="color:var(--fire-mid)">' + avgSuccessRate + '%</div><div class="cc-lbl">Avg Success</div></div>';

  Charts.questions(qs, classStats ? classStats.size : 1);

  document.getElementById("qaBody").innerHTML = qs.map(function(q) {
    var rate  = q.attempted > 0 ? Math.round((q.correct/q.attempted)*100) : 0;
    var rateC = rate >= 70 ? "rate-high" : rate >= 40 ? "rate-mid" : "rate-low";
    var aPct  = classStats && classStats.size > 0 ? Math.round((q.attempted/classStats.size)*100) : 100;
    return '<tr>' +
      '<td class="num">Q' + q.qNo + '</td>' +
      '<td>' + (q.topic || q.qName) + '</td>' +
      '<td class="num">' + q.maxMarks + '</td>' +
      '<td><div class="attempt-bar-wrap"><div class="attempt-bar"><div class="attempt-bar-fill" style="width:' + aPct + '%"></div></div><span class="num">' + q.attempted + '</span></div></td>' +
      '<td class="num">' + q.correct + '</td>' +
      '<td class="num">' + q.avgScore + '</td>' +
      '<td class="num ' + rateC + '">' + rate + '%</td>' +
      '</tr>';
  }).join("");
}

// ── History table ──────────────────────────────────────────
function renderHistory(records) {
  if (records.length <= 1) { document.getElementById("historySection").style.display = "none"; return; }
  document.getElementById("historySection").style.display = "block";
  document.getElementById("historyBody").innerHTML = records.map(function(r, i) {
    return '<tr onclick="selectPaper(' + i + ')">' +
      '<td>' + r.paper + (i===0?' <span class="badge-latest">latest</span>':'') + '</td>' +
      '<td>' + r.date + '</td>' +
      '<td class="num">' + r.partA + '/' + r.maxA + '</td>' +
      '<td class="num">' + r.partB + '/' + r.maxB + '</td>' +
      '<td class="num">' + r.total + '/' + r.maxTotal + '</td>' +
      '<td class="num">' + pct(r.total,r.maxTotal) + '%</td>' +
      '<td class="num">' + r.grade + '</td>' +
      '</tr>';
  }).join("");
}

function selectPaper(i) {
  renderMarksPanel(allRecords[i], i===0);
  renderReview(allRecords[i]);
  document.getElementById("marksPanel").scrollIntoView({ behavior:"smooth", block:"start" });
}

// ── Download PDF ───────────────────────────────────────────
function downloadPDF() {
  var btn = document.getElementById("dlBtn");
  btn.textContent   = "Generating...";
  btn.style.opacity = "0.6";
  btn.disabled      = true;

  callAPI({ action: "getPDF", query: currentQuery }, function(data) {
    btn.innerHTML     = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download PDF';
    btn.style.opacity = "1";
    btn.disabled      = false;
    if (data.error) { setError(data.error); return; }
    try {
      var bytes   = atob(data.pdf);
      var arr     = new Uint8Array(bytes.length);
      for (var i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
      var blobUrl = URL.createObjectURL(new Blob([arr], { type:"application/pdf" }));
      var a       = document.createElement("a");
      a.href = blobUrl; a.download = data.filename; a.click();
      URL.revokeObjectURL(blobUrl);
    } catch(e) { setError("PDF error: " + e.message); }
  });
}

// ── Share ─────────────────────────────────────────────────
function openShare() {
  if (!allData || !allRecords.length) return;
  Share.open(allRecords[0], allData.student, allData.quote);
}

// ── Helpers ───────────────────────────────────────────────
function pct(a, b)   { return b > 0 ? Math.round((a/b)*100) : 0; }
function showSpinner(on) { document.getElementById("spinnerWrap").style.display = on ? "flex" : "none"; }
function setError(msg)   { var b = document.getElementById("errorBox"); b.textContent = msg; b.style.display = msg ? "block" : "none"; }
function setSearchBtn(l) { var b = document.getElementById("searchBtn"); b.textContent = l ? "Searching..." : "Search"; b.disabled = l; }
