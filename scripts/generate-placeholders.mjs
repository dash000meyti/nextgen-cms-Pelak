#!/usr/bin/env node
// Generates placeholder SVG assets for the Hokmran mock site.
import { writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "../public/images");

const ACCENT = "#8b0016";

function wrap(content, viewBox = "0 0 1600 900") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img">\n${content}\n</svg>\n`;
}

function gradient(id, stops, angle = "0%,0%,100%,100%") {
  return `<defs><linearGradient id="${id}" x1="${angle.split(",")[0]}" y1="${
    angle.split(",")[1]
  }" x2="${angle.split(",")[2]}" y2="${angle.split(",")[3]}">${stops
    .map((s) => `<stop offset="${s[0]}%" stop-color="${s[1]}"/>`)
    .join("")}</linearGradient></defs>`;
}

function rect(w, h, fill, x = 0, y = 0) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;
}

function text(t, x, y, fill, size = 64, weight = "900", anchor = "middle") {
  return `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${t}</text>`;
}

// Article heroes (16:9)
function hero(name, label, stops, accentShape = "") {
  const svg = wrap(
    `${gradient("g", stops)}${rect(1600, 900, "url(#g)")}${accentShape}${text(
      label,
      800,
      470,
      "rgba(255,255,255,0.92)",
      56,
    )}`,
  );
  writeFileSync(join(outDir, name), svg);
}

hero(
  "ekhtiar-hero.svg",
  "اختیار برای ما، مسئولیت برای رهبری",
  [
    [0, "#1a1a1a"],
    [60, ACCENT],
    [100, "#3a0a12"],
  ],
  rect(0, 620, 1600, 280, "#0d0d0d"),
);
hero("solh-hero.svg", "صلح یا بازآرایی میدان؟", [
  [0, "#0f2027"],
  [50, "#203a43"],
  [100, "#2c5364"],
]);
hero("khalij-hero.svg", "خلیج فارس و حکمرانی بومی", [
  [0, "#0b3d5c"],
  [100, "#1e6091"],
]);
hero("ghorub-hero.svg", "غروب در واشنگتن", [
  [0, "#1a0f0a"],
  [50, ACCENT],
  [100, "#f0a36b"],
]);
hero("pishraft-hero.svg", "پیشرفت در حاشیه، رنج در متن", [
  [0, "#2d3436"],
  [100, "#636e72"],
]);
hero("naft-hero.svg", "نفت ملی و قیمت داخلی", [
  [0, "#2d2016"],
  [100, "#5c3d1e"],
]);
hero("mascan-hero.svg", "افق تیره مسکن", [
  [0, "#22333b"],
  [100, "#3a5056"],
]);
hero("hezb-hero.svg", "حزب؛ مدرسه حکمرانی", [
  [0, "#1b1b1b"],
  [100, "#3d3d3d"],
]);
hero("neoliberal-hero.svg", "تضادهای فرهنگی نئولیبرالیسم", [
  [0, "#2b2b52"],
  [100, "#5d5d8a"],
]);
hero("gouzashte-hero.svg", "گذشته جذاب‌تر از آینده", [
  [0, "#3a2c1e"],
  [100, "#7a5a3a"],
]);
hero("gol-sorkh-hero.svg", "راز گل سرخ", [
  [0, "#1a0408"],
  [60, ACCENT],
  [100, "#2a0a10"],
]);

// Issue covers (3:4 portrait)
function issueCover(name, label, num) {
  const svg = wrap(
    `${gradient(
      "g",
      [
        [0, "#0d0d0d"],
        [100, ACCENT],
      ],
      "0%,0%,100%,100%",
    )}${rect(1200, 1600, "url(#g)")}${rect(
      60,
      60,
      1180,
      1480,
      "none",
    )}<text x="600" y="260" font-family="Arial" font-size="180" font-weight="900" fill="rgba(255,255,255,0.95)" text-anchor="middle">${num}</text><text x="600" y="900" font-family="Arial" font-size="64" font-weight="900" fill="rgba(255,255,255,0.95)" text-anchor="middle">حکمران</text><text x="600" y="980" font-family="Arial" font-size="40" font-weight="400" fill="rgba(255,255,255,0.7)" text-anchor="middle">${label}</text>`,
    "0 0 1200 1600",
  );
  writeFileSync(join(outDir, name), svg);
}

issueCover("issue-21.svg", "تابستان ۱۴۰۴", "۲۱");
issueCover("issue-22.svg", "پاییز ۱۴۰۴", "۲۲");
issueCover("issue-23.svg", "زمستان ۱۴۰۴", "۲۳");
issueCover("issue-24.svg", "بهار ۱۴۰۵", "۲۴");

// Author avatars (1:1) - simple initials placeholders
function avatar(name, initials, bg) {
  const svg = wrap(
    `${gradient("g", [
      [0, bg],
      [100, "#1a1a1a"],
    ])}${rect(400, 400, "url(#g)")}${text(initials, 200, 240, "#fff", 140, "900")}`,
    "0 0 400 400",
  );
  writeFileSync(join(outDir, name), svg);
}

avatar("avatar-shirkound.svg", "م.ش", "#3a0a12");
avatar("avatar-jebraeili.svg", "ی.ج", "#1b3a2b");
avatar("avatar-tahririye.svg", "ح", ACCENT);
avatar("avatar-zarezade.svg", "س.ز", "#2b2b52");
avatar("avatar-graham.svg", "T.G", "#2d3436");
avatar("avatar-jaffe.svg", "A.J", "#5c3d1e");

// Video thumbnails (16:9)
function videoThumb(name, label, stops) {
  const svg = wrap(
    `${gradient("g", stops)}${rect(1600, 900, "url(#g)")}<circle cx="800" cy="450" r="90" fill="rgba(255,255,255,0.9)"/><path d="M770 405 L770 495 L845 450 Z" fill="${ACCENT}"/>${text(
      label,
      800,
      720,
      "rgba(255,255,255,0.9)",
      44,
      "700",
    )}`,
  );
  writeFileSync(join(outDir, name), svg);
}

videoThumb("video-america-iran.svg", "آمریکا، ایران و جهانی در آشوب", [
  [0, "#1a1a1a"],
  [100, ACCENT],
]);
videoThumb("video-ceasefire.svg", "وقتی آتش‌بس در واقع بن‌بست است", [
  [0, "#0f2027"],
  [100, "#2c5364"],
]);
videoThumb("video-plastics.svg", "ظهور خاموش بحران پلاستیک", [
  [0, "#2b5a3a"],
  [100, "#1b3a2b"],
]);

console.log("Generated Hokmran placeholder images.");
