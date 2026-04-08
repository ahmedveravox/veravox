/**
 * سكريبت تحميل تفسير السعدي كاملاً
 * شغّله مرة واحدة فقط:  node scripts/download-tafsir.mjs
 */

import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_FILE = path.join(__dirname, "../public/data/tafsir-saadi.json");

// عدد الآيات لكل سورة
const AYAH_COUNTS = [
  7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,
  112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,
  59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,
  52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,
  8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6
];

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 15000 }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error("Invalid JSON")); }
      });
    }).on("error", reject).on("timeout", () => reject(new Error("Timeout")));
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchSurahTafsir(surahNum) {
  // المصدر الأول: tafseer-api.com - تفسير السعدي
  const url = `https://www.tafseer-api.com/api/alSaady/${surahNum}`;
  try {
    const data = await fetchUrl(url);
    if (data && Array.isArray(data)) {
      const result = {};
      for (const item of data) {
        if (item.aya_number && item.text) {
          result[item.aya_number] = item.text.trim();
        }
      }
      if (Object.keys(result).length > 0) return result;
    }
  } catch {}

  // المصدر الثاني: alquran.cloud - تفسير الميسر (بديل)
  try {
    const url2 = `https://api.alquran.cloud/v1/surah/${surahNum}/ar.muyassar`;
    const data2 = await fetchUrl(url2);
    if (data2?.data?.ayahs) {
      const result = {};
      for (const ayah of data2.data.ayahs) {
        result[ayah.numberInSurah] = ayah.text.trim();
      }
      return result;
    }
  } catch {}

  return null;
}

async function main() {
  console.log("📖 بدء تحميل تفسير السعدي...\n");

  // تأكد أن المجلد موجود
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });

  // إذا في ملف موجود، تابع منه
  let tafsir = {};
  if (fs.existsSync(OUT_FILE)) {
    tafsir = JSON.parse(fs.readFileSync(OUT_FILE, "utf8"));
    console.log(`✅ استكمال من السورة ${Object.keys(tafsir).length + 1}\n`);
  }

  for (let surah = 1; surah <= 114; surah++) {
    if (tafsir[surah]) {
      process.stdout.write(`⏭  سورة ${surah} - موجودة مسبقاً\n`);
      continue;
    }

    process.stdout.write(`⏳ سورة ${surah}/114 ...`);

    let attempts = 0;
    let result = null;

    while (attempts < 3 && !result) {
      try {
        result = await fetchSurahTafsir(surah);
      } catch {
        attempts++;
        await sleep(2000 * attempts);
      }
    }

    if (result) {
      tafsir[surah] = result;
      process.stdout.write(` ✅ (${Object.keys(result).length} آية)\n`);
    } else {
      process.stdout.write(` ❌ فشل التحميل\n`);
    }

    // حفظ تدريجي كل 10 سور
    if (surah % 10 === 0) {
      fs.writeFileSync(OUT_FILE, JSON.stringify(tafsir), "utf8");
      console.log(`💾 تم الحفظ حتى السورة ${surah}\n`);
    }

    await sleep(300); // تجنب الحظر
  }

  // حفظ نهائي
  fs.writeFileSync(OUT_FILE, JSON.stringify(tafsir), "utf8");

  const sizeKB = Math.round(fs.statSync(OUT_FILE).size / 1024);
  const surahCount = Object.keys(tafsir).length;
  console.log(`\n✅ اكتمل التحميل!`);
  console.log(`📁 الملف: public/data/tafsir-saadi.json`);
  console.log(`📊 ${surahCount} سورة | ${sizeKB} KB`);
  console.log(`\n🚀 الآن شغّل:  npm run dev`);
}

main().catch(console.error);
