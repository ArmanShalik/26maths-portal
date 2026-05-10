// ============================================================
//  SHARE MODULE — Progress Card Generator & WhatsApp Share
//  Battle Station Edition — includes exam countdown on card
// ============================================================

const Share = (() => {

  let _rec     = null;
  let _student = "";
  let _quote   = "";

  // ── Public: open share modal ─────────────────────────────
  function open(rec, studentName, quote) {
    _rec     = rec;
    _student = studentName;
    _quote   = quote || "";

    let modal = document.getElementById("shareModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "shareModal";
      modal.className = "modal-overlay";
      modal.innerHTML = `
        <div class="modal-box">
          <div class="modal-title">Share Your Result</div>
          <div class="modal-subtitle">A high-quality card will be sent to your tutor via WhatsApp</div>
          <div class="card-preview-wrap">
            <canvas id="shareCardCanvas"></canvas>
          </div>
          <div class="modal-actions">
            <button class="btn-whatsapp" onclick="Share.sendWhatsApp()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Send to Tutor via WhatsApp
            </button>
            <button class="btn-outline" onclick="Share.downloadCard()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Save Image
            </button>
            <button class="modal-close" onclick="Share.close()">✕ Close</button>
          </div>
        </div>`;
      document.body.appendChild(modal);
      modal.addEventListener("click", e => { if (e.target === modal) Share.close(); });
    }

    modal.style.display = "flex";
    setTimeout(() => drawCard(), 80);
  }

  // ── Draw share card ──────────────────────────────────────
  function drawCard() {
    const canvas = document.getElementById("shareCardCanvas");
    const W = 1080, H = 1400;
    canvas.width  = W;
    canvas.height = H;
    canvas.style.width  = "100%";
    canvas.style.height = "auto";

    const ctx = canvas.getContext("2d");
    const rec = _rec;

    // Exam countdown
    const examDate = new Date((CONFIG.EXAM_DATE || "2026-08-10") + "T00:00:00");
    const daysLeft = Math.max(0, Math.floor((examDate - new Date()) / (1000 * 60 * 60 * 24)));

    // ── Background ──
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0,   "#060810");
    bgGrad.addColorStop(0.5, "#0a0d1a");
    bgGrad.addColorStop(1,   "#060810");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // ── Grid lines ──
    ctx.strokeStyle = "rgba(212,168,67,0.05)";
    ctx.lineWidth   = 1;
    for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    // ── Fire glow top ──
    const fireGlow = ctx.createRadialGradient(W/2, 0, 0, W/2, 0, 500);
    fireGlow.addColorStop(0,   "rgba(255,107,53,0.12)");
    fireGlow.addColorStop(0.5, "rgba(212,168,67,0.06)");
    fireGlow.addColorStop(1,   "transparent");
    ctx.fillStyle = fireGlow;
    ctx.fillRect(0, 0, W, 500);

    // ── Top accent bar (fire gradient) ──
    const barGrad = ctx.createLinearGradient(0, 0, W, 0);
    barGrad.addColorStop(0,   "#ff4b1f");
    barGrad.addColorStop(0.3, "#ffb347");
    barGrad.addColorStop(0.7, "#d4a843");
    barGrad.addColorStop(1,   "#ff4b1f");
    ctx.fillStyle = barGrad;
    ctx.fillRect(0, 0, W, 7);

    // ── Tutor name ──
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(212,168,67,0.7)";
    ctx.font      = "500 27px 'DM Mono', monospace";
    ctx.fillText(CONFIG.TUTOR_NAME.toUpperCase(), W/2, 70);

    // ── Title ──
    ctx.fillStyle = "#f5efe0";
    ctx.font      = "900 86px 'Playfair Display', Georgia, serif";
    ctx.fillText("Combined Maths", W/2, 175);

    ctx.fillStyle = "rgba(245,239,224,0.4)";
    ctx.font      = "400 30px 'DM Mono', monospace";
    ctx.letterSpacing = "6px";
    ctx.fillText("PERFORMANCE REVIEW", W/2, 222);
    ctx.letterSpacing = "0px";

    // ── Divider ──
    drawGoldLine(ctx, 80, 260, W - 80, 260);

    // ── Student name ──
    ctx.fillStyle = "#d4a843";
    ctx.font      = "400 24px 'DM Mono', monospace";
    ctx.letterSpacing = "4px";
    ctx.fillText("STUDENT", W/2, 315);
    ctx.letterSpacing = "0px";

    ctx.fillStyle = "#f5efe0";
    ctx.font      = "700 62px 'Playfair Display', Georgia, serif";
    ctx.fillText(_student, W/2, 395);

    ctx.fillStyle = "rgba(245,239,224,0.4)";
    ctx.font      = "400 27px 'DM Mono', monospace";
    ctx.fillText(`${rec.paper}  ·  ${rec.date}`, W/2, 442);

    // ── Score boxes ──
    const scores = [
      { label:"PART A", val:rec.partA, max:rec.maxA,    pctV:pct(rec.partA,rec.maxA)    },
      { label:"PART B", val:rec.partB, max:rec.maxB,    pctV:pct(rec.partB,rec.maxB)    },
      { label:"TOTAL",  val:rec.total, max:rec.maxTotal, pctV:pct(rec.total,rec.maxTotal) }
    ];

    const boxW = 280, boxH = 195, boxY = 492, gap = 30;
    const totalBoxW = scores.length * boxW + (scores.length-1) * gap;
    let bx = (W - totalBoxW) / 2;

    scores.forEach(s => {
      ctx.fillStyle = "rgba(11,14,26,0.95)";
      roundRect(ctx, bx, boxY, boxW, boxH, 16); ctx.fill();
      ctx.strokeStyle = s.label === "TOTAL" ? "rgba(212,168,67,0.5)" : "rgba(212,168,67,0.2)";
      ctx.lineWidth   = s.label === "TOTAL" ? 2 : 1.5;
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.fillStyle = s.label === "TOTAL" ? "#f5efe0" : "rgba(245,239,224,0.85)";
      ctx.font      = `700 70px 'DM Mono', monospace`;
      ctx.fillText(s.val, bx + boxW/2, boxY + 86);

      ctx.fillStyle = "rgba(245,239,224,0.4)";
      ctx.font      = "400 26px 'DM Mono', monospace";
      ctx.fillText(`/ ${s.max}`, bx + boxW/2, boxY + 118);

      // Progress bar
      const barX = bx + 20, barY2 = boxY + 138, bWF = boxW - 40, bH = 6;
      ctx.fillStyle = "rgba(255,255,255,0.07)";
      roundRect(ctx, barX, barY2, bWF, bH, 3); ctx.fill();

      const barCol = ctx.createLinearGradient(barX, 0, barX + bWF, 0);
      if (s.pctV >= 70) { barCol.addColorStop(0,"#4ade80"); barCol.addColorStop(1,"#86efac"); }
      else if (s.pctV >= 50) { barCol.addColorStop(0,"#d4a843"); barCol.addColorStop(1,"#f0c060"); }
      else if (s.pctV >= 35) { barCol.addColorStop(0,"#ff6b35"); barCol.addColorStop(1,"#ffb347"); }
      else { barCol.addColorStop(0,"#ff4b1f"); barCol.addColorStop(1,"#ff6b35"); }
      ctx.fillStyle = barCol;
      roundRect(ctx, barX, barY2, bWF * s.pctV / 100, bH, 3); ctx.fill();

      ctx.fillStyle = "rgba(212,168,67,0.85)";
      ctx.font      = "500 22px 'DM Mono', monospace";
      ctx.fillText(`${s.pctV}%`, bx + boxW/2, boxY + 180);

      ctx.fillStyle = "rgba(245,239,224,0.35)";
      ctx.font      = "500 19px 'DM Mono', monospace";
      ctx.letterSpacing = "4px";
      ctx.fillText(s.label, bx + boxW/2, boxY + 208);
      ctx.letterSpacing = "0px";

      bx += boxW + gap;
    });

    // ── Grade + Z-Score band ──
    const bandY = 724;
    ctx.fillStyle = "rgba(11,14,26,0.95)";
    roundRect(ctx, 80, bandY, W - 160, 108, 12); ctx.fill();
    ctx.strokeStyle = "rgba(212,168,67,0.28)"; ctx.lineWidth = 1; ctx.stroke();

    ctx.textAlign  = "center";
    ctx.fillStyle  = "rgba(245,239,224,0.38)";
    ctx.font       = "400 20px 'DM Mono', monospace";
    ctx.letterSpacing = "3px";
    ctx.fillText("GRADE", W/4, bandY + 40);
    ctx.letterSpacing = "0";
    ctx.fillStyle  = gradeColor(rec.grade);
    ctx.font       = "700 52px 'Playfair Display', serif";
    ctx.fillText(rec.grade, W/4, bandY + 88);

    ctx.strokeStyle = "rgba(212,168,67,0.2)";
    ctx.lineWidth   = 1;
    ctx.beginPath(); ctx.moveTo(W/2, bandY+18); ctx.lineTo(W/2, bandY+94); ctx.stroke();

    ctx.fillStyle  = "rgba(245,239,224,0.38)";
    ctx.font       = "400 20px 'DM Mono', monospace";
    ctx.letterSpacing = "3px";
    ctx.fillText("Z-SCORE", (W*3)/4, bandY + 40);
    ctx.letterSpacing = "0";
    const zNum     = parseFloat(rec.zScore);
    ctx.fillStyle  = zNum > 0 ? "#4ade80" : zNum < 0 ? "#f87171" : "#60a5fa";
    ctx.font       = "700 52px 'Playfair Display', serif";
    ctx.fillText(isNaN(zNum) ? "N/A" : rec.zScore, (W*3)/4, bandY + 88);

    // ── Class comparison ──
    const ccY = 880;
    ctx.textAlign  = "center";
    ctx.fillStyle  = "rgba(212,168,67,0.6)";
    ctx.font       = "500 22px 'DM Mono', monospace";
    ctx.letterSpacing = "4px";
    ctx.fillText("CLASS COMPARISON", W/2, ccY);
    ctx.letterSpacing = "0";

    const ccItems = [
      { label:"YOUR SCORE", val:rec.total,              color:"#d4a843" },
      { label:"CLASS AVG",  val:rec.classAverage || "—",color:"#60a5fa" },
      { label:"HIGHEST",    val:rec.classHighest || "—",color:"#4ade80" },
      { label:"CLASS RANK", val:rec.studentRank && rec.classSize ? `#${rec.studentRank}/${rec.classSize}` : "—", color:"#c084fc" }
    ];
    const ccW = (W - 160) / ccItems.length;
    ccItems.forEach((item, i) => {
      const cx = 80 + ccW * i + ccW / 2;
      ctx.fillStyle = item.color;
      ctx.font      = "700 42px 'DM Mono', monospace";
      ctx.fillText(item.val, cx, ccY + 68);
      ctx.fillStyle = "rgba(245,239,224,0.32)";
      ctx.font      = "400 17px 'DM Mono', monospace";
      ctx.letterSpacing = "2px";
      ctx.fillText(item.label, cx, ccY + 96);
      ctx.letterSpacing = "0";
    });

    // ── EXAM COUNTDOWN block ──
    const exY = 1020;
    ctx.fillStyle = "rgba(255,75,31,0.08)";
    roundRect(ctx, 80, exY, W - 160, 100, 12); ctx.fill();
    ctx.strokeStyle = "rgba(255,107,53,0.35)"; ctx.lineWidth = 1; ctx.stroke();

    ctx.textAlign  = "center";
    ctx.fillStyle  = "rgba(255,107,53,0.7)";
    ctx.font       = "500 18px 'DM Mono', monospace";
    ctx.letterSpacing = "4px";
    ctx.fillText("⚡  EXAM COUNTDOWN", W/2, exY + 36);
    ctx.letterSpacing = "0";

    ctx.fillStyle  = daysLeft < 30 ? "#ff4b1f" : daysLeft < 60 ? "#ffb347" : "#f5efe0";
    ctx.font       = "700 52px 'Playfair Display', serif";
    ctx.fillText(`${daysLeft} DAYS REMAINING`, W/2, exY + 85);

    // ── Quote ──
    const qY = 1160;
    ctx.fillStyle = "rgba(11,14,26,0.95)";
    roundRect(ctx, 80, qY, W - 160, 160, 12); ctx.fill();
    ctx.strokeStyle = "rgba(255,107,53,0.25)"; ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(212,168,67,0.2)"; ctx.stroke();

    // Left accent
    ctx.fillStyle = "rgba(255,107,53,0.9)";
    roundRect(ctx, 80, qY, 5, 160, 3); ctx.fill();

    ctx.fillStyle  = "rgba(245,239,224,0.75)";
    ctx.font       = `italic 400 26px 'Playfair Display', Georgia, serif`;
    ctx.textAlign  = "center";
    wrapText(ctx, _quote, W/2, qY + 50, W - 240, 38);

    // ── Bottom bar ──
    ctx.fillStyle  = "rgba(10,13,22,0.95)";
    ctx.fillRect(0, H - 78, W, 78);
    drawFireLine(ctx, 0, H - 78, W, H - 78);

    ctx.textAlign  = "center";
    ctx.fillStyle  = "rgba(212,168,67,0.5)";
    ctx.font       = "400 22px 'DM Mono', monospace";
    ctx.letterSpacing = "3px";
    ctx.fillText(CONFIG.PORTAL_URL, W/2, H - 38);
    ctx.letterSpacing = "0";

    ctx.fillStyle  = "rgba(245,239,224,0.18)";
    ctx.font       = "400 18px 'DM Mono', monospace";
    ctx.fillText("Combined Maths Battle Station  ·  " + new Date().toLocaleDateString(), W/2, H - 14);

    ctx.fillStyle  = barGrad;
    ctx.fillRect(0, H - 7, W, 7);
  }

  // ── WhatsApp share ────────────────────────────────────────
  function sendWhatsApp() {
    const rec   = _rec;
    const name  = _student;
    const score = `${rec.total}/${rec.maxTotal} (${pct(rec.total,rec.maxTotal)}%)`;
    const rank  = rec.studentRank && rec.classSize ? `Rank ${rec.studentRank}/${rec.classSize}` : "";
    const examDate = new Date((CONFIG.EXAM_DATE || "2026-08-10") + "T00:00:00");
    const daysLeft = Math.max(0, Math.floor((examDate - new Date()) / (1000 * 60 * 60 * 24)));

    const caption =
      `⚡ *COMBINED MATHS RESULTS*\n\n` +
      `👤 *Student:* ${name}\n` +
      `📄 *Paper:* ${rec.paper}\n` +
      `📅 *Date:* ${rec.date}\n\n` +
      `📊 *Scores:*\n` +
      `   Part A: ${rec.partA}/${rec.maxA}\n` +
      `   Part B: ${rec.partB}/${rec.maxB}\n` +
      `   Total:  ${score}\n` +
      (rank ? `\n🏆 ${rank}\n` : "") +
      `\n📈 *Grade:* ${rec.grade}  |  *Z-Score:* ${rec.zScore}\n\n` +
      `⏱️ *${daysLeft} days to exam* — use every single one.\n\n` +
      `💬 _${_quote}_\n\n` +
      `🔗 ${CONFIG.PORTAL_URL}`;

    const canvas = document.getElementById("shareCardCanvas");
    canvas.toBlob(blob => {
      const file = new File([blob], `Result_${name.replace(/\s+/g,"_")}.png`, { type:"image/png" });
      if (navigator.canShare && navigator.canShare({ files:[file] })) {
        navigator.share({ files:[file], text:caption, title:`Combined Maths Result — ${name}` })
          .catch(() => fallbackShare(caption));
      } else {
        fallbackShare(caption);
      }
    }, "image/png", 1.0);
  }

  function fallbackShare(caption) {
    downloadCard();
    setTimeout(() => {
      const url = `https://wa.me/${CONFIG.TUTOR_WHATSAPP}?text=${encodeURIComponent(caption)}`;
      window.open(url, "_blank");
    }, 600);
  }

  function downloadCard() {
    const canvas = document.getElementById("shareCardCanvas");
    const a      = document.createElement("a");
    a.href     = canvas.toDataURL("image/png", 1.0);
    a.download = `Result_${_student.replace(/\s+/g,"_")}_${_rec.paper.replace(/\s+/g,"_")}.png`;
    a.click();
  }

  function close() {
    const modal = document.getElementById("shareModal");
    if (modal) modal.style.display = "none";
  }

  // ── Canvas helpers ────────────────────────────────────────
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
    ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
    ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
    ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r);
    ctx.closePath();
  }
  function drawGoldLine(ctx, x1, y1, x2, y2) {
    const g = ctx.createLinearGradient(x1,y1,x2,y2);
    g.addColorStop(0,"transparent"); g.addColorStop(0.3,"rgba(212,168,67,0.55)");
    g.addColorStop(0.7,"rgba(212,168,67,0.55)"); g.addColorStop(1,"transparent");
    ctx.strokeStyle=g; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  }
  function drawFireLine(ctx, x1, y1, x2, y2) {
    const g = ctx.createLinearGradient(x1,y1,x2,y2);
    g.addColorStop(0,"transparent"); g.addColorStop(0.3,"rgba(255,107,53,0.5)");
    g.addColorStop(0.7,"rgba(255,107,53,0.5)"); g.addColorStop(1,"transparent");
    ctx.strokeStyle=g; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  }
  function wrapText(ctx, text, x, y, maxW, lineH) {
    const words = text.split(" ");
    let line = "", cy = y;
    words.forEach(word => {
      const test = line + word + " ";
      if (ctx.measureText(test).width > maxW && line !== "") {
        ctx.fillText(line.trim(), x, cy);
        line = word + " "; cy += lineH;
      } else { line = test; }
    });
    if (line.trim()) ctx.fillText(line.trim(), x, cy);
  }
  function pct(a,b) { return b>0 ? Math.round((a/b)*100) : 0; }
  function gradeColor(g) {
    const m = { A:"#4ade80",B:"#86efac",C:"#d4a843",S:"#60a5fa",W:"#ffb347",F:"#ff4b1f" };
    return m[g] || "#f5efe0";
  }

  return { open, sendWhatsApp, downloadCard, close };

})();
