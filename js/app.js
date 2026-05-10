// ============================================================
//  APP — Main Application Logic
//  Battle Station Edition · August 2026
// ============================================================

let allRecords   = [];
let allData      = null;
let currentQuery = "";

// ── Battle cry phrases ────────────────────────────────────
const BATTLE_CRIES = [
  "Every hour you waste today is a mark you can't earn back.",
  "The exam doesn't care about your excuses. Start now.",
  "Your future self is watching what you do right now.",
  "Comfort today means regret on exam day. Choose wisely.",
  "The student who outworks you will outscore you. Don't let that happen.",
  "Discipline is doing it even when you don't feel like it. Especially then.",
  "You don't rise to the occasion. You fall to your level of preparation.",
  "Three months. One chance. Everything you've got. No holding back.",
  "The A/L paper doesn't negotiate. Neither should you.",
  "Sleep when you're done. Work while it still matters.",
  "Right now, somewhere, your competition is studying. Are you?",
  "Pain of discipline or pain of regret — one lasts a moment, one lasts years.",
  "Your rank on exam day is decided by what you do today.",
  "Hard work beats talent when talent doesn't work hard. Choose hard work.",
  "Every question you practice today is a question you won't fear on exam day.",
];

// ── Urgency messages by days remaining ────────────────────
function getUrgencyMessage(daysLeft) {
  if (daysLeft > 75) return `${daysLeft} days to build the version of yourself that can pass this exam.`;
  if (daysLeft > 60) return `${daysLeft} days left. The foundation determines everything. Lay it right.`;
  if (daysLeft > 45) return `${daysLeft} days. Past-paper season starts NOW. No more delays.`;
  if (daysLeft > 30) return `${daysLeft} days. Every weak topic is a ticking time bomb. Defuse them.`;
  if (daysLeft > 20) return `${daysLeft} days. Final acceleration phase. No more easy sessions.`;
  if (daysLeft > 10) return `${daysLeft} days. This is it. Leave everything in the papers.`;
  if (daysLeft > 3)  return `${daysLeft} DAYS. Revision mode only. Sleep, eat, revise. Nothing else.`;
  return `EXAM DAY IS HERE. You've prepared. Trust your work. Write everything you know.`;
}

// ── Boot ─────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {

  // Set header label
  document.getElementById("yearLabel").textContent =
    (CONFIG.YEAR_LABEL || "A/L · 2026");

  // Logo
  const symbol = document.getElementById("brandSymbol");
  if (CONFIG.LOGO && CONFIG.LOGO.trim() !== "") {
    symbol.innerHTML = `<img src="${CONFIG.LOGO}" alt="Logo" />`;
  } else {
    symbol.textContent = "∑";
  }

  // Exam date label
  if (CONFIG.EXAM_DATE) {
    const d = new Date(CONFIG.EXAM_DATE + "T00:00:00");
    document.getElementById("examDateLabel").textContent =
      `${CONFIG.EXAM_LABEL || "G.C.E. ADVANCED LEVEL"} · ${d.toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}).toUpperCase()}`;
  }

  // Init battle cry rotation
  initBattleCry();

  // Init prep timeline
  initPrepTimeline();

  // Enter key on search
  document.getElementById("queryInput")
    .addEventListener("keydown", e => { if (e.key === "Enter") lookup(); });
});

// ── Countdown ─────────────────────────────────────────────
// Completely isolated — no CONFIG dependency inside tick,
// no DOM calls that can throw, wrapped in try-catch.
// ── Countdown ─────────────────────────────────────────────
// Runs as soon as the DOM is ready. No CONFIG dependency.
// Completely isolated from the rest of the app — errors in
// other scripts cannot stop this clock.
(function startCountdown() {

  var EXAM_YEAR  = 2026;
  var EXAM_MONTH = 8;   // August
  var EXAM_DAY   = 10;

  // Local midnight — avoids UTC timezone shifting the date
  var examTs = new Date(EXAM_YEAR, EXAM_MONTH - 1, EXAM_DAY, 0, 0, 0, 0).getTime();

  function pad(n, width) {
    var s = String(n < 0 ? 0 : Math.floor(n));
    while (s.length < width) s = "0" + s;
    return s;
  }

  function setText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  var timerHandle = null;

  function tick() {
    try {
      var diff = examTs - Date.now();

      if (diff <= 0) {
        if (timerHandle) { clearInterval(timerHandle); timerHandle = null; }
        var el = document.getElementById("countdownClock");
        if (el) el.innerHTML =
          '<div style="font-size:clamp(16px,3vw,30px);color:#ffb347;letter-spacing:2px;' +
          'text-align:center;line-height:1.5;font-family:impact,sans-serif;">' +
          'EXAM DAY HAS ARRIVED — GIVE EVERYTHING YOU HAVE</div>';
        return;
      }

      var totalSec = Math.floor(diff / 1000);
      var d = Math.floor(totalSec / 86400);
      var h = Math.floor((totalSec % 86400) / 3600);
      var m = Math.floor((totalSec % 3600) / 60);
      var s = totalSec % 60;

      setText("cdDays",  pad(d, 3));
      setText("cdHours", pad(h, 2));
      setText("cdMins",  pad(m, 2));
      setText("cdSecs",  pad(s, 2));

      var clock = document.getElementById("countdownClock");
      if (clock) {
        clock.className = "countdown-clock" +
          (d < 10 ? " urgent-critical" : d < 30 ? " urgent-high" : d < 60 ? " urgent-mid" : "");
      }
    } catch (err) {
      console.warn("[Countdown] tick skipped:", err.message);
    }
  }

  function init() {
    tick();
    timerHandle = setInterval(tick, 1000);
  }

  // DOM is guaranteed ready here because scripts load at bottom of <body>
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

}());

// ── Prep timeline bar ─────────────────────────────────────
function initPrepTimeline() {
  const examDate  = new Date((CONFIG.EXAM_DATE  || "2026-08-10") + "T00:00:00");
  const prepStart = new Date((CONFIG.PREP_START || "2026-05-10") + "T00:00:00");
  const now       = new Date();

  const totalMs = examDate - prepStart;
  const usedMs  = now - prepStart;
  const pct     = Math.max(0, Math.min(100, (usedMs / totalMs) * 100));
  const pctStr  = pct.toFixed(1) + "%";

  // Start label
  const startEl = document.getElementById("prepStartLabel");
  if (startEl) {
    startEl.textContent = prepStart.toLocaleDateString("en-GB",{day:"numeric",month:"short"}).toUpperCase();
  }

  // Animate fill after short delay
  setTimeout(() => {
    const fill   = document.getElementById("prepBarFill");
    const marker = document.getElementById("prepBarMarker");
    if (fill)   fill.style.width    = pctStr;
    if (marker) marker.style.left   = pctStr;
    document.getElementById("prepPct").textContent = pct.toFixed(0) + "% used";
  }, 400);
}

// ── Battle cry rotation ───────────────────────────────────
let _cryIndex = 0;
let _cryTimer = null;

function initBattleCry() {
  // Start with a days-left urgency message
  const examDate = new Date((CONFIG.EXAM_DATE || "2026-08-10") + "T00:00:00");
  const daysLeft = Math.max(0, Math.floor((examDate - new Date()) / (1000 * 60 * 60 * 24)));
  document.getElementById("battleCryText").textContent = getUrgencyMessage(daysLeft);

  // Rotate through battle cries every 8 seconds
  _cryTimer = setInterval(rotateCry, 8000);
}

function rotateCry() {
  const el = document.getElementById("battleCryText");
  if (!el) return;
  _cryIndex = (_cryIndex + 1) % BATTLE_CRIES.length;
  el.style.opacity = "0";
  el.style.transform = "translateX(10px)";
  setTimeout(() => {
    el.textContent = BATTLE_CRIES[_cryIndex];
    el.style.transition = "opacity .4s ease, transform .4s ease";
    el.style.opacity  = "1";
    el.style.transform = "translateX(0)";
  }, 300);
}

// ── Network: JSONP call to Apps Script ───────────────────
// Apps Script web apps do not return CORS headers, so plain
// fetch() always fails cross-origin. JSONP (script tag injection)
// is the correct and only reliable method.
function gsCall(url, timeoutMs) {
  timeoutMs = timeoutMs || 8000;
  return new Promise(function(resolve, reject) {
    var id     = "__gs_" + Date.now() + "_" + Math.floor(Math.random() * 1e9);
    var script = document.createElement("script");
    var done   = false;

    var timer = setTimeout(function() {
      if (done) return;
      done = true;
      cleanup();
      reject(new Error(
        "Timed out after " + (timeoutMs/1000) + "s.\n\n" +
        "Check the following:\n" +
        "1. API_URL in config.js matches your deployed Web App URL exactly.\n" +
        "2. Code.gs is deployed as a Web App (Deploy → Manage Deployments).\n" +
        "3. 'Who has access' is set to Anyone (not 'Anyone with Google Account').\n" +
        "4. After editing Code.gs you created a NEW version when redeploying."
      ));
    }, timeoutMs);

    function cleanup() {
      clearTimeout(timer);
      delete window[id];
      if (script.parentNode) script.parentNode.removeChild(script);
    }

    window[id] = function(data) {
      if (done) return;
      done = true;
      cleanup();
      resolve(data);
    };

    script.onerror = function() {
      if (done) return;
      done = true;
      cleanup();
      reject(new Error(
        "Could not reach the Apps Script URL.\n\n" +
        "1. Check that API_URL in config.js is correct.\n" +
        "2. Open the API_URL directly in your browser — it should show JSON.\n" +
        "3. Make sure 'Who has access' is set to Anyone."
      ));
    };

    script.src = url + (url.indexOf("?") === -1 ? "?" : "&") + "callback=" + id;
    document.head.appendChild(script);
  });
}

// ── Lookup ────────────────────────────────────────────────
async function lookup() {
  const q = document.getElementById("queryInput").value.trim();
  if (!q) return;
  currentQuery = q;

  setError("");
  document.getElementById("results").style.display = "none";
  showSpinner(true);
  setSearchBtn(true);
  Charts.destroyAll();

  // Quick config check before even making a request
  if (!CONFIG.API_URL ||
      CONFIG.API_URL.trim() === "" ||
      CONFIG.API_URL === "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec" ||
      CONFIG.API_URL.indexOf("script.google.com") === -1) {
    showSpinner(false);
    setSearchBtn(false);
    setError("⚠ API_URL in config.js is not set. Open js/config.js and paste your Apps Script Web App URL.");
    return;
  }

  const url = CONFIG.API_URL + "?action=getFullData&query=" + encodeURIComponent(q);

  try {
    const data = await gsCall(url, 8000);
    onData(data);
  } catch (err) {
    showSpinner(false);
    setSearchBtn(false);
    setError("❌ " + err.message);
    console.error("[Portal] Fetch error:", err);
  }
}

function onData(data) {
  showSpinner(false);
  setSearchBtn(false);

  if (data.error) { setError(data.error); return; }

  allData    = data;
  allRecords = data.records;

  document.getElementById("studentName").textContent = data.student;

  // Quote + days left
  if (data.quote) {
    document.getElementById("quoteText").textContent = data.quote;
    const examDate = new Date((CONFIG.EXAM_DATE || "2026-08-10") + "T00:00:00");
    const daysLeft = Math.max(0, Math.floor((examDate - new Date()) / (1000 * 60 * 60 * 24)));
    document.getElementById("quoteDaysLeft").textContent =
      `⏱ ${daysLeft} days left to the exam — use them.`;
    document.getElementById("quoteCard").style.display = "block";
  }

  renderMarksPanel(allRecords[0], true);
  renderReview(allRecords[0]);
  renderHistory(allRecords);

  // Charts
  document.getElementById("chartsGrid").style.display = "grid";
  setTimeout(() => {
    Charts.trend(allRecords);
    Charts.compare(allRecords[0]);
    Charts.parts(allRecords);
  }, 100);

  // Paper analysis
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
  const pA = pct(rec.partA, rec.maxA);
  const pB = pct(rec.partB, rec.maxB);
  const pT = pct(rec.total, rec.maxTotal);

  // Grade urgency colour
  const gradeUrgency = {
    A:"var(--green)", B:"var(--green)", C:"var(--gold)",
    S:"var(--fire-amber)", W:"var(--fire-mid)", F:"var(--fire)"
  };
  const gc = gradeUrgency[rec.grade] || "var(--cream)";

  document.getElementById("marksPanel").innerHTML = `
  <div class="marks-panel" style="animation:fadeUp .4s ease both">
    <div class="marks-topbar">
      <div>
        <div class="paper-title">${rec.paper}</div>
        <div class="paper-date">${rec.date}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        ${isLatest ? '<span class="badge-latest">Latest</span>' : ""}
        <span style="font-family:var(--fm);font-size:20px;font-weight:700;color:${gc}">${rec.grade}</span>
      </div>
    </div>
    <div class="score-grid">
      <div class="score-cell">
        <div class="score-value">${rec.partA}<span class="score-max">/${rec.maxA}</span></div>
        <div class="score-pct">${pA}%</div>
        <div class="score-bar"><div class="score-bar-fill" style="width:0" data-w="${pA}%"></div></div>
        <div class="score-label">Part A</div>
      </div>
      <div class="score-cell">
        <div class="score-value">${rec.partB}<span class="score-max">/${rec.maxB}</span></div>
        <div class="score-pct">${pB}%</div>
        <div class="score-bar"><div class="score-bar-fill" style="width:0" data-w="${pB}%"></div></div>
        <div class="score-label">Part B</div>
      </div>
      <div class="score-cell">
        <div class="score-value">${rec.total}<span class="score-max">/${rec.maxTotal}</span></div>
        <div class="score-pct">${pT}%</div>
        <div class="score-bar"><div class="score-bar-fill" style="width:0" data-w="${pT}%"></div></div>
        <div class="score-label">Total</div>
      </div>
    </div>
    <div class="class-compare">
      <div class="cc-cell"><div class="cc-val you">${rec.total}</div><div class="cc-lbl">Your Score</div></div>
      <div class="cc-cell"><div class="cc-val">${rec.classAverage || "—"}</div><div class="cc-lbl">Class Avg</div></div>
      <div class="cc-cell"><div class="cc-val top">${rec.classHighest || "—"}</div><div class="cc-lbl">Highest</div></div>
    </div>
    ${rec.studentRank && rec.classSize ? `
    <div style="padding:12px 20px;border-top:1px solid var(--border)">
      <span class="rank-badge">🏆 &nbsp;Rank ${rec.studentRank} of ${rec.classSize} students</span>
      ${rec.studentRank > 1 ? `<span style="font-family:var(--fm);font-size:11px;color:var(--fire-mid);margin-left:10px">
        ${rec.studentRank - 1} student${rec.studentRank-1>1?"s":""} ahead — close the gap.</span>` : `<span style="font-family:var(--fm);font-size:11px;color:var(--green);margin-left:10px">Top of the class — now defend it.</span>`}
    </div>` : ""}
  </div>`;

  requestAnimationFrame(() => setTimeout(() => {
    document.querySelectorAll(".score-bar-fill")
      .forEach(el => { el.style.width = el.dataset.w; });
  }, 80));
}

// ── Review block ──────────────────────────────────────────
function renderReview(rec) {
  const gTags = rec.good.split(",").map(t => `<span class="tag tag-good">${t.trim()}</span>`).join("");
  const bTags = rec.improve.split(",").map(t => `<span class="tag tag-bad">${t.trim()}</span>`).join("");

  document.getElementById("reviewPanel").innerHTML = `
  <div style="margin-bottom:20px">
    <div class="section-label">Tutor Feedback</div>
    <div class="marks-panel">
      <div class="review-section">
        <div class="review-block good">
          <div class="review-block-title">✓ &nbsp;Strong Areas — Keep These Sharp</div>
          <div class="tags-wrap">${gTags}</div>
        </div>
        <div class="review-block improve">
          <div class="review-block-title">⚠ &nbsp;These Will Cost You Marks — Fix Them Now</div>
          <div class="tags-wrap">${bTags}</div>
        </div>
        <div class="review-block notes">
          <div class="review-block-title">✎ &nbsp;Tutor's Direct Message to You</div>
          <p class="review-text">${rec.review}</p>
        </div>
      </div>
    </div>
  </div>`;
}

// ── Paper analysis ─────────────────────────────────────────
function renderPaperAnalysis(stats, classStats) {
  const qs = stats.questions;
  if (!qs || qs.length === 0) return;

  document.getElementById("paperAnalysisSection").style.display = "block";

  const avgSuccessRate = Math.round(
    qs.reduce((s,q) => s + (q.attempted>0 ? (q.correct/q.attempted)*100 : 0), 0) / qs.length
  );

  document.getElementById("paperSummaryRow").innerHTML = `
    <div class="cc-cell"><div class="cc-val" style="color:var(--cream)">${classStats ? classStats.size : "—"}</div><div class="cc-lbl">Students</div></div>
    <div class="cc-cell"><div class="cc-val" style="color:var(--blue)">${classStats ? classStats.average : "—"}</div><div class="cc-lbl">Class Avg</div></div>
    <div class="cc-cell"><div class="cc-val" style="color:var(--green)">${classStats ? classStats.highest : "—"}</div><div class="cc-lbl">Highest</div></div>
    <div class="cc-cell"><div class="cc-val" style="color:var(--fire-mid)">${avgSuccessRate}%</div><div class="cc-lbl">Avg Success</div></div>`;

  Charts.questions(qs, classStats ? classStats.size : 1);

  document.getElementById("qaBody").innerHTML = qs.map(q => {
    const rate  = q.attempted > 0 ? Math.round((q.correct/q.attempted)*100) : 0;
    const rateC = rate >= 70 ? "rate-high" : rate >= 40 ? "rate-mid" : "rate-low";
    const aPct  = classStats && classStats.size > 0 ? Math.round((q.attempted/classStats.size)*100) : 100;
    return `<tr>
      <td class="num">Q${q.qNo}</td>
      <td>${q.topic || q.qName}</td>
      <td class="num">${q.maxMarks}</td>
      <td>
        <div class="attempt-bar-wrap">
          <div class="attempt-bar"><div class="attempt-bar-fill" style="width:${aPct}%"></div></div>
          <span class="num">${q.attempted}</span>
        </div>
      </td>
      <td class="num">${q.correct}</td>
      <td class="num">${q.avgScore}</td>
      <td class="num ${rateC}">${rate}%</td>
    </tr>`;
  }).join("");
}

// ── History table ──────────────────────────────────────────
function renderHistory(records) {
  if (records.length <= 1) { document.getElementById("historySection").style.display = "none"; return; }
  document.getElementById("historySection").style.display = "block";
  document.getElementById("historyBody").innerHTML = records.map((r,i) => `
    <tr onclick="selectPaper(${i})">
      <td>${r.paper}${i===0?' <span class="badge-latest">latest</span>':""}</td>
      <td>${r.date}</td>
      <td class="num">${r.partA}/${r.maxA}</td>
      <td class="num">${r.partB}/${r.maxB}</td>
      <td class="num">${r.total}/${r.maxTotal}</td>
      <td class="num">${pct(r.total,r.maxTotal)}%</td>
      <td class="num">${r.grade}</td>
    </tr>`).join("");
}

function selectPaper(i) {
  renderMarksPanel(allRecords[i], i===0);
  renderReview(allRecords[i]);
  document.getElementById("marksPanel").scrollIntoView({ behavior:"smooth", block:"start" });
}

// ── Download PDF ───────────────────────────────────────────
async function downloadPDF() {
  const btn = document.getElementById("dlBtn");
  btn.textContent   = "Generating…";
  btn.style.opacity = "0.6";
  btn.disabled      = true;

  try {
    const url  = `${CONFIG.API_URL}?action=getPDF&query=${encodeURIComponent(currentQuery)}`;
    const data = await gsCall(url, 20000);
    if (data.error) { setError(data.error); }
    else {
      const bytes   = atob(data.pdf);
      const arr     = new Uint8Array(bytes.length);
      for (let i=0;i<bytes.length;i++) arr[i]=bytes.charCodeAt(i);
      const blobUrl = URL.createObjectURL(new Blob([arr],{type:"application/pdf"}));
      const a       = document.createElement("a");
      a.href = blobUrl; a.download = data.filename; a.click();
      URL.revokeObjectURL(blobUrl);
    }
  } catch(e) { setError("PDF failed: " + e.message); }

  btn.innerHTML     = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download PDF`;
  btn.style.opacity = "1";
  btn.disabled      = false;
}

// ── Open share modal ───────────────────────────────────────
function openShare() {
  if (!allData || !allRecords.length) return;
  Share.open(allRecords[0], allData.student, allData.quote);
}

// ── Helpers ───────────────────────────────────────────────
function pct(a,b) { return b>0 ? Math.round((a/b)*100) : 0; }
function showSpinner(on) { document.getElementById("spinnerWrap").style.display = on?"flex":"none"; }
function setError(msg)   { const b=document.getElementById("errorBox"); b.textContent=msg; b.style.display=msg?"block":"none"; }
function setSearchBtn(l) { const b=document.getElementById("searchBtn"); b.textContent=l?"Searching…":"Search"; b.disabled=l; }
