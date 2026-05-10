// ============================================================
//  CHARTS MODULE — Battle Station Edition
// ============================================================

const Charts = (() => {

  let instances = {};

  Chart.defaults.color       = "rgba(245,239,224,0.50)";
  Chart.defaults.borderColor = "rgba(212,168,67,0.10)";
  Chart.defaults.font.family = "'DM Mono', monospace";
  Chart.defaults.font.size   = 11;

  function destroy(id) {
    if (instances[id]) { instances[id].destroy(); delete instances[id]; }
  }
  function destroyAll() {
    Object.keys(instances).forEach(destroy);
  }

  // ── Trend line ────────────────────────────────────────────
  function trend(records) {
    destroy("trendChart");
    const rev    = [...records].reverse();
    const labels = rev.map(r => r.paper.length > 12 ? r.paper.substring(0,12)+"…" : r.paper);
    const scores = rev.map(r => pct(r.total, r.maxTotal));
    const ctx    = document.getElementById("trendChart").getContext("2d");

    // Colour each point by score
    const pointColors = scores.map(s =>
      s >= 70 ? "rgba(74,222,128,1)"    :
      s >= 50 ? "rgba(212,168,67,1)"    :
      s >= 35 ? "rgba(255,179,71,1)"    :
               "rgba(255,75,31,1)"
    );

    instances["trendChart"] = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label               : "Score %",
          data                : scores,
          borderColor         : "#d4a843",
          backgroundColor     : "rgba(212,168,67,0.06)",
          pointBackgroundColor: pointColors,
          pointBorderColor    : pointColors,
          pointRadius         : 6,
          pointHoverRadius    : 8,
          tension             : 0.35,
          fill                : true,
          borderWidth         : 2
        }]
      },
      options: {
        responsive          : true,
        maintainAspectRatio : false,
        plugins: {
          legend : { display: false },
          tooltip: { callbacks: { label: c => ` ${c.parsed.y}%` } }
        },
        scales: {
          x: { grid: { color: "rgba(212,168,67,0.06)" } },
          y: { grid: { color: "rgba(212,168,67,0.06)" }, min: 0, max: 100, ticks: { callback: v => v+"%" } }
        }
      }
    });
  }

  // ── Compare bars ──────────────────────────────────────────
  function compare(rec) {
    destroy("compareChart");
    const youPct  = pct(rec.total,        rec.maxTotal);
    const avgPct  = rec.classAverage ? pct(rec.classAverage, rec.maxTotal) : 0;
    const highPct = rec.classHighest ? pct(rec.classHighest, rec.maxTotal) : 0;
    const ctx = document.getElementById("compareChart").getContext("2d");

    const youColor = youPct >= 70 ? "rgba(74,222,128,0.85)"   :
                     youPct >= 50 ? "rgba(212,168,67,0.85)"   :
                     youPct >= 35 ? "rgba(255,179,71,0.85)"   :
                                    "rgba(255,75,31,0.85)";

    instances["compareChart"] = new Chart(ctx, {
      type: "bar",
      data: {
        labels  : ["You", "Class Avg", "Highest"],
        datasets: [{
          data           : [youPct, avgPct, highPct],
          backgroundColor: [youColor, "rgba(96,165,250,0.6)", "rgba(74,222,128,0.6)"],
          borderColor    : [youColor.replace("0.85","1"), "#60a5fa","#4ade80"],
          borderWidth    : 1,
          borderRadius   : 6
        }]
      },
      options: {
        responsive          : true,
        maintainAspectRatio : false,
        plugins: { legend: { display: false } },
        scales : {
          x: { grid: { display: false } },
          y: { grid: { color: "rgba(212,168,67,0.06)" }, min:0, max:100, ticks:{ callback: v => v+"%" } }
        }
      }
    });
  }

  // ── Parts bars ────────────────────────────────────────────
  function parts(records) {
    destroy("partsChart");
    const rev    = [...records].reverse();
    const labels = rev.map(r => r.paper.length > 10 ? r.paper.substring(0,10)+"…" : r.paper);
    const ctx = document.getElementById("partsChart").getContext("2d");
    instances["partsChart"] = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label:"Part A %", data:rev.map(r=>pct(r.partA,r.maxA)), backgroundColor:"rgba(192,132,252,0.6)", borderColor:"#c084fc", borderWidth:1, borderRadius:4 },
          { label:"Part B %", data:rev.map(r=>pct(r.partB,r.maxB)), backgroundColor:"rgba(96,165,250,0.6)",  borderColor:"#60a5fa", borderWidth:1, borderRadius:4 }
        ]
      },
      options: {
        responsive          : true,
        maintainAspectRatio : false,
        plugins: { legend: { labels: { boxWidth: 12 } } },
        scales : {
          x: { grid: { display: false } },
          y: { grid: { color:"rgba(212,168,67,0.06)" }, min:0, max:100, ticks:{ callback: v => v+"%" } }
        }
      }
    });
  }

  // ── Questions ─────────────────────────────────────────────
  function questions(qs, classSize) {
    destroy("questionChart");
    const ctx = document.getElementById("questionChart").getContext("2d");
    instances["questionChart"] = new Chart(ctx, {
      type: "bar",
      data: {
        labels  : qs.map(q => `Q${q.qNo}`),
        datasets: [
          { label:"Avg Score", data:qs.map(q=>parseFloat(q.avgScore.toFixed(1))), backgroundColor:"rgba(96,165,250,0.7)", borderColor:"rgba(96,165,250,1)", borderWidth:1, borderRadius:4 },
          { label:"Max Marks", data:qs.map(q=>q.maxMarks), backgroundColor:"rgba(212,168,67,0.12)", borderColor:"rgba(212,168,67,0.4)", borderWidth:1, borderRadius:4 }
        ]
      },
      options: {
        responsive          : true,
        maintainAspectRatio : false,
        plugins: { legend: { labels: { boxWidth: 12 } } },
        scales : {
          x: { grid: { color:"rgba(212,168,67,0.06)" } },
          y: { grid: { color:"rgba(212,168,67,0.06)" }, beginAtZero:true }
        }
      }
    });
  }

  function pct(a,b) { return b>0 ? Math.round((a/b)*100) : 0; }

  return { trend, compare, parts, questions, destroyAll };

})();
