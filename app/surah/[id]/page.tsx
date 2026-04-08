"use client";
import { useState, useEffect, useRef, use, useCallback } from "react";
import Link from "next/link";

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  page: number;
  juz: number;
  hizbQuarter: number;
  sajda: boolean;
}

interface SurahData {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
  ayahs: Ayah[];
}

interface TranslationAyah {
  numberInSurah: number;
  text: string;
}

type TafsirData = Record<string, Record<string, string>>;

const ARABIC_NUMBERS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
function toArabicNum(n: number): string {
  return String(n).split("").map((d) => ARABIC_NUMBERS[parseInt(d)] ?? d).join("");
}

const FONT_SIZES = [22, 26, 30, 34, 38];

export default function SurahPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [surah, setSurah] = useState<SurahData | null>(null);
  const [translations, setTranslations] = useState<TranslationAyah[]>([]);
  const [tafsir, setTafsir] = useState<TafsirData | null>(null);
  const [tafsirAvailable, setTafsirAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showTafsir, setShowTafsir] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [fontSizeIdx, setFontSizeIdx] = useState(2); // default = 30px
  const [readProgress, setReadProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeAyah, setActiveAyah] = useState<number | null>(null);
  const ayahRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const fontSize = FONT_SIZES[fontSizeIdx];

  // ── حفظ آخر سورة مقروءة ───────────────────────────────────────
  const saveLastRead = useCallback((surahData: SurahData, ayahNum: number) => {
    localStorage.setItem("quran-last-read", JSON.stringify({
      surahNum: surahData.number,
      surahName: surahData.name,
      ayahNum,
    }));
  }, []);

  // ── تتبع التقدم عند التمرير ───────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      if (total > 0) setReadProgress(Math.round((scrolled / total) * 100));
      setShowScrollTop(scrolled > 400);

      // تحديد الآية الحالية
      if (!surah) return;
      for (let i = surah.ayahs.length - 1; i >= 0; i--) {
        const num = surah.ayahs[i].numberInSurah;
        const el = ayahRefs.current[num];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 160) {
            setActiveAyah(num);
            saveLastRead(surah, num);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [surah, saveLastRead]);

  useEffect(() => {
    // حجم الخط من localStorage
    const savedSize = localStorage.getItem("quran-font-size");
    if (savedSize) setFontSizeIdx(Number(savedSize));

    const savedBm = localStorage.getItem("quran-bookmarks");
    if (savedBm) {
      const bm: number[] = JSON.parse(savedBm);
      setBookmarked(bm.includes(Number(id)));
    }

    setLoading(true);
    fetch(`/data/surah-${id}.json`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => {
        setSurah(data);
        setTranslations(data.ayahs.map((a: { numberInSurah: number; translation: string }) => ({
          numberInSurah: a.numberInSurah,
          text: a.translation,
        })));
        setLoading(false);
        document.title = `${data.name} | نور الروح`;
      })
      .catch(() => {
        Promise.all([
          fetch(`https://api.alquran.cloud/v1/surah/${id}`).then((r) => r.json()),
          fetch(`https://api.alquran.cloud/v1/surah/${id}/en.sahih`).then((r) => r.json()),
        ]).then(([ar, en]) => {
          setSurah(ar.data);
          setTranslations(en.data?.ayahs ?? []);
          setLoading(false);
          document.title = `${ar.data.name} | نور الروح`;
        }).catch(() => setLoading(false));
      });

    fetch("/data/tafsir-saadi.json")
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: TafsirData) => { setTafsir(data); setTafsirAvailable(true); })
      .catch(() => setTafsirAvailable(false));

    window.scrollTo(0, 0);
  }, [id]);

  const changeFontSize = (dir: 1 | -1) => {
    const next = Math.max(0, Math.min(FONT_SIZES.length - 1, fontSizeIdx + dir));
    setFontSizeIdx(next);
    localStorage.setItem("quran-font-size", String(next));
  };

  const toggleBookmark = () => {
    const saved = localStorage.getItem("quran-bookmarks");
    const bm: number[] = saved ? JSON.parse(saved) : [];
    const num = Number(id);
    const updated = bm.includes(num) ? bm.filter((b) => b !== num) : [...bm, num];
    localStorage.setItem("quran-bookmarks", JSON.stringify(updated));
    setBookmarked(!bookmarked);
  };

  // ── Loading ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ background: "var(--bg-primary)", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", gap: 16 }}>
        <div className="font-arabic" style={{ fontSize: 40, color: "rgba(201,168,76,0.35)" }}>﷽</div>
        <div style={{ width: 40, height: 40, border: "3px solid rgba(201,168,76,0.15)", borderTopColor: "var(--gold)", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
        <div style={{ fontSize: 14 }}>جاري تحميل السورة...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!surah) {
    return (
      <div style={{ background: "var(--bg-primary)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, color: "var(--text-muted)" }}>
        <div style={{ fontSize: 32 }}>⚠️</div>
        <div className="font-arabic">حدث خطأ في تحميل السورة</div>
        <Link href="/" style={{ color: "var(--gold)", textDecoration: "none", fontSize: 14 }}>العودة للرئيسية</Link>
      </div>
    );
  }

  const isMeccan = surah.revelationType === "Meccan";

  return (
    <main className="geo-pattern" style={{ background: "var(--bg-primary)", minHeight: "100vh", direction: "rtl" }}>

      {/* ── شريط التقدم ── */}
      <div style={{ position: "fixed", top: 0, right: 0, left: 0, height: 3, zIndex: 200, background: "rgba(255,255,255,0.05)" }}>
        <div style={{ height: "100%", width: `${readProgress}%`, background: "linear-gradient(90deg, #C9A84C, #F5D78E)", transition: "width 0.2s ease" }} />
      </div>

      {/* ── الهيدر ── */}
      <header style={{
        background: "rgba(13,24,41,0.97)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border-gold)", padding: "10px 12px",
        display: "flex", alignItems: "center", gap: 8,
        position: "sticky", top: 0, zIndex: 100,
      }}>
        {/* رئيسية */}
        <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
          <button style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 9, padding: "7px 12px", color: "rgba(255,255,255,0.65)",
            cursor: "pointer", fontSize: 13, fontFamily: "inherit", whiteSpace: "nowrap",
          }}>← رئيسية</button>
        </Link>

        {/* تنقل بين السور */}
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          {surah.number > 1 && (
            <Link href={`/surah/${surah.number - 1}`} style={{ textDecoration: "none" }}>
              <button style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 7, padding: "7px 10px", color: "rgba(255,255,255,0.45)", cursor: "pointer", fontSize: 16 }}>‹</button>
            </Link>
          )}
          {surah.number < 114 && (
            <Link href={`/surah/${surah.number + 1}`} style={{ textDecoration: "none" }}>
              <button style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 7, padding: "7px 10px", color: "rgba(255,255,255,0.45)", cursor: "pointer", fontSize: 16 }}>›</button>
            </Link>
          )}
        </div>

        {/* اسم السورة */}
        <div style={{ flex: 1, textAlign: "center", minWidth: 0 }}>
          <span className="font-arabic" style={{ fontSize: "clamp(16px,4vw,22px)", fontWeight: "bold", color: "white" }}>{surah.name}</span>
          <span style={{ fontSize: 11, color: "var(--text-muted)", marginRight: 8 }}>
            {toArabicNum(surah.numberOfAyahs)} آية · {isMeccan ? "مكية" : "مدنية"}
            {activeAyah && <span style={{ color: "rgba(201,168,76,0.5)" }}> · آية {toArabicNum(activeAyah)}</span>}
          </span>
        </div>

        {/* أدوات التحكم */}
        <div style={{ display: "flex", gap: 5, alignItems: "center", flexShrink: 0 }}>
          {/* حجم الخط */}
          <div style={{ display: "flex", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, overflow: "hidden" }}>
            <button onClick={() => changeFontSize(-1)} disabled={fontSizeIdx === 0}
              style={{ padding: "6px 9px", background: "rgba(255,255,255,0.03)", border: "none", cursor: fontSizeIdx === 0 ? "not-allowed" : "pointer", color: fontSizeIdx === 0 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.55)", fontSize: 13 }}>أ-</button>
            <button onClick={() => changeFontSize(1)} disabled={fontSizeIdx === FONT_SIZES.length - 1}
              style={{ padding: "6px 9px", background: "rgba(255,255,255,0.03)", border: "none", borderRight: "1px solid rgba(255,255,255,0.07)", cursor: fontSizeIdx === FONT_SIZES.length - 1 ? "not-allowed" : "pointer", color: fontSizeIdx === FONT_SIZES.length - 1 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.55)", fontSize: 13 }}>أ+</button>
          </div>

          {/* تفسير */}
          {tafsirAvailable && (
            <button onClick={() => setShowTafsir(!showTafsir)} style={{
              background: showTafsir ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${showTafsir ? "rgba(201,168,76,0.45)" : "rgba(255,255,255,0.09)"}`,
              borderRadius: 8, padding: "6px 10px",
              color: showTafsir ? "var(--gold)" : "rgba(255,255,255,0.45)",
              cursor: "pointer", fontSize: 12, fontFamily: "inherit",
            }}>تفسير</button>
          )}

          {/* ترجمة */}
          <button onClick={() => setShowTranslation(!showTranslation)} style={{
            background: showTranslation ? "rgba(0,212,255,0.12)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${showTranslation ? "rgba(0,212,255,0.38)" : "rgba(255,255,255,0.09)"}`,
            borderRadius: 8, padding: "6px 10px",
            color: showTranslation ? "var(--cyan)" : "rgba(255,255,255,0.45)",
            cursor: "pointer", fontSize: 12, fontFamily: "inherit", letterSpacing: 1,
          }}>EN</button>

          {/* مفضلة */}
          <button onClick={toggleBookmark} style={{
            background: "transparent", border: "none", cursor: "pointer",
            fontSize: 20, color: bookmarked ? "var(--gold)" : "rgba(255,255,255,0.2)", padding: "4px 6px",
          }}>{bookmarked ? "★" : "☆"}</button>
        </div>
      </header>

      {/* ── بطاقة السورة ── */}
      <div style={{ textAlign: "center", padding: "24px 16px", borderBottom: "1px solid rgba(201,168,76,0.07)" }}>
        <div style={{
          display: "inline-flex", flexWrap: "wrap", justifyContent: "center",
          alignItems: "center", gap: 0,
          background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-gold)",
          borderRadius: 12, padding: "10px 20px", rowGap: 8,
        }}>
          {[
            surah.englishNameTranslation,
            `سورة رقم ${toArabicNum(surah.number)}`,
            isMeccan ? "مكية" : "مدنية",
          ].map((item, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center" }}>
              {i > 0 && <span style={{ width: 1, height: 16, background: "var(--border-gold)", margin: "0 12px", display: "inline-block" }} />}
              <span style={{
                fontSize: i === 2 ? 11 : 12,
                color: i === 2 ? (isMeccan ? "var(--cyan)" : "var(--purple)") : "var(--text-muted)",
                direction: i === 0 ? "ltr" : "rtl",
              }}>{item}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── البسملة ── */}
      {surah.number !== 1 && surah.number !== 9 && (
        <div style={{ textAlign: "center", padding: "24px 16px", borderBottom: "1px solid rgba(201,168,76,0.05)" }}>
          <div className="font-arabic" style={{ fontSize: 28, color: "rgba(201,168,76,0.8)", lineHeight: 2 }}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>
        </div>
      )}

      {/* ── الآيات ── */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "12px 14px" }}>
        {surah.ayahs.map((ayah, idx) => {
          const translation = translations[idx];
          const tafsirText = tafsir?.[id]?.[String(ayah.numberInSurah)];
          const isActive = activeAyah === ayah.numberInSurah;

          return (
            <div
              key={ayah.number}
              ref={(el) => { ayahRefs.current[ayah.numberInSurah] = el; }}
              style={{
                background: isActive ? "rgba(201,168,76,0.04)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${isActive ? "rgba(201,168,76,0.2)" : "rgba(201,168,76,0.06)"}`,
                borderRadius: 12, padding: "20px 20px 16px", marginBottom: 8,
                transition: "border-color 0.3s ease, background 0.3s ease",
              }}
            >
              {/* رأس الآية */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                {/* رقم الآية */}
                <div style={{
                  minWidth: 38, height: 38,
                  background: "linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.04))",
                  border: "1px solid rgba(201,168,76,0.38)", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, color: "var(--gold)", fontWeight: "bold", flexShrink: 0,
                }}>{toArabicNum(ayah.numberInSurah)}</div>

                {/* معلومات الآية */}
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.18)", display: "flex", gap: 10 }}>
                  {ayah.juz > 0 && <span>جزء {toArabicNum(ayah.juz)}</span>}
                  {ayah.page > 0 && <span>ص {toArabicNum(ayah.page)}</span>}
                  {ayah.sajda && <span style={{ color: "rgba(201,168,76,0.45)", fontSize: 11 }}>۩ سجدة</span>}
                </div>
              </div>

              {/* النص العربي */}
              <div className="font-arabic" style={{
                fontSize, lineHeight: 2.2, color: "rgba(255,255,255,0.94)",
                textAlign: "right", letterSpacing: "0.5px",
                marginBottom: (showTafsir && tafsirText) || (showTranslation && translation) ? 16 : 0,
              }}>
                {ayah.text}
              </div>

              {/* تفسير السعدي */}
              {showTafsir && tafsirText && (
                <div style={{ borderTop: "1px solid rgba(201,168,76,0.1)", paddingTop: 14, marginBottom: showTranslation && translation ? 14 : 0 }}>
                  <div style={{ fontSize: 10, color: "rgba(201,168,76,0.5)", letterSpacing: 2, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <span>📖</span><span>تفسير السعدي</span>
                  </div>
                  <div className="font-arabic" style={{
                    fontSize: Math.max(15, fontSize - 12),
                    color: "rgba(255,255,255,0.68)", lineHeight: 1.9, textAlign: "right",
                    background: "rgba(201,168,76,0.03)", border: "1px solid rgba(201,168,76,0.07)",
                    borderRadius: 9, padding: "12px 14px",
                  }}>{tafsirText}</div>
                </div>
              )}

              {/* الترجمة الإنجليزية */}
              {showTranslation && translation && (
                <div style={{
                  borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 12,
                  fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.8,
                  direction: "ltr", textAlign: "left", fontStyle: "italic",
                }}>{translation.text}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── تنقل سفلي ── */}
      <div style={{
        maxWidth: 800, margin: "0 auto", padding: "8px 14px 48px",
        display: "flex", gap: 10,
        justifyContent: surah.number > 1 && surah.number < 114
          ? "space-between" : surah.number === 1 ? "flex-end" : "flex-start",
      }}>
        {surah.number > 1 && (
          <Link href={`/surah/${surah.number - 1}`} style={{ textDecoration: "none" }}>
            <button className="nav-btn">← السورة السابقة</button>
          </Link>
        )}
        {surah.number < 114 && (
          <Link href={`/surah/${surah.number + 1}`} style={{ textDecoration: "none" }}>
            <button className="nav-btn">السورة التالية →</button>
          </Link>
        )}
      </div>

      {/* ── زر العودة للأعلى ── */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            position: "fixed", bottom: 24, left: 24,
            width: 44, height: 44, borderRadius: "50%",
            background: "rgba(201,168,76,0.9)", border: "none",
            color: "#0A0F1E", fontSize: 18, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(201,168,76,0.3)",
            zIndex: 200, transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = "scale(1.1)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = "scale(1)")}
        >↑</button>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .nav-btn {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: 11px;
          padding: 11px 22px;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          font-size: 14px;
          font-family: inherit;
          transition: border-color 0.18s, color 0.18s;
        }
        .nav-btn:hover {
          border-color: rgba(201,168,76,0.45);
          color: rgba(255,255,255,0.85);
        }
      `}</style>
    </main>
  );
}
