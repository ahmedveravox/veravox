/**
 * سكريبت تحميل القرآن الكريم كاملاً للعمل بدون إنترنت
 * شغّله مرة واحدة فقط:  node scripts/download-quran.mjs
 */

import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../public/data");

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 20000 }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error("Invalid JSON from: " + url)); }
      });
    }).on("error", reject).on("timeout", () => reject(new Error("Timeout: " + url)));
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchUrl(url);
    } catch (e) {
      if (i < retries - 1) await sleep(2000 * (i + 1));
      else throw e;
    }
  }
}

async function main() {
  console.log("📖 بدء تحميل القرآن الكريم للعمل بدون إنترنت...\n");
  fs.mkdirSync(DATA_DIR, { recursive: true });

  // ── الخطوة ١: تحميل قائمة السور ──────────────────────────────
  const metaFile = path.join(DATA_DIR, "surahs.json");
  let surahsMeta = [];

  if (fs.existsSync(metaFile)) {
    console.log("✅ قائمة السور موجودة مسبقاً\n");
    surahsMeta = JSON.parse(fs.readFileSync(metaFile, "utf8"));
  } else {
    process.stdout.write("⏳ تحميل قائمة السور...");
    const data = await fetchWithRetry("https://api.alquran.cloud/v1/surah");
    surahsMeta = data.data;
    fs.writeFileSync(metaFile, JSON.stringify(surahsMeta), "utf8");
    console.log(` ✅ (${surahsMeta.length} سورة)\n`);
  }

  // ── الخطوة ٢: تحميل كل سورة (عربي + ترجمة) ───────────────────
  console.log("📥 تحميل السور...\n");

  for (const meta of surahsMeta) {
    const num = meta.number;
    const surahFile = path.join(DATA_DIR, `surah-${num}.json`);

    if (fs.existsSync(surahFile)) {
      process.stdout.write(`⏭  سورة ${num} - ${meta.name} موجودة\n`);
      continue;
    }

    process.stdout.write(`⏳ ${num}/114 - ${meta.name} ...`);

    try {
      const [arabicData, engData] = await Promise.all([
        fetchWithRetry(`https://api.alquran.cloud/v1/surah/${num}`),
        fetchWithRetry(`https://api.alquran.cloud/v1/surah/${num}/en.sahih`),
      ]);

      const surahData = {
        ...arabicData.data,
        ayahs: arabicData.data.ayahs.map((ayah, idx) => ({
          ...ayah,
          translation: engData.data?.ayahs?.[idx]?.text ?? "",
        })),
      };

      fs.writeFileSync(surahFile, JSON.stringify(surahData), "utf8");
      console.log(` ✅ (${surahData.ayahs.length} آية)`);
    } catch (e) {
      console.log(` ❌ فشل: ${e.message}`);
    }

    await sleep(200);
  }

  // ── النتيجة ────────────────────────────────────────────────────
  const files = fs.readdirSync(DATA_DIR).filter(f => f.startsWith("surah-"));
  const totalKB = fs.readdirSync(DATA_DIR)
    .reduce((sum, f) => sum + fs.statSync(path.join(DATA_DIR, f)).size, 0);

  console.log(`\n✅ اكتمل التحميل!`);
  console.log(`📁 ${files.length} سورة محفوظة في public/data/`);
  console.log(`📊 الحجم الكلي: ${Math.round(totalKB / 1024)} KB`);
  console.log(`\n🚀 الآن شغّل: npm run dev`);
  console.log(`🌙 التطبيق يعمل الآن بدون إنترنت!`);
}

main().catch(console.error);
