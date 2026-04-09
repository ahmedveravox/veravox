"use client";
import { useState, useEffect, use, useCallback, useRef } from "react";
import Link from "next/link";

interface Ayah {
  number: number; text: string; numberInSurah: number;
  page: number; juz: number; hizbQuarter: number; sajda: boolean;
}
interface SurahData {
  number: number; name: string; englishName: string;
  englishNameTranslation: string; numberOfAyahs: number;
  revelationType: string; ayahs: Ayah[];
}
interface TranslationAyah { numberInSurah: number; text: string; }
type TafsirData = Record<string, Record<string, string>>;

const ARN = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
const toAr = (n: number) => String(n).split("").map(d => ARN[+d] ?? d).join("");
const SIZES = [20, 24, 28, 32, 38];

/* ── دائرة رقم الآية ── */
function AyahNum({ n, sz }: { n: number; sz: number }) {
  const d = Math.max(22, Math.round(sz * 0.72));
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: d, height: d, minWidth: d,
      borderRadius: "50%",
      border: "1.5px solid rgba(59,175,122,0.5)",
      background: "rgba(59,175,122,0.08)",
      fontSize: Math.max(9, Math.round(sz * 0.33)),
      color: "rgba(109,207,160,0.85)",
      verticalAlign: "middle",
      margin: "0 4px",
      lineHeight: 1,
      flexShrink: 0,
    }}>
      {toAr(n)}
    </span>
  );
}

/* ── إطار اسم السورة المزخرف ── */
function SurahFrame({ name }: { name: string }) {
  const C = ({ s }: { s: React.CSSProperties }) => (
    <div style={{ position: "absolute", width: 16, height: 16, ...s }} />
  );
  return (
    <div style={{ textAlign: "center", padding: "32px 0 24px" }}>
      <div style={{
        display: "inline-block", position: "relative",
        border: "1px solid rgba(255,255,255,0.35)",
        padding: "14px 48px",
        background: "rgba(255,255,255,0.02)",
      }}>
        <C s={{ top:-6,  right:-6,  borderTop:"2px solid rgba(255,255,255,0.65)", borderRight:"2px solid rgba(255,255,255,0.65)" }}/>
        <C s={{ top:-6,  left:-6,   borderTop:"2px solid rgba(255,255,255,0.65)", borderLeft:"2px solid rgba(255,255,255,0.65)"  }}/>
        <C s={{ bottom:-6, right:-6, borderBottom:"2px solid rgba(255,255,255,0.65)", borderRight:"2px solid rgba(255,255,255,0.65)"}}/>
        <C s={{ bottom:-6, left:-6,  borderBottom:"2px solid rgba(255,255,255,0.65)", borderLeft:"2px solid rgba(255,255,255,0.65)" }}/>
        <div className="font-arabic" style={{
          fontSize: 24, color: "rgba(255,255,255,0.92)",
          letterSpacing: 2, lineHeight: 1.4,
        }}>
          سُورَةُ {name}
        </div>
      </div>
      {/* خط زخرفي */}
      <div style={{ display:"flex", alignItems:"center", gap:8, maxWidth:220, margin:"18px auto 0" }}>
        <div style={{ flex:1, height:1, background:"linear-gradient(to left, rgba(59,175,122,0.3), transparent)" }}/>
        <span style={{ color:"rgba(59,175,122,0.5)", fontSize:14 }}>✦</span>
        <div style={{ flex:1, height:1, background:"linear-gradient(to right, rgba(59,175,122,0.3), transparent)" }}/>
      </div>
    </div>
  );
}

/* ── البسملة ── */
function Bismillah({ fontSize }: { fontSize: number }) {
  return (
    <div style={{ textAlign: "center", padding: "8px 24px 28px" }}>
      <div className="font-arabic" style={{
        fontSize: Math.round(fontSize * 0.92),
        color: "rgba(255,255,255,0.82)",
        lineHeight: 2,
        letterSpacing: 0.5,
      }}>
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </div>
      <div style={{ width: 160, height: 1, background: "linear-gradient(90deg,transparent,rgba(59,175,122,0.25),transparent)", margin: "10px auto 0" }} />
    </div>
  );
}

export default function SurahPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [surah, setSurah] = useState<SurahData | null>(null);
  const [translations, setTranslations] = useState<TranslationAyah[]>([]);
  const [tafsir, setTafsir] = useState<TafsirData | null>(null);
  const [tafsirAvail, setTafsirAvail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showTrans, setShowTrans] = useState(false);
  const [showTafsir, setShowTafsir] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [fontIdx, setFontIdx] = useState(2);
  const [barVisible, setBarVisible] = useState(true);
  const lastY = useRef(0);
  const fontSize = SIZES[fontIdx];

  const saveLastRead = useCallback((s: SurahData) => {
    localStorage.setItem("quran-last-read", JSON.stringify({
      surahNum: s.number, surahName: s.name, ayahNum: 1,
    }));
  }, []);

  /* ── إخفاء الشريط عند التمرير لأسفل ── */
  useEffect(() => {
    const fn = () => {
      const y = window.scrollY;
      if (y < 60) { setBarVisible(true); }
      else { setBarVisible(y < lastY.current); }
      lastY.current = y;
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* ── تحميل البيانات ── */
  useEffect(() => {
    const fi = localStorage.getItem("quran-font-size");
    if (fi) setFontIdx(Number(fi));
    const bm: number[] = JSON.parse(localStorage.getItem("quran-bookmarks") || "[]");
    setBookmarked(bm.includes(Number(id)));
    setLoading(true); setSurah(null);

    fetch(`/data/surah-${id}.json`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => {
        setSurah(d);
        setTranslations(d.ayahs.map((a: { numberInSurah: number; translation: string }) =>
          ({ numberInSurah: a.numberInSurah, text: a.translation })));
        setLoading(false);
        document.title = `${d.name} | نور الروح`;
        saveLastRead(d);
      })
      .catch(() =>
        Promise.all([
          fetch(`https://api.alquran.cloud/v1/surah/${id}`).then(r => r.json()),
          fetch(`https://api.alquran.cloud/v1/surah/${id}/en.sahih`).then(r => r.json()),
        ]).then(([ar, en]) => {
          setSurah(ar.data);
          setTranslations(en.data?.ayahs ?? []);
          setLoading(false);
          document.title = `${ar.data.name} | نور الروح`;
          saveLastRead(ar.data);
        }).catch(() => setLoading(false))
      );

    fetch("/data/tafsir-saadi.json")
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d: TafsirData) => { setTafsir(d); setTafsirAvail(true); })
      .catch(() => setTafsirAvail(false));

    window.scrollTo(0, 0);
  }, [id, saveLastRead]);

  const changeFont = (dir: 1 | -1) => {
    const n = Math.max(0, Math.min(SIZES.length - 1, fontIdx + dir));
    setFontIdx(n);
    localStorage.setItem("quran-font-size", String(n));
  };

  const toggleBookmark = () => {
    const bm: number[] = JSON.parse(localStorage.getItem("quran-bookmarks") || "[]");
    const num = Number(id);
    const next = bm.includes(num) ? bm.filter(b => b !== num) : [...bm, num];
    localStorage.setItem("quran-bookmarks", JSON.stringify(next));
    setBookmarked(!bookmarked);
  };

  /* ══ شاشة التحميل ══ */
  if (loading) return (
    <div style={{ background: "#000", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
      <div className="font-arabic" style={{ fontSize: 44, color: "rgba(59,175,122,0.35)" }}>﷽</div>
      <div style={{ width: 36, height: 36, border: "3px solid rgba(59,175,122,0.15)", borderTopColor: "#3BAF7A", borderRadius: "50%", animation: "spin .9s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!surah) return (
    <div style={{ background: "#000", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 14, color: "rgba(255,255,255,0.4)" }}>
      <div>⚠️ خطأ في التحميل</div>
      <Link href="/" style={{ color: "#3BAF7A", textDecoration: "none" }}>← الرئيسية</Link>
    </div>
  );

  const isMeccan = surah.revelationType === "Meccan";
  const startPage = surah.ayahs[0]?.page ?? 0;
  const startJuz = surah.ayahs[0]?.juz ?? 0;

  /* للفاتحة: الآية ١ هي البسملة، نعرضها منفصلة ثم بقية الآيات */
  const isFatiha = surah.number === 1;
  const hasBismillah = surah.number !== 1 && surah.number !== 9;
  const mainAyahs = isFatiha ? surah.ayahs.slice(1) : surah.ayahs;

  /* ══ الصفحة الرئيسية ══ */
  return (
    <main style={{ background: "#000", minHeight: "100vh", direction: "rtl" }}>

      {/* ══ شريط الأدوات العلوي (يختفي عند التمرير) ══ */}
      <div style={{
        position: "fixed", top: 0, right: 0, left: 0, zIndex: 300,
        transform: barVisible ? "translateY(0)" : "translateY(-100%)",
        transition: "transform 0.25s ease",
      }}>
        <div style={{
          background: "rgba(0,0,0,0.93)", backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          padding: "10px 14px",
          display: "flex", alignItems: "center", gap: 8,
        }}>

          {/* ← رئيسية */}
          <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
            <button style={btnStyle}>← رئيسية</button>
          </Link>

          {/* ‹ › التنقل بين السور */}
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            {surah.number > 1 && (
              <Link href={`/surah/${surah.number - 1}`} style={{ textDecoration: "none" }}>
                <button style={arrowBtn}>‹</button>
              </Link>
            )}
            {surah.number < 114 && (
              <Link href={`/surah/${surah.number + 1}`} style={{ textDecoration: "none" }}>
                <button style={arrowBtn}>›</button>
              </Link>
            )}
          </div>

          {/* اسم السورة – وسط */}
          <div style={{ flex: 1, textAlign: "center", minWidth: 0, overflow: "hidden" }}>
            <div className="font-arabic" style={{ fontSize: 17, fontWeight: "bold", color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {surah.name}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
              {toAr(surah.numberOfAyahs)} آية · {isMeccan ? "مكية" : "مدنية"}
            </div>
          </div>

          {/* أدوات اليمين */}
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>

            {/* حجم الخط */}
            <div style={{ display: "flex", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, overflow: "hidden" }}>
              <button
                onClick={() => changeFont(-1)} disabled={fontIdx === 0}
                style={{ padding: "5px 9px", background: "rgba(255,255,255,0.05)", border: "none", borderLeft: "1px solid rgba(255,255,255,0.1)", cursor: fontIdx === 0 ? "default" : "pointer", color: fontIdx === 0 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: "inherit" }}
              >أ-</button>
              <button
                onClick={() => changeFont(1)} disabled={fontIdx === SIZES.length - 1}
                style={{ padding: "5px 9px", background: "rgba(255,255,255,0.05)", border: "none", cursor: fontIdx === SIZES.length - 1 ? "default" : "pointer", color: fontIdx === SIZES.length - 1 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: "inherit" }}
              >أ+</button>
            </div>

            {/* تفسير */}
            {tafsirAvail && (
              <button
                onClick={() => { setShowTafsir(p => !p); if (!showTafsir) setShowTrans(false); }}
                style={{
                  ...toggleBtn,
                  background: showTafsir ? "rgba(59,175,122,0.2)" : "rgba(255,255,255,0.06)",
                  borderColor: showTafsir ? "rgba(59,175,122,0.45)" : "rgba(255,255,255,0.1)",
                  color: showTafsir ? "#6DCFA0" : "rgba(255,255,255,0.5)",
                }}
              >تفسير</button>
            )}

            {/* ترجمة EN */}
            <button
              onClick={() => { setShowTrans(p => !p); if (!showTrans) setShowTafsir(false); }}
              style={{
                ...toggleBtn,
                background: showTrans ? "rgba(0,200,255,0.15)" : "rgba(255,255,255,0.06)",
                borderColor: showTrans ? "rgba(0,200,255,0.4)" : "rgba(255,255,255,0.1)",
                color: showTrans ? "#00C8FF" : "rgba(255,255,255,0.5)",
              }}
            >EN</button>

            {/* نجمة */}
            <button onClick={toggleBookmark} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 22, color: bookmarked ? "#3BAF7A" : "rgba(255,255,255,0.2)", padding: "2px 4px", lineHeight: 1, transition: "color 0.15s" }}>
              {bookmarked ? "★" : "☆"}
            </button>
          </div>
        </div>
      </div>

      {/* ══ المحتوى الرئيسي ══ */}
      <div style={{ maxWidth: 700, margin: "0 auto", paddingTop: 56 }}>

        {/* معلومات السورة - رأس الصفحة (على غرار المصحف) */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "14px 20px 0",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}>
          <span className="font-arabic" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
            {surah.name}
          </span>
          <span className="font-arabic" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
            {startJuz > 0 ? `الجزء ${toAr(startJuz)}` : ""}
          </span>
        </div>

        {/* إطار اسم السورة المزخرف */}
        <SurahFrame name={surah.name} />

        {/* البسملة المنفصلة (لكل السور عدا الفاتحة والتوبة) */}
        {hasBismillah && <Bismillah fontSize={fontSize} />}

        {/* للفاتحة: البسملة هي الآية الأولى - نعرضها بشكل خاص */}
        {isFatiha && surah.ayahs[0] && (
          <div style={{ textAlign: "center", padding: "4px 20px 24px" }}>
            <div className="font-arabic" style={{
              fontSize: Math.round(fontSize * 0.9),
              color: "rgba(255,255,255,0.82)",
              lineHeight: 2,
            }}>
              {surah.ayahs[0].text}
              {" "}<AyahNum n={1} sz={fontSize} />
            </div>
            <div style={{ width: 160, height: 1, background: "linear-gradient(90deg,transparent,rgba(59,175,122,0.25),transparent)", margin: "14px auto 0" }} />
          </div>
        )}

        {/* ══ النص القرآني المتدفق ══ */}
        <div style={{ padding: "4px 22px 16px" }}>
          <div
            className="font-arabic"
            style={{
              fontSize,
              lineHeight: 2.6,
              color: "rgba(255,255,255,0.93)",
              textAlign: "justify",
              textAlignLast: "center",
              direction: "rtl",
              wordSpacing: 2,
            }}
          >
            {mainAyahs.map(ayah => (
              <span key={ayah.number}>
                {ayah.text}{" "}
                <AyahNum n={ayah.numberInSurah} sz={fontSize} />{" "}
              </span>
            ))}
          </div>
        </div>

        {/* ══ قسم الترجمة الإنجليزية ══ */}
        {showTrans && translations.length > 0 && (
          <div style={{
            margin: "8px 16px 0",
            border: "1px solid rgba(0,200,255,0.15)",
            borderRadius: 14,
            overflow: "hidden",
          }}>
            <div style={{ background: "rgba(0,200,255,0.06)", padding: "10px 18px", borderBottom: "1px solid rgba(0,200,255,0.1)" }}>
              <span style={{ fontSize: 11, color: "rgba(0,200,255,0.6)", letterSpacing: 3 }}>ENGLISH TRANSLATION</span>
            </div>
            <div style={{ padding: "12px 18px 16px", direction: "ltr", textAlign: "left" }}>
              {translations.map(t => (
                <p key={t.numberInSurah} style={{
                  fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.85,
                  marginBottom: 12, paddingBottom: 12,
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}>
                  <span style={{ fontSize: 11, color: "rgba(0,200,255,0.45)", marginLeft: 8, fontWeight: "bold" }}>{t.numberInSurah}.</span>
                  {t.text}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* ══ قسم تفسير السعدي ══ */}
        {showTafsir && tafsir && (
          <div style={{
            margin: "8px 16px 0",
            border: "1px solid rgba(59,175,122,0.15)",
            borderRadius: 14,
            overflow: "hidden",
          }}>
            <div style={{ background: "rgba(59,175,122,0.06)", padding: "10px 18px", borderBottom: "1px solid rgba(59,175,122,0.1)", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 15, color: "rgba(59,175,122,0.6)" }}>📖</span>
              <span className="font-arabic" style={{ fontSize: 14, color: "rgba(59,175,122,0.75)", letterSpacing: 1 }}>تفسير السعدي – رحمه الله</span>
            </div>
            <div style={{ padding: "12px 16px 16px" }}>
              {surah.ayahs.map(ayah => {
                const t = tafsir[id]?.[String(ayah.numberInSurah)];
                if (!t) return null;
                return (
                  <div key={ayah.number} style={{
                    marginBottom: 16, padding: "14px 16px",
                    background: "rgba(59,175,122,0.03)",
                    border: "1px solid rgba(59,175,122,0.08)",
                    borderRadius: 10,
                  }}>
                    {/* رقم الآية */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <AyahNum n={ayah.numberInSurah} sz={22} />
                      <span className="font-arabic" style={{ fontSize: 11, color: "rgba(59,175,122,0.5)" }}>الآية {toAr(ayah.numberInSurah)}</span>
                      {ayah.sajda && <span style={{ fontSize: 10, color: "rgba(59,175,122,0.4)" }}>۩ سجدة</span>}
                    </div>
                    {/* نص التفسير */}
                    <div className="font-arabic" style={{
                      fontSize: Math.max(14, fontSize - 10),
                      color: "rgba(255,255,255,0.65)",
                      lineHeight: 2,
                      textAlign: "right",
                      direction: "rtl",
                    }}>{t}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ رقم الصفحة والجزء في الأسفل ══ */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "28px 24px 16px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          marginTop: 28,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {startPage > 0 && (
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, color: "rgba(255,255,255,0.4)",
              }}>
                <span className="font-arabic">{toAr(startPage)}</span>
              </div>
            )}
            {startJuz > 0 && (
              <div style={{
                padding: "4px 12px", borderRadius: 20,
                border: "1px solid rgba(59,175,122,0.25)",
                background: "rgba(59,175,122,0.06)",
                fontSize: 11, color: "rgba(59,175,122,0.6)",
              }}>
                <span className="font-arabic">الجزء {toAr(startJuz)}</span>
              </div>
            )}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
            <span className="font-arabic">{toAr(surah.numberOfAyahs)} آية</span>
          </div>
        </div>

        {/* ══ تنقل بين السور ══ */}
        <div style={{
          display: "flex",
          justifyContent: surah.number > 1 && surah.number < 114 ? "space-between"
            : surah.number === 1 ? "flex-end" : "flex-start",
          gap: 10, padding: "8px 16px 48px",
        }}>
          {surah.number > 1 && (
            <Link href={`/surah/${surah.number - 1}`} style={{ textDecoration: "none" }}>
              <button style={navBtn}>← السورة السابقة</button>
            </Link>
          )}
          {surah.number < 114 && (
            <Link href={`/surah/${surah.number + 1}`} style={{ textDecoration: "none" }}>
              <button style={navBtn}>السورة التالية →</button>
            </Link>
          )}
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  );
}

/* ── أنماط مشتركة ── */
const btnStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8, padding: "6px 12px", color: "rgba(255,255,255,0.6)",
  cursor: "pointer", fontSize: 13, fontFamily: "inherit",
};
const arrowBtn: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
  borderRadius: 7, padding: "6px 11px", color: "rgba(255,255,255,0.5)",
  cursor: "pointer", fontSize: 17, lineHeight: 1,
};
const toggleBtn: React.CSSProperties = {
  border: "1px solid", borderRadius: 8,
  padding: "5px 10px", cursor: "pointer",
  fontSize: 12, fontFamily: "inherit",
  transition: "all 0.15s",
};
const navBtn: React.CSSProperties = {
  background: "rgba(59,175,122,0.08)",
  border: "1px solid rgba(59,175,122,0.22)",
  borderRadius: 12, padding: "12px 22px",
  color: "rgba(255,255,255,0.65)",
  cursor: "pointer", fontSize: 14, fontFamily: "inherit",
};
