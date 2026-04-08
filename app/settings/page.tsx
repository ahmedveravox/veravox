"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

type Theme = "dark" | "black" | "dark-green";
type FontStyle = "amiri" | "uthmanic" | "system";

const FONT_SIZES_LABELS = ["صغير جداً", "صغير", "متوسط", "كبير", "كبير جداً"];

export default function SettingsPage() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [fontStyle, setFontStyle] = useState<FontStyle>("amiri");
  const [fontIdx, setFontIdx] = useState(2);
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("quran-theme") as Theme | null;
    if (t) setTheme(t);
    const fs = localStorage.getItem("quran-font-style") as FontStyle | null;
    if (fs) setFontStyle(fs);
    const fi = localStorage.getItem("quran-font-size");
    if (fi) setFontIdx(Number(fi));
    const bm = localStorage.getItem("quran-bookmarks");
    if (bm) setBookmarksCount(JSON.parse(bm).length);
  }, []);

  const setAndSaveTheme = (t: Theme) => {
    setTheme(t);
    localStorage.setItem("quran-theme", t);
  };

  const setAndSaveFontStyle = (f: FontStyle) => {
    setFontStyle(f);
    localStorage.setItem("quran-font-style", f);
  };

  const setAndSaveFontIdx = (i: number) => {
    setFontIdx(i);
    localStorage.setItem("quran-font-size", String(i));
  };

  const clearBookmarks = () => {
    localStorage.removeItem("quran-bookmarks");
    localStorage.removeItem("quran-last-read");
    setBookmarksCount(0);
    setCleared(true);
    setTimeout(() => setCleared(false), 2000);
  };

  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
      <span className="font-arabic" style={{ fontSize:15, color:"rgba(255,255,255,0.8)" }}>{label}</span>
      <div>{children}</div>
    </div>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ marginBottom:20 }}>
      <div style={{ padding:"8px 18px", fontSize:11, color:"rgba(59,175,122,0.55)", letterSpacing:1 }}>
        <span className="font-arabic">{title}</span>
      </div>
      <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:12, overflow:"hidden", margin:"0 12px" }}>
        {children}
      </div>
    </div>
  );

  const ChipGroup = <T extends string>({ options, value, onChange }: { options: {key:T;label:string}[]; value:T; onChange:(v:T)=>void }) => (
    <div style={{ display:"flex", gap:6 }}>
      {options.map(o => (
        <button key={o.key} onClick={() => onChange(o.key)} className="font-arabic" style={{
          padding:"5px 12px", borderRadius:20, border:"1px solid",
          borderColor:value===o.key?"rgba(59,175,122,0.5)":"rgba(255,255,255,0.1)",
          background:value===o.key?"rgba(59,175,122,0.15)":"transparent",
          color:value===o.key?"#6DCFA0":"rgba(255,255,255,0.4)",
          cursor:"pointer", fontSize:12, fontFamily:"inherit",
        }}>{o.label}</button>
      ))}
    </div>
  );

  return (
    <main style={{ background:"#0B1512", minHeight:"100vh", direction:"rtl" }}>

      {/* هيدر */}
      <header style={{ background:"#112B1E", padding:"16px 16px 14px", display:"flex", alignItems:"center", gap:14, position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 0 rgba(59,175,122,0.1)" }}>
        <Link href="/" style={{ textDecoration:"none" }}>
          <button style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:9, padding:"7px 12px", color:"rgba(255,255,255,0.55)", cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>← رئيسية</button>
        </Link>
        <h1 className="font-arabic" style={{ fontSize:18, fontWeight:"bold", color:"white", margin:0 }}>الإعدادات</h1>
      </header>

      <div style={{ paddingTop:16, paddingBottom:40 }}>

        {/* المظهر */}
        <Section title="المظهر">
          <Row label="ثيم التطبيق">
            <ChipGroup
              options={[{key:"dark",label:"داكن"},{key:"black",label:"أسود"},{key:"dark-green",label:"أخضر"}] as const}
              value={theme}
              onChange={setAndSaveTheme}
            />
          </Row>
        </Section>

        {/* الخط */}
        <Section title="الخط">
          <Row label="نوع الخط">
            <ChipGroup
              options={[{key:"amiri",label:"أميري"},{key:"uthmanic",label:"عثماني"},{key:"system",label:"نظام"}] as const}
              value={fontStyle}
              onChange={setAndSaveFontStyle}
            />
          </Row>
          <Row label="حجم الخط">
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span className="font-arabic" style={{ fontSize:11, color:"rgba(255,255,255,0.35)", minWidth:60, textAlign:"center" }}>{FONT_SIZES_LABELS[fontIdx]}</span>
              <div style={{ display:"flex", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, overflow:"hidden" }}>
                <button onClick={()=>setAndSaveFontIdx(Math.max(0,fontIdx-1))} disabled={fontIdx===0} style={{ padding:"5px 10px", background:"rgba(255,255,255,0.04)", border:"none", borderLeft:"1px solid rgba(255,255,255,0.08)", cursor:fontIdx===0?"default":"pointer", color:fontIdx===0?"rgba(255,255,255,0.15)":"rgba(255,255,255,0.6)", fontSize:13 }}>أ-</button>
                <button onClick={()=>setAndSaveFontIdx(Math.min(4,fontIdx+1))} disabled={fontIdx===4} style={{ padding:"5px 10px", background:"rgba(255,255,255,0.04)", border:"none", cursor:fontIdx===4?"default":"pointer", color:fontIdx===4?"rgba(255,255,255,0.15)":"rgba(255,255,255,0.6)", fontSize:13 }}>أ+</button>
              </div>
            </div>
          </Row>
          {/* معاينة */}
          <div style={{ padding:"16px 18px", background:"rgba(0,0,0,0.2)", borderTop:"1px solid rgba(255,255,255,0.04)" }}>
            <div className="font-arabic" style={{ fontSize:[18,22,26,30,36][fontIdx], color:"rgba(255,255,255,0.8)", textAlign:"center", lineHeight:2 }}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>
          </div>
        </Section>

        {/* البيانات */}
        <Section title="البيانات">
          <Row label={`المفضلة (${bookmarksCount} سورة)`}>
            <button onClick={clearBookmarks} className="font-arabic" style={{
              padding:"6px 14px", background:"rgba(220,53,69,0.12)", border:"1px solid rgba(220,53,69,0.3)",
              borderRadius:8, color:cleared?"#6DCFA0":"rgba(220,53,69,0.8)", cursor:"pointer", fontSize:13, fontFamily:"inherit", transition:"all 0.2s",
            }}>{cleared ? "✓ تم المسح" : "مسح الكل"}</button>
          </Row>
          <Row label="آخر قراءة">
            <button onClick={() => { localStorage.removeItem("quran-last-read"); }} className="font-arabic" style={{
              padding:"6px 14px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:8, color:"rgba(255,255,255,0.4)", cursor:"pointer", fontSize:13, fontFamily:"inherit",
            }}>مسح</button>
          </Row>
        </Section>

        {/* عن التطبيق */}
        <Section title="عن التطبيق">
          <div style={{ padding:"18px 18px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
              <img src="/icon.svg" style={{ width:52, height:52, borderRadius:13 }} alt="نور الروح" />
              <div>
                <div className="font-arabic" style={{ fontSize:19, fontWeight:"bold", color:"white" }}>نور الروح</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", letterSpacing:2 }}>NOOR AL-ROUH</div>
                <div style={{ fontSize:11, color:"rgba(59,175,122,0.5)", marginTop:2 }}>الإصدار 1.0.0</div>
              </div>
            </div>
            <p className="font-arabic" style={{ fontSize:13, color:"rgba(255,255,255,0.35)", lineHeight:1.9, margin:0 }}>
              تطبيق للقراءة والتدبر في القرآن الكريم، يعمل بدون إنترنت بعد التحميل الأول.
              النص القرآني من مصحف المدينة المنورة.
              التفسير: تفسير السعدي – رحمه الله.
            </p>
          </div>
          <div style={{ borderTop:"1px solid rgba(255,255,255,0.05)", padding:"12px 18px", display:"flex", justifyContent:"space-between" }}>
            <span className="font-arabic" style={{ fontSize:12, color:"rgba(255,255,255,0.2)" }}>مصدر النص: alquran.cloud</span>
            <span className="font-arabic" style={{ fontSize:12, color:"rgba(255,255,255,0.2)" }}>تفسير: tafseer-api.com</span>
          </div>
        </Section>

        {/* آية قرآنية في الأسفل */}
        <div style={{ textAlign:"center", padding:"16px 24px", color:"rgba(59,175,122,0.2)" }}>
          <div className="font-arabic" style={{ fontSize:15, lineHeight:2 }}>
            ❝ إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ ❞
          </div>
        </div>
      </div>
    </main>
  );
}
