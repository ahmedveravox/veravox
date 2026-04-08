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

const ARN = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
function toAr(n: number) { return String(n).split("").map(d=>ARN[parseInt(d)]??d).join(""); }

// First surah marking each juz (approximate for list markers)
const JUZ_BEFORE_SURAH: Record<number, string> = {
  1:  "الجزء الأول",
  2:  "الجزء الثاني",
  3:  "الجزء الثالث",
  4:  "الجزء الرابع",
  5:  "الجزء الخامس",
  6:  "الجزء السادس",
  7:  "الجزء السابع",
  8:  "الجزء الثامن",
  9:  "الجزء التاسع",
  10: "الجزء العاشر",
  11: "الجزء الحادي عشر",
  12: "الجزء الثاني عشر",
  13: "الجزء الثالث عشر",
  15: "الجزء الرابع عشر",
  17: "الجزء الخامس عشر",
  18: "الجزء السادس عشر",
  21: "الجزء السابع عشر",
  23: "الجزء الثامن عشر",
  25: "الجزء التاسع عشر",
  27: "الجزء العشرون",
  29: "الجزء الحادي والعشرون",
  33: "الجزء الثاني والعشرون",
  36: "الجزء الثالث والعشرون",
  39: "الجزء الرابع والعشرون",
  41: "الجزء الخامس والعشرون",
  46: "الجزء السادس والعشرون",
  51: "الجزء السابع والعشرون",
  58: "الجزء الثامن والعشرون",
  67: "الجزء التاسع والعشرون",
  78: "الجزء الثلاثون",
};

// Standard Madina Mushaf start pages per surah
const SURAH_PAGE: Record<number, number> = {
  1:1,2:2,3:50,4:77,5:106,6:128,7:151,8:177,9:187,10:208,
  11:221,12:235,13:249,14:255,15:262,16:267,17:282,18:293,19:305,20:312,
  21:322,22:332,23:342,24:350,25:359,26:367,27:377,28:385,29:396,30:404,
  31:411,32:415,33:418,34:428,35:434,36:440,37:446,38:453,39:458,40:467,
  41:477,42:483,43:489,44:496,45:499,46:502,47:507,48:511,49:515,50:518,
  51:520,52:523,53:526,54:528,55:531,56:534,57:537,58:542,59:545,60:549,
  61:551,62:553,63:554,64:556,65:558,66:560,67:562,68:564,69:566,70:568,
  71:570,72:572,73:574,74:575,75:577,76:578,77:580,78:582,79:583,80:585,
  81:586,82:587,83:587,84:589,85:590,86:591,87:591,88:592,89:593,90:594,
  91:595,92:595,93:596,94:596,95:597,96:597,97:598,98:598,99:599,100:599,
  101:600,102:600,103:601,104:601,105:601,106:602,107:602,108:602,109:603,110:603,
  111:603,112:604,113:604,114:604,
};

function Skeleton() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:14, padding:"15px 18px", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
      <div style={{ width:44, height:44, borderRadius:"50%", background:"rgba(255,255,255,0.05)", flexShrink:0 }} />
      <div style={{ flex:1 }}>
        <div style={{ height:18, width:"45%", background:"rgba(255,255,255,0.05)", borderRadius:6, marginBottom:8 }} />
        <div style={{ height:11, width:"70%", background:"rgba(255,255,255,0.03)", borderRadius:6 }} />
      </div>
    </div>
  );
}

type BottomTab = "surahs" | "khatma" | "bookmarks" | "starred" | "notes";
type TopTab = "surahs" | "eighths";

export default function Home() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [search, setSearch] = useState("");
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [bottomTab, setBottomTab] = useState<BottomTab>("surahs");
  const [topTab, setTopTab] = useState<TopTab>("surahs");
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
    if (bottomTab === "starred" && !bookmarks.includes(s.number)) return false;
    if (!search) return true;
    return s.name.includes(search) || s.englishName.toLowerCase().includes(search.toLowerCase()) || String(s.number).includes(search);
  });

  const BOTTOM_TABS: { key: BottomTab; icon: string; label: string }[] = [
    { key:"surahs",    icon:"☰",  label:"السور" },
    { key:"khatma",   icon:"🔄", label:"الختمة" },
    { key:"bookmarks",icon:"🔖", label:"الفواصل" },
    { key:"starred",  icon:"★",  label:"مميزة" },
    { key:"notes",    icon:"📝", label:"ملاحظات" },
  ];

  return (
    <main style={{ background:"#0B1512", minHeight:"100vh", direction:"rtl", paddingBottom:70 }}>

      {/* ══ الهيدر ══ */}
      <header style={{ background:"#112B1E", padding:"20px 16px 0", position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 0 rgba(59,175,122,0.12)" }}>

        {/* الشعار + العنوان */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
          <img src="/icon.svg" style={{ width:38, height:38, borderRadius:9, flexShrink:0 }} alt="نور الروح" />
          <div>
            <h1 className="font-arabic" style={{ fontSize:21, fontWeight:"bold", color:"white", margin:0, lineHeight:1.2 }}>نور الروح</h1>
            <p style={{ color:"rgba(255,255,255,0.3)", fontSize:8, letterSpacing:4, margin:0 }}>NOOR AL-ROUH</p>
          </div>
          <div style={{ flex:1 }} />
          <Link href="/settings" style={{ textDecoration:"none" }}>
            <button style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:9, padding:"7px 10px", color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:16, lineHeight:1 }}>⚙</button>
          </Link>
        </div>

        {/* بحث */}
        <div style={{ position:"relative", marginBottom:12 }}>
          <span style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,0.3)", pointerEvents:"none", fontSize:13 }}>🔍</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ابحث باسم السورة أو رقمها..."
            style={{ width:"100%", background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"10px 40px 10px 14px", color:"white", fontSize:14, outline:"none", boxSizing:"border-box", textAlign:"right", fontFamily:"inherit" }}
            onFocus={e => (e.target.style.borderColor="rgba(59,175,122,0.5)")}
            onBlur={e => (e.target.style.borderColor="rgba(255,255,255,0.1)")}
          />
        </div>

        {/* التبويبات العليا */}
        <div style={{ display:"flex", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          {([["surahs","السور"],["eighths","الأرباع"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTopTab(key)} style={{
              padding:"9px 22px", background:"transparent", border:"none",
              borderBottom:`2px solid ${topTab===key?"#3BAF7A":"transparent"}`,
              color:topTab===key?"#6DCFA0":"rgba(255,255,255,0.35)",
              cursor:"pointer", fontSize:14, fontFamily:"inherit", transition:"all 0.15s",
            }}>{label}</button>
          ))}
        </div>
      </header>

      {/* ══ متابعة القراءة ══ */}
      {lastRead && !search && bottomTab==="surahs" && topTab==="surahs" && (
        <div style={{ padding:"12px 14px 0" }}>
          <Link href={`/surah/${lastRead.surahNum}`} style={{ textDecoration:"none", display:"block" }}>
            <div style={{ background:"linear-gradient(135deg, rgba(59,175,122,0.12), rgba(59,175,122,0.04))", border:"1px solid rgba(59,175,122,0.22)", borderRadius:12, padding:"12px 16px", display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:38, height:38, background:"rgba(59,175,122,0.18)", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, flexShrink:0 }}>📖</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:9, color:"rgba(59,175,122,0.6)", letterSpacing:2, marginBottom:2 }}>متابعة القراءة</div>
                <div className="font-arabic" style={{ fontSize:17, fontWeight:"bold", color:"white" }}>{lastRead.surahName}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>الآية {toAr(lastRead.ayahNum)}</div>
              </div>
              <div style={{ fontSize:20, color:"rgba(59,175,122,0.35)" }}>‹</div>
            </div>
          </Link>
        </div>
      )}

      {/* ══ الأرباع placeholder ══ */}
      {topTab === "eighths" && (
        <div style={{ textAlign:"center", padding:"80px 20px", color:"rgba(255,255,255,0.2)" }}>
          <div style={{ fontSize:44, marginBottom:14 }}>📑</div>
          <div className="font-arabic" style={{ fontSize:18 }}>الأرباع والأثمان</div>
          <div style={{ fontSize:12, marginTop:8 }}>قريباً</div>
        </div>
      )}

      {/* ══ placeholder للتبويبات الأخرى ══ */}
      {(bottomTab === "notes" || bottomTab === "khatma") && topTab === "surahs" && (
        <div style={{ textAlign:"center", padding:"80px 20px", color:"rgba(255,255,255,0.2)" }}>
          <div style={{ fontSize:44, marginBottom:14 }}>{bottomTab==="notes"?"📝":"🔄"}</div>
          <div className="font-arabic" style={{ fontSize:18 }}>{bottomTab==="notes"?"الملاحظات":"الختمة"}</div>
          <div style={{ fontSize:12, marginTop:8 }}>قريباً</div>
        </div>
      )}

      {/* ══ قائمة السور ══ */}
      {topTab === "surahs" && (bottomTab === "surahs" || bottomTab === "starred" || bottomTab === "bookmarks") && (
        <div style={{ marginTop:10 }}>
          {loading ? (
            Array.from({length:12}).map((_, i) => <Skeleton key={i}/>)
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:"center", padding:"60px 20px", color:"rgba(255,255,255,0.3)" }}>
              <div style={{ fontSize:32, marginBottom:10 }}>🔍</div>
              <div className="font-arabic" style={{ fontSize:16 }}>لا توجد نتائج</div>
            </div>
          ) : (
            filtered.map((surah) => {
              const isMeccan = surah.revelationType === "Meccan";
              const isBookmarked = bookmarks.includes(surah.number);
              const page = SURAH_PAGE[surah.number];
              const juzLabel = JUZ_BEFORE_SURAH[surah.number];

              return (
                <div key={surah.number}>

                  {/* فاصل الجزء */}
                  {juzLabel && !search && bottomTab === "surahs" && (
                    <div style={{ padding:"10px 18px 6px", display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ flex:1, height:"1px", background:"rgba(59,175,122,0.14)" }} />
                      <span className="font-arabic" style={{ fontSize:11, color:"rgba(59,175,122,0.5)", whiteSpace:"nowrap" }}>{juzLabel}</span>
                      <div style={{ flex:1, height:"1px", background:"rgba(59,175,122,0.14)" }} />
                    </div>
                  )}

                  {/* صف السورة */}
                  <div style={{ position:"relative", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                    <Link href={`/surah/${surah.number}`} style={{ textDecoration:"none", display:"block" }}>
                      <div className="surah-row" style={{ display:"flex", alignItems:"center", gap:14, padding:"13px 18px 13px 52px" }}>

                        {/* رقم السورة - دائرة */}
                        <div style={{ width:44, height:44, borderRadius:"50%", background:"rgba(59,175,122,0.13)", border:"1.5px solid rgba(59,175,122,0.28)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          <span className="font-arabic" style={{ fontSize:14, fontWeight:"bold", color:"#6DCFA0" }}>{toAr(surah.number)}</span>
                        </div>

                        {/* معلومات السورة */}
                        <div style={{ flex:1, minWidth:0 }}>
                          <div className="font-arabic" style={{ fontSize:20, fontWeight:"bold", color:"rgba(255,255,255,0.92)", lineHeight:1.3, marginBottom:4 }}>
                            {surah.name}
                          </div>
                          <div style={{ fontSize:11, color:"rgba(255,255,255,0.28)", display:"flex", alignItems:"center", gap:5, flexWrap:"wrap" }}>
                            {page && <span>الصفحة {toAr(page)}</span>}
                            <span style={{ color:"rgba(255,255,255,0.12)" }}>·</span>
                            <span>آياتها {toAr(surah.numberOfAyahs)}</span>
                            <span style={{ color:"rgba(255,255,255,0.12)" }}>·</span>
                            <span style={{ color:isMeccan?"rgba(59,175,122,0.6)":"rgba(139,92,246,0.6)" }}>
                              {isMeccan ? "مكية" : "مدنية"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>

                    {/* زر المفضلة */}
                    <button onClick={e => toggleBookmark(e, surah.number)} style={{
                      position:"absolute", left:14, top:"50%", transform:"translateY(-50%)",
                      background:"transparent", border:"none", cursor:"pointer",
                      fontSize:17, color:isBookmarked?"#3BAF7A":"rgba(255,255,255,0.1)",
                      padding:5, lineHeight:1, zIndex:10, transition:"color 0.15s",
                    }}>{isBookmarked ? "★" : "☆"}</button>
                  </div>
                </div>
              );
            })
          )}

          {/* فاتر */}
          {!search && filtered.length > 0 && (
            <div style={{ textAlign:"center", padding:"24px 16px 12px", color:"rgba(255,255,255,0.08)", fontSize:11 }}>
              <div className="font-arabic" style={{ fontSize:13, color:"rgba(59,175,122,0.2)" }}>
                ❝ وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ ❞
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ شريط التنقل السفلي ══ */}
      <nav style={{
        position:"fixed", bottom:0, right:0, left:0, zIndex:200,
        background:"rgba(8,18,12,0.97)", backdropFilter:"blur(20px)",
        borderTop:"1px solid rgba(59,175,122,0.1)",
        display:"flex", alignItems:"stretch",
        height:62,
      }}>
        {BOTTOM_TABS.map(({ key, icon, label }) => {
          const active = bottomTab === key;
          return (
            <button key={key} onClick={() => setBottomTab(key)} style={{
              flex:1, background:"transparent", border:"none", cursor:"pointer",
              display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              gap:3, fontFamily:"inherit", position:"relative",
              color:active ? "#6DCFA0" : "rgba(255,255,255,0.28)",
              transition:"color 0.15s",
            }}>
              {active && <div style={{ position:"absolute", top:0, width:32, height:2, background:"#3BAF7A", borderRadius:"0 0 2px 2px" }} />}
              <span style={{ fontSize:18, lineHeight:1 }}>{icon}</span>
              <span className="font-arabic" style={{ fontSize:10 }}>{label}</span>
            </button>
          );
        })}
      </nav>

      <style>{`
        .surah-row:hover { background: rgba(59,175,122,0.04) !important; }
        .surah-row:active { background: rgba(59,175,122,0.08) !important; }
      `}</style>
    </main>
  );
}
