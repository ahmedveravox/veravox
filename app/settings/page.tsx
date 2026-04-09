"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

type Theme = "dark" | "black" | "dark-green";
type FontStyle = "amiri" | "naskh" | "system";

const FONT_SIZES_LABELS = ["صغير جداً","صغير","متوسط","كبير","كبير جداً"];
const FONT_SIZES_PX     = [20, 24, 28, 32, 38];

const THEME_NAMES: Record<Theme, string> = {
  dark:       "داكن أخضر",
  black:      "أسود نقي",
  "dark-green":"أخضر عميق",
};
const THEME_COLORS: Record<Theme, string> = {
  dark:       "#0B1512",
  black:      "#000000",
  "dark-green":"#061510",
};

export default function SettingsPage() {
  const [theme,    setThemeState]    = useState<Theme>("dark");
  const [fontStyle,setFontStyle]     = useState<FontStyle>("amiri");
  const [fontIdx,  setFontIdxState]  = useState(2);
  const [bmCount,  setBmCount]       = useState(0);
  const [flash,    setFlash]         = useState("");

  useEffect(() => {
    const t  = (localStorage.getItem("quran-theme") as Theme) || "dark";
    const fs = (localStorage.getItem("quran-font-style") as FontStyle) || "amiri";
    const fi = Number(localStorage.getItem("quran-font-size") ?? "2");
    const bm = JSON.parse(localStorage.getItem("quran-bookmarks") || "[]") as number[];
    setThemeState(t); setFontStyle(fs); setFontIdxState(fi);
    setBmCount(bm.length);
  }, []);

  /* ── تطبيق الثيم فوراً ── */
  const applyTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("quran-theme", t);
    document.documentElement.setAttribute("data-theme", t);
  };

  /* ── تطبيق حجم الخط فوراً ── */
  const applyFontSize = (i: number) => {
    const n = Math.max(0, Math.min(FONT_SIZES_LABELS.length - 1, i));
    setFontIdxState(n);
    localStorage.setItem("quran-font-size", String(n));
  };

  /* ── تطبيق نوع الخط ── */
  const applyFontStyle = (f: FontStyle) => {
    setFontStyle(f);
    localStorage.setItem("quran-font-style", f);
  };

  const doFlash = (msg: string) => {
    setFlash(msg);
    setTimeout(() => setFlash(""), 2200);
  };

  const clearBookmarks = () => {
    localStorage.removeItem("quran-bookmarks");
    setBmCount(0);
    doFlash("تم مسح المفضلة ✓");
  };

  const clearLastRead = () => {
    localStorage.removeItem("quran-last-read");
    doFlash("تم مسح آخر قراءة ✓");
  };

  const previewFont = (() => {
    if (fontStyle === "system") return "Arial, sans-serif";
    return "var(--font-amiri), 'Traditional Arabic', serif";
  })();

  /* ── مكوّنات مساعدة ── */
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ marginBottom:22 }}>
      <div style={{ padding:"6px 18px 8px", fontSize:11, color:"rgba(59,175,122,0.5)", letterSpacing:1 }}>
        <span className="font-arabic">{title}</span>
      </div>
      <div style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, overflow:"hidden", margin:"0 12px" }}>
        {children}
      </div>
    </div>
  );

  const Row = ({ label, children, noBorder }: { label: string; children: React.ReactNode; noBorder?: boolean }) => (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 18px", borderBottom:noBorder?"none":"1px solid rgba(255,255,255,0.05)" }}>
      <span className="font-arabic" style={{ fontSize:15, color:"rgba(255,255,255,0.78)" }}>{label}</span>
      <div>{children}</div>
    </div>
  );

  return (
    <main style={{ background:"var(--bg-primary,#0B1512)", minHeight:"100vh", direction:"rtl" }}>

      {/* هيدر */}
      <header style={{ background:"var(--header-bg,#112B1E)", padding:"14px 16px 12px", display:"flex", alignItems:"center", gap:14, position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 0 rgba(59,175,122,0.1)" }}>
        <Link href="/" style={{ textDecoration:"none" }}>
          <button style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:9, padding:"7px 13px", color:"rgba(255,255,255,0.55)", cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>← رئيسية</button>
        </Link>
        <h1 className="font-arabic" style={{ fontSize:19, fontWeight:"bold", color:"white", margin:0 }}>الإعدادات</h1>
      </header>

      {/* فلاش رسالة */}
      {flash && (
        <div style={{ position:"fixed", top:70, right:0, left:0, zIndex:400, textAlign:"center", pointerEvents:"none" }}>
          <div style={{ display:"inline-block", background:"rgba(59,175,122,0.9)", backdropFilter:"blur(10px)", borderRadius:20, padding:"8px 20px", fontSize:14, color:"white" }}>
            <span className="font-arabic">{flash}</span>
          </div>
        </div>
      )}

      <div style={{ paddingTop:16, paddingBottom:48 }}>

        {/* ══ المظهر ══ */}
        <Section title="المظهر">
          <Row label="ثيم التطبيق">
            <div style={{ display:"flex", gap:6 }}>
              {(["dark","black","dark-green"] as Theme[]).map(t => (
                <button key={t} onClick={() => applyTheme(t)} className="font-arabic" style={{
                  display:"flex", flexDirection:"column", alignItems:"center", gap:5,
                  padding:"7px 10px", borderRadius:10,
                  border:`1.5px solid ${theme===t?"rgba(59,175,122,0.6)":"rgba(255,255,255,0.1)"}`,
                  background:theme===t?"rgba(59,175,122,0.12)":"transparent",
                  cursor:"pointer", fontFamily:"inherit",
                }}>
                  <div style={{ width:24, height:24, borderRadius:6, background:THEME_COLORS[t], border:"1px solid rgba(255,255,255,0.2)" }}/>
                  <span style={{ fontSize:10, color:theme===t?"#6DCFA0":"rgba(255,255,255,0.35)" }}>{THEME_NAMES[t]}</span>
                </button>
              ))}
            </div>
          </Row>
        </Section>

        {/* ══ الخط ══ */}
        <Section title="الخط">
          <Row label="نوع الخط">
            <div style={{ display:"flex", gap:6 }}>
              {([["amiri","أميري"],["naskh","نسخ"],["system","افتراضي"]] as const).map(([f,label]) => (
                <button key={f} onClick={() => applyFontStyle(f)} className="font-arabic" style={{
                  padding:"5px 12px", borderRadius:20,
                  border:`1px solid ${fontStyle===f?"rgba(59,175,122,0.5)":"rgba(255,255,255,0.1)"}`,
                  background:fontStyle===f?"rgba(59,175,122,0.14)":"transparent",
                  color:fontStyle===f?"#6DCFA0":"rgba(255,255,255,0.38)",
                  cursor:"pointer", fontSize:12, fontFamily:"inherit",
                }}>{label}</button>
              ))}
            </div>
          </Row>

          <Row label="حجم الخط">
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span className="font-arabic" style={{ fontSize:11, color:"rgba(255,255,255,0.3)", minWidth:64, textAlign:"center" }}>
                {FONT_SIZES_LABELS[fontIdx]}
              </span>
              <div style={{ display:"flex", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, overflow:"hidden" }}>
                <button onClick={() => applyFontSize(fontIdx-1)} disabled={fontIdx===0}
                  style={{ padding:"6px 10px", background:"rgba(255,255,255,0.04)", border:"none", borderLeft:"1px solid rgba(255,255,255,0.08)", cursor:fontIdx===0?"default":"pointer", color:fontIdx===0?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.6)", fontSize:13, fontFamily:"inherit" }}>
                  أ-
                </button>
                <button onClick={() => applyFontSize(fontIdx+1)} disabled={fontIdx===4}
                  style={{ padding:"6px 10px", background:"rgba(255,255,255,0.04)", border:"none", cursor:fontIdx===4?"default":"pointer", color:fontIdx===4?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.6)", fontSize:13, fontFamily:"inherit" }}>
                  أ+
                </button>
              </div>
            </div>
          </Row>

          {/* معاينة الخط */}
          <div style={{ padding:"16px 20px 20px", background:"rgba(0,0,0,0.25)", borderTop:"1px solid rgba(255,255,255,0.04)" }}>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.2)", marginBottom:10, letterSpacing:1 }}>معاينة</div>
            <div style={{ fontFamily:previewFont, fontSize:FONT_SIZES_PX[fontIdx], color:"rgba(255,255,255,0.85)", textAlign:"center", lineHeight:2.2, direction:"rtl" }}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>
            <div style={{ fontFamily:previewFont, fontSize:Math.round(FONT_SIZES_PX[fontIdx]*0.7), color:"rgba(255,255,255,0.4)", textAlign:"center", lineHeight:2, direction:"rtl", marginTop:4 }}>
              الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ
            </div>
          </div>
        </Section>

        {/* ══ البيانات ══ */}
        <Section title="البيانات المحفوظة">
          <Row label={`المفضلة – ${bmCount} سورة`}>
            <button onClick={clearBookmarks} className="font-arabic" style={{
              padding:"7px 16px", background:"rgba(220,53,69,0.1)", border:"1px solid rgba(220,53,69,0.28)",
              borderRadius:9, color:"rgba(220,100,100,0.85)", cursor:"pointer", fontSize:13, fontFamily:"inherit",
            }}>مسح الكل</button>
          </Row>
          <Row label="آخر قراءة" noBorder>
            <button onClick={clearLastRead} className="font-arabic" style={{
              padding:"7px 16px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:9, color:"rgba(255,255,255,0.38)", cursor:"pointer", fontSize:13, fontFamily:"inherit",
            }}>مسح</button>
          </Row>
        </Section>

        {/* ══ عن التطبيق ══ */}
        <Section title="عن التطبيق">
          <div style={{ padding:"18px 18px 4px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
              <img src="/icon.svg" style={{ width:52, height:52, borderRadius:13, flexShrink:0 }} alt="نور الروح"/>
              <div>
                <div className="font-arabic" style={{ fontSize:20, fontWeight:"bold", color:"white", lineHeight:1.3 }}>نور الروح</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.28)", letterSpacing:3 }}>NOOR AL-ROUH</div>
                <div style={{ fontSize:11, color:"rgba(59,175,122,0.5)", marginTop:4 }}>الإصدار ١.٠.٠</div>
              </div>
            </div>
            <p className="font-arabic" style={{ fontSize:13, color:"rgba(255,255,255,0.35)", lineHeight:2, margin:"0 0 16px" }}>
              تطبيق للقراءة والتدبر في القرآن الكريم، يعمل بدون إنترنت بعد التحميل الأول.
              النص من مصحف المدينة المنورة · التفسير: تفسير السعدي رحمه الله.
            </p>
          </div>
          <div style={{ borderTop:"1px solid rgba(255,255,255,0.05)", padding:"10px 18px", display:"flex", justifyContent:"space-between" }}>
            <span style={{ fontSize:11, color:"rgba(255,255,255,0.18)" }}>alquran.cloud</span>
            <span style={{ fontSize:11, color:"rgba(255,255,255,0.18)" }}>tafseer-api.com</span>
          </div>
        </Section>

        {/* آية */}
        <div style={{ textAlign:"center", padding:"14px 24px 8px" }}>
          <div className="font-arabic" style={{ fontSize:15, color:"rgba(59,175,122,0.22)", lineHeight:2 }}>
            ❝ إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ ❞
          </div>
        </div>
      </div>
    </main>
  );
}
