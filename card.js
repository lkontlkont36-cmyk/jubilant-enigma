const path = require("path");
const { createCanvas, GlobalFonts } = require("@napi-rs/canvas");

GlobalFonts.registerFromPath(path.join(__dirname, "fonts", "DejaVuSans.ttf"), "Main");
GlobalFonts.registerFromPath(path.join(__dirname, "fonts", "DejaVuSans-Bold.ttf"), "MainBold");

const C = {
  bg: "#0a1222",
  cardTop: "#0f2342",
  cardBottom: "#0a1020",
  cell: "#0e1a33",
  border: "#1d3358",
  text: "#ffffff",
  muted: "#8aa0c4",
  blue: "#38bdf8",
  green: "#4ade80",
  orange: "#fb923c",
  purple: "#a78bfa",
  red: "#f87171",
};

const PILLS = {
  blue: { bg: "#12304f", fg: "#7dd3fc" },
  green: { bg: "#10392a", fg: "#4ade80" },
  red: { bg: "#3b1219", fg: "#f87171" },
  indigo: { bg: "#2b2f6b", fg: "#a5b4fc" },
  orange: { bg: "#3d2410", fg: "#fdba74" },
};

function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function setFont(ctx, size, bold) {
  ctx.font = `${size}px ${bold ? "MainBold" : "Main"}`;
}

function text(ctx, str, x, y, { size = 30, bold = false, color = C.text, align = "right", dir = "rtl" } = {}) {
  setFont(ctx, size, bold);
  ctx.fillStyle = color;
  ctx.direction = dir;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(String(str), x, y);
}

function width(ctx, str, size, bold, dir = "ltr") {
  setFont(ctx, size, bold);
  ctx.direction = dir;
  return ctx.measureText(String(str)).width;
}

// ---------- icons ----------
function cloud(ctx, cx, cy, s, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx - s * 0.35, cy + s * 0.1, s * 0.3, 0, Math.PI * 2);
  ctx.arc(cx, cy - s * 0.12, s * 0.38, 0, Math.PI * 2);
  ctx.arc(cx + s * 0.38, cy + s * 0.12, s * 0.28, 0, Math.PI * 2);
  ctx.fill();
  rr(ctx, cx - s * 0.65, cy + s * 0.05, s * 1.3, s * 0.35, s * 0.17);
  ctx.fill();
}

function sun(ctx, cx, cy, s) {
  ctx.fillStyle = "#fbbf24";
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = Math.max(2, s * 0.09);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy, s * 0.36, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI / 4) * i;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * s * 0.55, cy + Math.sin(a) * s * 0.55);
    ctx.lineTo(cx + Math.cos(a) * s * 0.78, cy + Math.sin(a) * s * 0.78);
    ctx.stroke();
  }
}

function iconKind(code) {
  if (code === 0) return "sun";
  if (code === 1 || code === 2) return "partly";
  if (code === 3) return "cloud";
  if (code === 45 || code === 48) return "fog";
  if ([51, 53, 55, 61, 63, 65, 80, 81].includes(code)) return "rain";
  if ([71, 73, 75].includes(code)) return "snow";
  if ([82, 95, 96, 99].includes(code)) return "storm";
  return "cloud";
}

function drawIcon(ctx, kind, cx, cy, s) {
  ctx.save();
  if (kind === "sun") sun(ctx, cx, cy, s);
  else if (kind === "partly") {
    sun(ctx, cx - s * 0.25, cy - s * 0.25, s * 0.7);
    cloud(ctx, cx + s * 0.1, cy + s * 0.15, s * 0.8, "#cbd5e1");
  } else if (kind === "cloud") cloud(ctx, cx, cy, s, "#cbd5e1");
  else if (kind === "fog") {
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = s * 0.1;
    ctx.lineCap = "round";
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.6, cy + i * s * 0.3);
      ctx.lineTo(cx + s * 0.6, cy + i * s * 0.3);
      ctx.stroke();
    }
  } else if (kind === "rain") {
    cloud(ctx, cx, cy - s * 0.15, s * 0.9, "#cbd5e1");
    ctx.strokeStyle = C.blue;
    ctx.lineWidth = s * 0.09;
    ctx.lineCap = "round";
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + i * s * 0.3 + s * 0.06, cy + s * 0.4);
      ctx.lineTo(cx + i * s * 0.3 - s * 0.06, cy + s * 0.68);
      ctx.stroke();
    }
  } else if (kind === "snow") {
    cloud(ctx, cx, cy - s * 0.15, s * 0.9, "#cbd5e1");
    ctx.fillStyle = "#ffffff";
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.arc(cx + i * s * 0.3, cy + s * 0.55, s * 0.07, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === "storm") {
    cloud(ctx, cx, cy - s * 0.2, s * 0.9, "#94a3b8");
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.moveTo(cx + s * 0.08, cy + s * 0.2);
    ctx.lineTo(cx - s * 0.18, cy + s * 0.56);
    ctx.lineTo(cx - s * 0.02, cy + s * 0.56);
    ctx.lineTo(cx - s * 0.12, cy + s * 0.85);
    ctx.lineTo(cx + s * 0.24, cy + s * 0.43);
    ctx.lineTo(cx + s * 0.07, cy + s * 0.43);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

// ---------- cells ----------
function cellBase(ctx, x, y, w, h, accent) {
  ctx.fillStyle = C.cell;
  rr(ctx, x, y, w, h, 34);
  ctx.fill();
  ctx.strokeStyle = C.border;
  ctx.lineWidth = 2;
  rr(ctx, x, y, w, h, 34);
  ctx.stroke();
  ctx.fillStyle = accent;
  rr(ctx, x + w - 22, y + 22, 8, h - 44, 4);
  ctx.fill();
}

const AR = /[\u0600-\u06FF]/;

function pill(ctx, value, unit, leftX, cy, colors, maxW) {
  let vSize = 32;
  let uSize = 20;
  const calc = () => {
    const vw = width(ctx, value, vSize, true, AR.test(value) ? "rtl" : "ltr");
    const uw = unit ? width(ctx, unit, uSize, false, AR.test(unit) ? "rtl" : "ltr") + 8 : 0;
    return { vw, uw, w: vw + uw + 44 };
  };
  let m = calc();
  while (m.w > maxW && vSize > 20) {
    vSize -= 2;
    uSize = Math.max(14, uSize - 1);
    m = calc();
  }
  const h = 62;
  ctx.fillStyle = colors.bg;
  rr(ctx, leftX, cy - h / 2, m.w, h, 22);
  ctx.fill();
  const vDir = AR.test(value) ? "rtl" : "ltr";
  text(ctx, value, leftX + 22, cy, { size: vSize, bold: true, color: colors.fg, align: "left", dir: vDir });
  if (unit) {
    text(ctx, unit, leftX + 22 + m.vw + 8, cy, {
      size: uSize, color: colors.fg, align: "left", dir: AR.test(unit) ? "rtl" : "ltr",
    });
  }
}

function cell(ctx, x, y, w, h, accent, label, value, unit, pillColor) {
  cellBase(ctx, x, y, w, h, accent);
  const labelSize = label.length > 10 ? 24 : 27;
  const lw = width(ctx, label, labelSize, true, "rtl");
  text(ctx, label, x + w - 46, y + h / 2, { size: labelSize, bold: true });
  const maxW = w - 46 - lw - 28 - 10;
  pill(ctx, value, unit, x + 28, y + h / 2, PILLS[pillColor], maxW);
}

// ---------- main ----------
const WIND_DIRS = ["شمال", "شمال شرق", "شرق", "جنوب شرق", "جنوب", "جنوب غرب", "غرب", "شمال غرب"];
function windDirName(deg) {
  return WIND_DIRS[Math.round((((deg % 360) + 360) % 360) / 45) % 8];
}

function fmtClock(iso) {
  if (!iso) return "--";
  const [, t] = iso.split("T");
  let [h, m] = t.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")} ${ap}`;
}

function fmtDateTime(iso) {
  const d = new Date(iso + "Z");
  return d.toLocaleString("en-US", {
    timeZone: "UTC", weekday: "long", year: "numeric", month: "long",
    day: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
  }).replace(" at ", " • ");
}

function renderCard({ city, current: w, daily, unitSymbol, descAr }) {
  const W = 1000, H = 1364;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);

  // main card
  const g = ctx.createLinearGradient(0, 24, 0, H - 24);
  g.addColorStop(0, C.cardTop);
  g.addColorStop(1, C.cardBottom);
  ctx.fillStyle = g;
  rr(ctx, 24, 24, W - 48, H - 48, 46);
  ctx.fill();
  ctx.strokeStyle = C.border;
  ctx.lineWidth = 3;
  rr(ctx, 24, 24, W - 48, H - 48, 46);
  ctx.stroke();

  // header
  const hx = 52, hy = 52, hw = W - 104, hh = 150;
  ctx.fillStyle = "#0f2036";
  rr(ctx, hx, hy, hw, hh, 36);
  ctx.fill();
  ctx.strokeStyle = C.border;
  ctx.lineWidth = 2;
  rr(ctx, hx, hy, hw, hh, 36);
  ctx.stroke();

  // icon circle (right)
  const icx = hx + hw - 24 - 55, icy = hy + hh / 2;
  ctx.fillStyle = "#17375e";
  ctx.beginPath();
  ctx.arc(icx, icy, 55, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = C.blue;
  ctx.lineWidth = 4;
  ctx.stroke();
  drawIcon(ctx, iconKind(w.weather_code), icx, icy, 46);

  text(ctx, "معلومات الطقس", icx - 78, hy + 56, { size: 48, bold: true });
  text(ctx, "الحرارة • الرطوبة • الرياح • الحالة", icx - 78, hy + 106, { size: 24, color: C.muted });

  // status pill (left)
  const pw = Math.max(150, width(ctx, descAr, 28, true, "rtl") + 56);
  ctx.fillStyle = "#10392a";
  rr(ctx, hx + 28, hy + hh / 2 - 31, pw, 62, 26);
  ctx.fill();
  ctx.strokeStyle = "#1f9d58";
  ctx.lineWidth = 3;
  rr(ctx, hx + 28, hy + hh / 2 - 31, pw, 62, 26);
  ctx.stroke();
  text(ctx, descAr, hx + 28 + pw / 2, hy + hh / 2, { size: 28, bold: true, color: C.green, align: "center" });

  // grid
  const gap = 18, rowGap = 16, ch = 104;
  const cw = (W - 104 - gap) / 2;
  const xR = 52 + cw + gap;
  const xL = 52;
  let y = hy + hh + 18;

  const num = (v, d = 0) => (v === null || v === undefined ? "--" : Number(v).toFixed(d).replace(/\.0+$/, ""));

  const rows = [
    [
      ["المدينة", city, "", C.green, "indigo"],
      ["الحالة", descAr, "", C.blue, "blue"],
    ],
    [
      ["الحرارة", num(w.temperature_2m, 1), unitSymbol, C.orange, "orange"],
      ["الإحساس الفعلي", num(w.apparent_temperature, 1), unitSymbol, C.purple, "indigo"],
    ],
    [
      ["الرطوبة", num(w.relative_humidity_2m), "%", C.blue, "blue"],
      ["الغيوم", num(w.cloud_cover), "%", C.green, "green"],
    ],
    [
      ["سرعة الرياح", num(w.wind_speed_10m, 1), "كم/س", C.purple, "indigo"],
      ["هبّات الرياح", num(w.wind_gusts_10m, 1), "كم/س", C.orange, "orange"],
    ],
    [
      ["اتجاه الرياح", windDirName(w.wind_direction_10m), "", C.green, "green"],
      ["الضغط الجوي", num(w.surface_pressure), "hPa", C.blue, "blue"],
    ],
    [
      ["العظمى اليوم", num(daily.temperature_2m_max?.[0], 1), unitSymbol, C.red, "red"],
      ["الصغرى اليوم", num(daily.temperature_2m_min?.[0], 1), unitSymbol, C.blue, "blue"],
    ],
    [
      ["الشروق", fmtClock(daily.sunrise?.[0]), "", C.orange, "orange"],
      ["الغروب", fmtClock(daily.sunset?.[0]), "", C.purple, "indigo"],
    ],
    [
      ["الأمطار", num(w.precipitation, 1), "ملم", C.blue, "blue"],
      ["مؤشر UV", num(daily.uv_index_max?.[0], 1), "", C.red, "red"],
    ],
  ];

  for (const [right, left] of rows) {
    cell(ctx, xR, y, cw, ch, right[3], right[0], right[1], right[2], right[4]);
    cell(ctx, xL, y, cw, ch, left[3], left[0], left[1], left[2], left[4]);
    y += ch + rowGap;
  }

  // last update (full width)
  const fw = W - 104;
  cellBase(ctx, 52, y, fw, ch, C.green);
  text(ctx, "آخر تحديث", 52 + fw - 46, y + ch / 2, { size: 30, bold: true });
  text(ctx, fmtDateTime(w.time), 52 + 40, y + ch / 2, { size: 26, color: C.muted, align: "left", dir: "ltr" });

  text(ctx, "Weather • Open-Meteo", W / 2, H - 52, { size: 22, color: "#5b7094", align: "center", dir: "ltr" });

  return canvas.toBuffer("image/png");
}

module.exports = { renderCard };
