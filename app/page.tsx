"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface LastRead { surahNum: number; surahName: string; ayahNum: number; }

const ARABIC_NUMBERS = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
function toArabicNum(n: number) {
  return String(n).split("").map(d => ARABIC_NUMBERS[parseInt(d)] ?? d).join("");
}

function Skeleton() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 18px", borderBottom:"1px solid rgba(59,175,122,0.08)" }}>
      <div style={{ width:42, height:42, borderRadius:"50%", background:"rgba(255,255,255,0.05)", flexShrink:0 }} />
      <div style={{ flex:1 }}>
        <div style={{ height:16, width:"55%", background:"rgba(255,255,255,0.05)", borderRadius:6, marginBottom:8 }} />
        <div style={{ height:11, width:"35%", background:"rgba(255,255,255,0.03)", borderRadius:6 }} />
      </div>
      <div style={{ width:36, height:20, background:"rgba(255,255,255,0.03)", borderRadius:20 }} />
    </div>
  );
}

export default function Home() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [search, setSearch] = useState("");
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all"|"bookmarks">("all");
  const [filter, setFilter] = useState<"all"|"meccan"|"medinan">("all");
  const [lastRead, setLastRead] = useState<LastRead|null>(null);

  useEffect(() => {
    const bm = localStorage.getItem("quran-bookmarks");
    if (bm) setBookmarks(JSON.parse(bm));
    const lr = localStorage.getItem("quran-last-read");
    if (lr) setLastRead(JSON.parse(lr));

    fetch("/data/surahs.json")
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => { setSurahs(data); setLoading(false); })
      .catch(() => {
        fetch("https://api.alquran.cloud/v1/surah")
          .then(r => r.json())
          .then(data => { setSurahs(data.data); setLoading(false); })
          .catch(() => setLoading(false));
      });
  }, []);

  const toggleBookmark = (e: React.MouseEvent, num: number) => {
    e.preventDefault(); e.stopPropagation();
    const updated = bookmarks.includes(num) ? bookmarks.filter(b => b !== num) : [...bookmarks, num];
    setBookmarks(updated);
    localStorage.setItem("quran-bookmarks", JSON.stringify(updated));
  };

  const filtered = surahs.filter(s => {
    if (activeTab === "bookmarks" && !bookmarks.includes(s.number)) return false;
    if (filter === "meccan" && s.revelationType !== "Meccan") return false;
    if (filter === "medinan" && s.revelationType !== "Medinan") return false;
    if (!search) return true;
    return s.name.includes(search) || s.englishName.toLowerCase().includes(search.toLowerCase()) || String(s.number).includes(search);
  });

  return (
    <main style={{ background:"var(--bg-primary)", minHeight:"100vh", direction:"rtl" }}>

      {/* ══ الهيدر ══ */}
      <header style={{ background:"linear-gradient(180deg, #1A3D2B 0%, #112B1E 100%)", padding:"32px 20px 0", textAlign:"center", position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 20px rgba(0,0,0,0.4)" }}>

        {/* الأيقونة */}
        <div style={{ width:70, height:70, margin:"0 auto 12px", background:"rgba(255,255,255,0.1)", borderRadius:18, display:"flex", alignItems:"center", justifyContent:"center", border:"1px solid rgba(255,255,255,0.15)" }}>
          <img src="/icon.svg" style={{ width:50, height:50, borderRadius:12 }} alt="نور الروح" />
        </div>

        <h1 className="font-arabic" style={{ fontSize:"clamp(32px,7vw,52px)", fontWeight:"bold", color:"white", margin:"0 0 4px", lineHeight:1.1, textShadow:"0 2px 12px rgba(0,0,0,0.3)" }}>
          نور الروح
        </h1>
        <p className="font-arabic" style={{ color:"rgba(255,255,255,0.65)", fontSize:15, marginBottom:2 }}>القرآن الكريم</p>
        <p style={{ color:"rgba(255,255,255,0.35)", fontSize:10, letterSpacing:5, marginBottom:20 }}>NOOR AL-ROUH</p>

        {/* الإحصائيات */}
        <div style={{ display:"flex", justifyContent:"center", gap:0, marginBottom:18, background:"rgba(0,0,0,0.2)", borderRadius:14, padding:"10px 20px", maxWidth:300, margin:"0 auto 18px" }}>
          {[["١١٤","سورة"],["٦٢٣٦","آية"],["٣٠","جزءً"]].map(([num, label], i) => (
            <div key={label} style={{ textAlign:"center", flex:1, borderRight:i<2?"1px solid rgba(255,255,255,0.1)":"none", paddingLeft:i>0?8:0 }}>
              <div className="font-arabic" style={{ fontSize:18, fontWeight:"bold", color:"#6DCFA0" }}>{num}</div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.4)" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* البحث */}
        <div style={{ maxWidth:500, margin:"0 auto 14px", position:"relative" }}>
          <span style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,0.4)", pointerEvents:"none", fontSize:14 }}>🔍</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ابحث باسم السورة أو رقمها..."
            style={{ width:"100%", background:"rgba(0,0,0,0.25)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:12, padding:"11px 42px 11px 16px", color:"white", fontSize:15, outline:"none", boxSizing:"border-box", textAlign:"right", fontFamily:"inherit" }}
            onFocus={e => (e.target.style.borderColor="rgba(59,175,122,0.6)")}
            onBlur={e => (e.target.style.borderColor="rgba(255,255,255,0.15)")}
          />
        </div>

        {/* التبويبات */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", maxWidth:500, margin:"0 auto" }}>
          <div style={{ display:"flex" }}>
            {([ ["all","كل السور"], ["bookmarks","المفضلة"] ] as const).map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key)} style={{
                padding:"9px 16px", background:"transparent", border:"none",
                borderBottom:`2px solid ${activeTab===key?"#3BAF7A":"transparent"}`,
                color:activeTab===key?"#6DCFA0":"rgba(255,255,255,0.45)",
                cursor:"pointer", fontSize:13, fontFamily:"inherit",
              }}>
                {label}
                {key==="bookmarks" && bookmarks.length>0 && (
                  <span style={{ marginRight:5, background:"rgba(59,175,122,0.2)", borderRadius:10, padding:"1px 6px", fontSize:10, color:"#6DCFA0" }}>{bookmarks.length}</span>
                )}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", gap:5 }}>
            {([ ["all","الكل"], ["meccan","مكية"], ["medinan","مدنية"] ] as const).map(([key, label]) => (
              <button key={key} onClick={() => setFilter(key)} style={{
                padding:"4px 9px",
                background:filter===key?"rgba(59,175,122,0.2)":"rgba(255,255,255,0.05)",
                border:`1px solid ${filter===key?"rgba(59,175,122,0.5)":"rgba(255,255,255,0.1)"}`,
                borderRadius:20, color:filter===key?"#6DCFA0":"rgba(255,255,255,0.35)",
                cursor:"pointer", fontSize:11, fontFamily:"inherit",
              }}>{label}</button>
            ))}
          </div>
        </div>
      </header>

      {/* ══ متابعة القراءة ══ */}
      {lastRead && !search && activeTab==="all" && (
        <div style={{ padding:"12px 16px 0" }}>
          <Link href={`/surah/${lastRead.surahNum}`} style={{ textDecoration:"none", display:"block" }}>
            <div style={{ background:"linear-gradient(135deg, rgba(59,175,122,0.15), rgba(59,175,122,0.05))", border:"1px solid rgba(59,175,122,0.3)", borderRadius:14, padding:"13px 18px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:42, height:42, background:"rgba(59,175,122,0.2)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>📖</div>
                <div>
                  <div style={{ fontSize:10, color:"rgba(59,175,122,0.7)", letterSpacing:2, marginBottom:3 }}>متابعة القراءة</div>
                  <div className="font-arabic" style={{ fontSize:19, fontWeight:"bold", color:"white" }}>{lastRead.surahName}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>الآية {toArabicNum(lastRead.ayahNum)}</div>
                </div>
              </div>
              <div style={{ fontSize:22, color:"rgba(59,175,122,0.5)" }}>‹</div>
            </div>
          </Link>
        </div>
      )}

      {/* ══ قائمة السور ══ */}
      <div style={{ background:"rgba(255,255,255,0.02)", margin:"12px 14px", borderRadius:16, overflow:"hidden", border:"1px solid rgba(59,175,122,0.08)" }}>
        {loading ? (
          Array.from({length:10}).map((_, i) => <Skeleton key={i}/>)
        ) : filtered.length===0 ? (
          <div style={{ textAlign:"center", padding:"60px 20px", color:"var(--text-muted)" }}>
            <div style={{ fontSize:32, marginBottom:10 }}>🔍</div>
            <div className="font-arabic" style={{ fontSize:16 }}>لا توجد نتائج</div>
          </div>
        ) : (
          filtered.map((surah, idx) => {
            const isMeccan = surah.revelationType==="Meccan";
            const isBookmarked = bookmarks.includes(surah.number);
            const isLast = idx===filtered.length-1;

            return (
              <div key={surah.number} style={{ position:"relative", borderBottom:isLast?"none":"1px solid rgba(59,175,122,0.07)" }}>
                <Link href={`/surah/${surah.number}`} style={{ textDecoration:"none", display:"block" }}>
                  <div className="surah-row" style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 18px", cursor:"pointer", transition:"background 0.15s" }}>
                    {/* رقم السورة */}
                    <div style={{ position:"relative", width:42, height:42, flexShrink:0 }}>
                      <svg viewBox="0 0 42 42" style={{ position:"absolute", top:0, left:0, width:42, height:42 }}>
                        <polygon points="21,2 40,12 40,30 21,40 2,30 2,12" fill="none" stroke="rgba(59,175,122,0.4)" strokeWidth="1.5"/>
                      </svg>
                      <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:"#6DCFA0", fontWeight:"bold" }}>
                        {surah.number}
                      </div>
                    </div>

                    {/* معلومات السورة */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div className="font-arabic" style={{ fontSize:21, fontWeight:"bold", color:"white", lineHeight:1.3, marginBottom:3 }}>
                        {surah.name}
                      </div>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>
                        {surah.englishName} · {surah.numberOfAyahs} آية
                      </div>
                    </div>

                    {/* النوع */}
                    <div style={{ fontSize:10, padding:"3px 9px", borderRadius:20, flexShrink:0,
                      background:isMeccan?"rgba(59,175,122,0.12)":"rgba(139,92,246,0.1)",
                      color:isMeccan?"#6DCFA0":"#a78bfa",
                      border:`1px solid ${isMeccan?"rgba(59,175,122,0.25)":"rgba(139,92,246,0.25)"}`,
                    }}>{isMeccan?"مكية":"مدنية"}</div>
                  </div>
                </Link>

                {/* نجمة المفضلة */}
                <button onClick={e => toggleBookmark(e, surah.number)} style={{
                  position:"absolute", bottom:13, left:15, background:"transparent", border:"none",
                  cursor:"pointer", fontSize:16, color:isBookmarked?"#3BAF7A":"rgba(255,255,255,0.1)",
                  padding:4, lineHeight:1, zIndex:10, transition:"color 0.15s",
                }}>{isBookmarked?"★":"☆"}</button>
              </div>
            );
          })
        )}
      </div>

      {/* الفوتر */}
      <div style={{ textAlign:"center", padding:"16px", color:"rgba(255,255,255,0.15)", fontSize:11 }}>
        <div className="font-arabic" style={{ fontSize:14, color:"rgba(59,175,122,0.35)", marginBottom:4 }}>
          ❝ وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ ❞
        </div>
        نور الروح · NOOR AL-ROUH
      </div>

      <style>{`
        .surah-row:hover { background: rgba(59,175,122,0.05) !important; }
        @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
      `}</style>
    </main>
  );
}
