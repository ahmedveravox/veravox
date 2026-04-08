"use client";
import { useState, useEffect, useRef, use, useCallback } from "react";
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
const toAr = (n: number) => String(n).split("").map(d=>ARN[parseInt(d)]??d).join("");
const FONT_SIZES = [20, 24, 28, 32, 38];

export default function SurahPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [surah, setSurah] = useState<SurahData|null>(null);
  const [translations, setTranslations] = useState<TranslationAyah[]>([]);
  const [tafsir, setTafsir] = useState<TafsirData|null>(null);
  const [tafsirAvailable, setTafsirAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showTafsir, setShowTafsir] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [fontIdx, setFontIdx] = useState(2);
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const [activeAyah, setActiveAyah] = useState<number|null>(null);
  const ayahRefs = useRef<Record<number, HTMLDivElement|null>>({});
  const fontSize = FONT_SIZES[fontIdx];

  const saveLastRead = useCallback((s: SurahData, ayahNum: number) => {
    localStorage.setItem("quran-last-read", JSON.stringify({ surahNum:s.number, surahName:s.name, ayahNum }));
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      if (total>0) setProgress(Math.round(scrolled/total*100));
      setShowTop(scrolled>300);
      if (!surah) return;
      for (let i=surah.ayahs.length-1; i>=0; i--) {
        const num = surah.ayahs[i].numberInSurah;
        const el2 = ayahRefs.current[num];
        if (el2 && el2.getBoundingClientRect().top<=150) {
          setActiveAyah(num);
          saveLastRead(surah, num);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive:true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [surah, saveLastRead]);

  useEffect(() => {
    const fs = localStorage.getItem("quran-font-size");
    if (fs) setFontIdx(Number(fs));
    const bm = localStorage.getItem("quran-bookmarks");
    if (bm) setBookmarked((JSON.parse(bm) as number[]).includes(Number(id)));

    setLoading(true);
    fetch(`/data/surah-${id}.json`)
      .then(r => { if(!r.ok) throw new Error(); return r.json(); })
      .then(data => {
        setSurah(data);
        setTranslations(data.ayahs.map((a:{numberInSurah:number;translation:string}) => ({ numberInSurah:a.numberInSurah, text:a.translation })));
        setLoading(false);
        document.title = `${data.name} | نور الروح`;
      })
      .catch(() => {
        Promise.all([
          fetch(`https://api.alquran.cloud/v1/surah/${id}`).then(r=>r.json()),
          fetch(`https://api.alquran.cloud/v1/surah/${id}/en.sahih`).then(r=>r.json()),
        ]).then(([ar,en]) => {
          setSurah(ar.data); setTranslations(en.data?.ayahs??[]); setLoading(false);
          document.title = `${ar.data.name} | نور الروح`;
        }).catch(()=>setLoading(false));
      });

    fetch("/data/tafsir-saadi.json")
      .then(r => { if(!r.ok) throw new Error(); return r.json(); })
      .then((d:TafsirData) => { setTafsir(d); setTafsirAvailable(true); })
      .catch(()=>setTafsirAvailable(false));

    window.scrollTo(0,0);
  }, [id]);

  const changeFont = (dir:1|-1) => {
    const n = Math.max(0, Math.min(FONT_SIZES.length-1, fontIdx+dir));
    setFontIdx(n); localStorage.setItem("quran-font-size", String(n));
  };

  const toggleBookmark = () => {
    const bm:number[] = JSON.parse(localStorage.getItem("quran-bookmarks")||"[]");
    const num = Number(id);
    const updated = bm.includes(num) ? bm.filter(b=>b!==num) : [...bm,num];
    localStorage.setItem("quran-bookmarks", JSON.stringify(updated));
    setBookmarked(!bookmarked);
  };

  if (loading) return (
    <div style={{ background:"var(--bg-primary)", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, color:"var(--text-muted)" }}>
      <div className="font-arabic" style={{ fontSize:38, color:"rgba(59,175,122,0.4)" }}>﷽</div>
      <div style={{ width:36, height:36, border:"3px solid rgba(59,175,122,0.15)", borderTopColor:"#3BAF7A", borderRadius:"50%", animation:"spin 0.9s linear infinite" }} />
      <div style={{ fontSize:14 }}>جاري تحميل السورة...</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!surah) return (
    <div style={{ background:"var(--bg-primary)", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12, color:"var(--text-muted)" }}>
      <div>⚠️ خطأ في التحميل</div>
      <Link href="/" style={{ color:"#3BAF7A", textDecoration:"none" }}>العودة للرئيسية</Link>
    </div>
  );

  const isMeccan = surah.revelationType==="Meccan";

  return (
    <main style={{ background:"var(--bg-primary)", minHeight:"100vh", direction:"rtl" }}>

      {/* شريط التقدم */}
      <div style={{ position:"fixed", top:0, right:0, left:0, height:3, zIndex:200, background:"rgba(255,255,255,0.04)" }}>
        <div style={{ height:"100%", width:`${progress}%`, background:"linear-gradient(90deg,#3BAF7A,#6DCFA0)", transition:"width 0.2s" }} />
      </div>

      {/* ══ الهيدر ══ */}
      <header style={{ background:"linear-gradient(180deg,#1A3D2B,#112B1E)", boxShadow:"0 2px 16px rgba(0,0,0,0.4)", padding:"10px 14px", display:"flex", alignItems:"center", gap:8, position:"sticky", top:0, zIndex:100 }}>

        <Link href="/" style={{ textDecoration:"none", flexShrink:0 }}>
          <button style={{ background:"rgba(255,255,255,0.1)", border:"none", borderRadius:9, padding:"7px 12px", color:"white", cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>← رئيسية</button>
        </Link>

        <div style={{ display:"flex", gap:4, flexShrink:0 }}>
          {surah.number>1 && <Link href={`/surah/${surah.number-1}`} style={{ textDecoration:"none" }}><button style={{ background:"rgba(255,255,255,0.08)", border:"none", borderRadius:7, padding:"6px 10px", color:"rgba(255,255,255,0.6)", cursor:"pointer", fontSize:16 }}>‹</button></Link>}
          {surah.number<114 && <Link href={`/surah/${surah.number+1}`} style={{ textDecoration:"none" }}><button style={{ background:"rgba(255,255,255,0.08)", border:"none", borderRadius:7, padding:"6px 10px", color:"rgba(255,255,255,0.6)", cursor:"pointer", fontSize:16 }}>›</button></Link>}
        </div>

        <div style={{ flex:1, textAlign:"center", minWidth:0 }}>
          <div className="font-arabic" style={{ fontSize:"clamp(17px,4vw,22px)", fontWeight:"bold", color:"white", lineHeight:1.2 }}>{surah.name}</div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>
            {toAr(surah.numberOfAyahs)} آية · {isMeccan?"مكية":"مدنية"}
            {activeAyah && <span style={{ color:"#6DCFA0" }}> · آية {toAr(activeAyah)}</span>}
          </div>
        </div>

        <div style={{ display:"flex", gap:5, alignItems:"center", flexShrink:0 }}>
          {/* حجم الخط */}
          <div style={{ display:"flex", border:"1px solid rgba(255,255,255,0.12)", borderRadius:8, overflow:"hidden" }}>
            <button onClick={()=>changeFont(-1)} disabled={fontIdx===0} style={{ padding:"6px 8px", background:"rgba(255,255,255,0.06)", border:"none", cursor:fontIdx===0?"not-allowed":"pointer", color:fontIdx===0?"rgba(255,255,255,0.15)":"rgba(255,255,255,0.6)", fontSize:12, borderLeft:"1px solid rgba(255,255,255,0.12)" }}>أ-</button>
            <button onClick={()=>changeFont(1)} disabled={fontIdx===FONT_SIZES.length-1} style={{ padding:"6px 8px", background:"rgba(255,255,255,0.06)", border:"none", cursor:fontIdx===FONT_SIZES.length-1?"not-allowed":"pointer", color:fontIdx===FONT_SIZES.length-1?"rgba(255,255,255,0.15)":"rgba(255,255,255,0.6)", fontSize:12 }}>أ+</button>
          </div>

          {tafsirAvailable && (
            <button onClick={()=>setShowTafsir(!showTafsir)} style={{ background:showTafsir?"rgba(59,175,122,0.25)":"rgba(255,255,255,0.07)", border:`1px solid ${showTafsir?"rgba(59,175,122,0.5)":"rgba(255,255,255,0.1)"}`, borderRadius:8, padding:"6px 10px", color:showTafsir?"#6DCFA0":"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:12, fontFamily:"inherit" }}>تفسير</button>
          )}

          <button onClick={()=>setShowTranslation(!showTranslation)} style={{ background:showTranslation?"rgba(0,212,255,0.15)":"rgba(255,255,255,0.07)", border:`1px solid ${showTranslation?"rgba(0,212,255,0.4)":"rgba(255,255,255,0.1)"}`, borderRadius:8, padding:"6px 10px", color:showTranslation?"#00D4FF":"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:12, fontFamily:"inherit" }}>EN</button>

          <button onClick={toggleBookmark} style={{ background:"transparent", border:"none", cursor:"pointer", fontSize:20, color:bookmarked?"#3BAF7A":"rgba(255,255,255,0.2)", padding:"4px 5px" }}>{bookmarked?"★":"☆"}</button>
        </div>
      </header>

      {/* ══ معلومات السورة ══ */}
      <div style={{ background:"rgba(59,175,122,0.05)", borderBottom:"1px solid rgba(59,175,122,0.1)", padding:"16px 20px", textAlign:"center" }}>
        <div style={{ display:"inline-flex", flexWrap:"wrap", justifyContent:"center", gap:0, alignItems:"center" }}>
          {[surah.englishNameTranslation, `سورة ${toAr(surah.number)}`, isMeccan?"مكية":"مدنية"].map((item, i) => (
            <span key={i} style={{ display:"flex", alignItems:"center" }}>
              {i>0 && <span style={{ width:1, height:14, background:"rgba(255,255,255,0.15)", margin:"0 12px", display:"inline-block" }}/>}
              <span style={{ fontSize:12, color:i===2?(isMeccan?"#6DCFA0":"#a78bfa"):"rgba(255,255,255,0.4)", direction:i===0?"ltr":"rtl" }}>{item}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ══ البسملة ══ */}
      {surah.number!==1 && surah.number!==9 && (
        <div style={{ textAlign:"center", padding:"24px 20px 20px", borderBottom:"1px solid rgba(59,175,122,0.06)" }}>
          <div className="font-arabic" style={{ fontSize:26, color:"rgba(59,175,122,0.85)", lineHeight:2 }}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>
        </div>
      )}

      {/* ══ الآيات ══ */}
      <div style={{ maxWidth:760, margin:"0 auto", padding:"8px 14px" }}>
        {surah.ayahs.map((ayah, idx) => {
          const translation = translations[idx];
          const tafsirText = tafsir?.[id]?.[String(ayah.numberInSurah)];
          const isActive = activeAyah===ayah.numberInSurah;

          return (
            <div
              key={ayah.number}
              ref={el => { ayahRefs.current[ayah.numberInSurah]=el; }}
              style={{
                background:isActive?"rgba(59,175,122,0.05)":"transparent",
                borderRadius:12, padding:"18px 16px 14px",
                marginBottom:4,
                borderBottom:"1px solid rgba(59,175,122,0.07)",
                transition:"background 0.3s",
              }}
            >
              {/* رأس الآية */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                {/* رقم الآية */}
                <div style={{ position:"relative", width:36, height:36, flexShrink:0 }}>
                  <svg viewBox="0 0 36 36" style={{ position:"absolute", top:0, left:0, width:36, height:36 }}>
                    <polygon points="18,1 35,10 35,26 18,35 1,26 1,10" fill="rgba(59,175,122,0.12)" stroke="rgba(59,175,122,0.35)" strokeWidth="1.2"/>
                  </svg>
                  <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"#6DCFA0", fontWeight:"bold" }}>
                    {toAr(ayah.numberInSurah)}
                  </div>
                </div>

                {/* جزء وصفحة */}
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.18)", display:"flex", gap:10 }}>
                  {ayah.juz>0 && <span>جزء {toAr(ayah.juz)}</span>}
                  {ayah.page>0 && <span>ص{toAr(ayah.page)}</span>}
                  {ayah.sajda && <span style={{ color:"rgba(59,175,122,0.5)" }}>۩ سجدة</span>}
                </div>
              </div>

              {/* النص العربي */}
              <div className="font-arabic" style={{
                fontSize, lineHeight:2.2,
                color:"rgba(255,255,255,0.95)",
                textAlign:"right", letterSpacing:"0.5px",
                marginBottom:(showTafsir&&tafsirText)||(showTranslation&&translation)?14:0,
              }}>{ayah.text}</div>

              {/* تفسير السعدي */}
              {showTafsir && tafsirText && (
                <div style={{ borderTop:"1px solid rgba(59,175,122,0.1)", paddingTop:12, marginBottom:showTranslation&&translation?12:0 }}>
                  <div style={{ fontSize:10, color:"rgba(59,175,122,0.6)", letterSpacing:2, marginBottom:8, display:"flex", alignItems:"center", gap:6 }}>
                    <span>📖</span><span>تفسير السعدي</span>
                  </div>
                  <div className="font-arabic" style={{
                    fontSize:Math.max(15, fontSize-10), color:"rgba(255,255,255,0.65)",
                    lineHeight:1.9, textAlign:"right",
                    background:"rgba(59,175,122,0.04)", border:"1px solid rgba(59,175,122,0.08)",
                    borderRadius:9, padding:"12px 14px",
                  }}>{tafsirText}</div>
                </div>
              )}

              {/* الترجمة */}
              {showTranslation && translation && (
                <div style={{ borderTop:"1px solid rgba(255,255,255,0.05)", paddingTop:10, fontSize:13, color:"rgba(255,255,255,0.45)", lineHeight:1.8, direction:"ltr", textAlign:"left", fontStyle:"italic" }}>
                  {translation.text}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ══ تنقل سفلي ══ */}
      <div style={{ display:"flex", gap:10, justifyContent:surah.number>1&&surah.number<114?"space-between":surah.number===1?"flex-end":"flex-start", maxWidth:760, margin:"0 auto", padding:"8px 14px 48px" }}>
        {surah.number>1 && (
          <Link href={`/surah/${surah.number-1}`} style={{ textDecoration:"none" }}>
            <button style={{ background:"rgba(59,175,122,0.1)", border:"1px solid rgba(59,175,122,0.25)", borderRadius:11, padding:"11px 20px", color:"rgba(255,255,255,0.7)", cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>← السابقة</button>
          </Link>
        )}
        {surah.number<114 && (
          <Link href={`/surah/${surah.number+1}`} style={{ textDecoration:"none" }}>
            <button style={{ background:"rgba(59,175,122,0.1)", border:"1px solid rgba(59,175,122,0.25)", borderRadius:11, padding:"11px 20px", color:"rgba(255,255,255,0.7)", cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>التالية →</button>
          </Link>
        )}
      </div>

      {/* زر الأعلى */}
      {showTop && (
        <button onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} style={{ position:"fixed", bottom:24, left:20, width:44, height:44, borderRadius:"50%", background:"#3BAF7A", border:"none", color:"white", fontSize:18, cursor:"pointer", boxShadow:"0 4px 16px rgba(59,175,122,0.4)", zIndex:200 }}>↑</button>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  );
}
