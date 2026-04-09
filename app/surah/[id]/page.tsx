"use client";
import { useState, useEffect, use, useCallback, useRef, useMemo } from "react";
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
const SIZE_LABELS = ["صغير جداً","صغير","متوسط","كبير","كبير جداً"];

/* ── دائرة رقم الآية ── */
function AyahNum({ n, sz }: { n: number; sz: number }) {
  const d = Math.max(20, Math.round(sz * 0.7));
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", justifyContent:"center",
      width:d, height:d, minWidth:d, borderRadius:"50%",
      border:"1.5px solid rgba(59,175,122,0.45)",
      background:"rgba(59,175,122,0.07)",
      fontSize:Math.max(9, Math.round(sz * 0.31)),
      color:"rgba(109,207,160,0.8)",
      verticalAlign:"middle", margin:"0 3px", lineHeight:1, flexShrink:0,
    }}>{toAr(n)}</span>
  );
}

/* ── إطار اسم السورة ── */
function SurahFrame({ name }: { name: string }) {
  return (
    <div style={{ textAlign:"center", padding:"28px 20px 20px" }}>
      <div style={{ display:"inline-block", position:"relative", border:"1px solid rgba(255,255,255,0.32)", padding:"14px 44px", background:"rgba(255,255,255,0.015)" }}>
        {/* زوايا زخرفية */}
        {([
          {top:-7,right:-7,borderTop:"2px solid rgba(255,255,255,0.6)",borderRight:"2px solid rgba(255,255,255,0.6)"},
          {top:-7,left:-7, borderTop:"2px solid rgba(255,255,255,0.6)",borderLeft:"2px solid rgba(255,255,255,0.6)"},
          {bottom:-7,right:-7,borderBottom:"2px solid rgba(255,255,255,0.6)",borderRight:"2px solid rgba(255,255,255,0.6)"},
          {bottom:-7,left:-7, borderBottom:"2px solid rgba(255,255,255,0.6)",borderLeft:"2px solid rgba(255,255,255,0.6)"},
        ] as React.CSSProperties[]).map((s,i) => (
          <div key={i} style={{ position:"absolute", width:14, height:14, ...s }} />
        ))}
        <div className="font-arabic" style={{ fontSize:22, color:"rgba(255,255,255,0.9)", letterSpacing:1, lineHeight:1.4 }}>
          سُورَةُ {name}
        </div>
      </div>
      {/* فاصل زخرفي */}
      <div style={{ display:"flex", alignItems:"center", gap:8, maxWidth:200, margin:"16px auto 0" }}>
        <div style={{ flex:1, height:1, background:"linear-gradient(to left,rgba(59,175,122,0.3),transparent)" }}/>
        <span style={{ color:"rgba(59,175,122,0.45)", fontSize:12 }}>✦</span>
        <div style={{ flex:1, height:1, background:"linear-gradient(to right,rgba(59,175,122,0.3),transparent)" }}/>
      </div>
    </div>
  );
}

/* ── البسملة ── */
function BismillahBlock({ text, fontSize, showNum }: { text?: string; fontSize: number; showNum?: boolean }) {
  const display = text ?? "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
  return (
    <div style={{ textAlign:"center", padding:"4px 20px 26px" }}>
      <div className="font-arabic" style={{ fontSize:Math.round(fontSize*0.88), color:"rgba(255,255,255,0.82)", lineHeight:2.2, letterSpacing:0.5 }}>
        {display}
        {showNum && <> <AyahNum n={1} sz={fontSize}/></>}
      </div>
      <div style={{ width:140, height:1, background:"linear-gradient(90deg,transparent,rgba(59,175,122,0.22),transparent)", margin:"10px auto 0" }}/>
    </div>
  );
}

export default function SurahPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [surah,    setSurah]    = useState<SurahData|null>(null);
  const [trans,    setTrans]    = useState<TranslationAyah[]>([]);
  const [tafsir,   setTafsir]   = useState<TafsirData|null>(null);
  const [tafsirOk, setTafsirOk] = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [showTr,   setShowTr]   = useState(false);
  const [showTf,   setShowTf]   = useState(false);
  const [bm,       setBm]       = useState(false);
  const [fontIdx,  setFontIdx]  = useState(2);
  const [barShow,  setBarShow]  = useState(true);
  const [pageIdx,  setPageIdx]  = useState(0);
  const lastY = useRef(0);
  const touchX = useRef(0);
  const sz = SIZES[fontIdx];

  /* إخفاء الشريط عند التمرير */
  useEffect(() => {
    const fn = () => {
      const y = window.scrollY;
      setBarShow(y < 60 || y < lastY.current);
      lastY.current = y;
    };
    window.addEventListener("scroll", fn, { passive:true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const saveRead = useCallback((s: SurahData) => {
    localStorage.setItem("quran-last-read", JSON.stringify({ surahNum:s.number, surahName:s.name, ayahNum:1 }));
  }, []);

  /* تحميل البيانات */
  useEffect(() => {
    const fi = localStorage.getItem("quran-font-size");
    if (fi) setFontIdx(Number(fi));
    const bms: number[] = JSON.parse(localStorage.getItem("quran-bookmarks")||"[]");
    setBm(bms.includes(Number(id)));
    setLoading(true); setSurah(null); setPageIdx(0);

    fetch(`/data/surah-${id}.json`)
      .then(r => { if(!r.ok) throw new Error(); return r.json(); })
      .then(d => {
        setSurah(d);
        setTrans(d.ayahs.map((a:{numberInSurah:number;translation:string}) =>
          ({numberInSurah:a.numberInSurah, text:a.translation})));
        setLoading(false);
        document.title = `${d.name} | نور الروح`;
        saveRead(d);
      })
      .catch(() =>
        Promise.all([
          fetch(`https://api.alquran.cloud/v1/surah/${id}`).then(r=>r.json()),
          fetch(`https://api.alquran.cloud/v1/surah/${id}/en.sahih`).then(r=>r.json()),
        ]).then(([ar,en]) => {
          setSurah(ar.data); setTrans(en.data?.ayahs??[]);
          setLoading(false); document.title=`${ar.data.name} | نور الروح`;
          saveRead(ar.data);
        }).catch(()=>setLoading(false))
      );

    fetch("/data/tafsir-saadi.json")
      .then(r=>{if(!r.ok)throw new Error();return r.json();})
      .then((d:TafsirData)=>{setTafsir(d);setTafsirOk(true);})
      .catch(()=>setTafsirOk(false));

    window.scrollTo(0,0);
  }, [id, saveRead]);

  const changeFont = (dir:1|-1) => {
    const n = Math.max(0, Math.min(SIZES.length-1, fontIdx+dir));
    setFontIdx(n); localStorage.setItem("quran-font-size", String(n));
  };

  const toggleBm = () => {
    const bms:number[] = JSON.parse(localStorage.getItem("quran-bookmarks")||"[]");
    const num = Number(id);
    const next = bms.includes(num) ? bms.filter(b=>b!==num) : [...bms,num];
    localStorage.setItem("quran-bookmarks", JSON.stringify(next));
    setBm(!bm);
  };

  /* ── تجميع الآيات حسب صفحات المصحف ── */
  const { pageNums, pageMap, hasPages } = useMemo(() => {
    if (!surah) return { pageNums:[], pageMap:{} as Record<number,Ayah[]>, hasPages:false };
    const map: Record<number,Ayah[]> = {};
    for (const a of surah.ayahs) {
      if (!map[a.page]) map[a.page] = [];
      map[a.page].push(a);
    }
    const nums = Object.keys(map).map(Number).sort((a,b)=>a-b);
    return { pageNums:nums, pageMap:map, hasPages: nums.length>0 && nums[0]>0 };
  }, [surah]);

  /* ── منطق البسملة (يمنع التكرار نهائياً) ──
     نحذف التشكيل كاملاً قبل الفحص لأن API يعيد أشكالاً مختلفة
     مثل: بِسْمِ ٱللَّهِ  vs  بِسْمِ اللَّهِ
  ── */
  const bismillahLogic = useMemo(() => {
    if (!surah) return { isBismInData:false, needsBism:false, afterBism:"" };
    // حذف كل علامات التشكيل والحركات
    const removeDiac = (s: string) =>
      s.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, "");
    const clean = removeDiac(surah.ayahs[0]?.text ?? "").trim();
    const isBismInData = clean.startsWith("بسم");
    const needsBism = surah.number !== 9;
    // استخراج المحتوى بعد "رحيم" (مثل "الم" في البقرة)
    let afterBism = "";
    if (isBismInData && surah.number !== 1) {
      const rahimIdx = clean.indexOf("رحيم");
      if (rahimIdx !== -1) {
        afterBism = clean.slice(rahimIdx + 4).trim();
      }
    }
    return { isBismInData, needsBism, afterBism };
  }, [surah]);

  if (loading) return (
    <div style={{ background:"var(--reader-bg,#000)", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:18 }}>
      <div className="font-arabic" style={{ fontSize:46, color:"rgba(59,175,122,0.3)" }}>﷽</div>
      <div style={{ width:36, height:36, border:"3px solid rgba(59,175,122,0.12)", borderTopColor:"#3BAF7A", borderRadius:"50%", animation:"spin .9s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!surah) return (
    <div style={{ background:"#000", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:14, color:"rgba(255,255,255,0.4)" }}>
      <div style={{ fontSize:32 }}>⚠️</div>
      <div className="font-arabic" style={{ fontSize:16 }}>خطأ في تحميل السورة</div>
      <Link href="/" style={{ color:"#3BAF7A", textDecoration:"none", fontSize:14 }}>← العودة للقائمة</Link>
    </div>
  );

  const isMeccan = surah.revelationType === "Meccan";
  const { isBismInData, needsBism, afterBism } = bismillahLogic;

  /* الصفحة الحالية */
  const currentPageNum  = hasPages ? (pageNums[pageIdx] ?? 0) : 0;
  const currentJuz      = hasPages ? (pageMap[currentPageNum]?.[0]?.juz ?? 0) : (surah.ayahs[0]?.juz ?? 0);
  const isFirstPage     = pageIdx === 0;
  const isLastPage      = !hasPages || pageIdx === pageNums.length - 1;

  /* الآيات المعروضة في هذه الصفحة */
  const rawPageAyahs = hasPages ? (pageMap[currentPageNum] ?? []) : surah.ayahs;
  /* إذا كانت الآية الأولى هي البسملة: أخرجها من النص المتدفق */
  const pageAyahs = (isFirstPage && isBismInData)
    ? rawPageAyahs.filter(a => a.numberInSurah !== 1)
    : rawPageAyahs;

  /* التنقل بين صفحات السورة */
  const goPrev = () => {
    if (pageIdx > 0) { setPageIdx(p=>p-1); window.scrollTo(0,0); }
  };
  const goNext = () => {
    if (!isLastPage) { setPageIdx(p=>p+1); window.scrollTo(0,0); }
  };

  /* السحب للتنقل */
  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 55) { dx < 0 ? goNext() : goPrev(); }
  };

  return (
    <main
      style={{ background:"var(--reader-bg,#000)", minHeight:"100vh", direction:"rtl" }}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
    >

      {/* ══ شريط الأدوات العلوي ══ */}
      <div style={{
        position:"fixed", top:0, right:0, left:0, zIndex:300,
        transform:barShow?"translateY(0)":"translateY(-100%)",
        transition:"transform 0.25s ease",
      }}>
        <div style={{
          background:"rgba(0,0,0,0.94)", backdropFilter:"blur(18px)",
          borderBottom:"1px solid rgba(255,255,255,0.07)",
          padding:"9px 14px",
          display:"flex", alignItems:"center", gap:8,
        }}>

          {/* ← رئيسية */}
          <Link href="/" style={{ textDecoration:"none", flexShrink:0 }}>
            <button style={S.btn}>← رئيسية</button>
          </Link>

          {/* ‹ › بين السور */}
          <div style={{ display:"flex", gap:3, flexShrink:0 }}>
            {surah.number>1 && (
              <Link href={`/surah/${surah.number-1}`} style={{ textDecoration:"none" }}>
                <button style={S.arrow} title="السورة السابقة">‹</button>
              </Link>
            )}
            {surah.number<114 && (
              <Link href={`/surah/${surah.number+1}`} style={{ textDecoration:"none" }}>
                <button style={S.arrow} title="السورة التالية">›</button>
              </Link>
            )}
          </div>

          {/* اسم السورة */}
          <div style={{ flex:1, textAlign:"center", minWidth:0, overflow:"hidden" }}>
            <div className="font-arabic" style={{ fontSize:17, fontWeight:"bold", color:"white", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
              {surah.name}
            </div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", display:"flex", gap:6, justifyContent:"center", alignItems:"center" }}>
              <span>{toAr(surah.numberOfAyahs)} آية</span>
              <span style={{ color:"rgba(255,255,255,0.12)" }}>·</span>
              <span>{isMeccan?"مكية":"مدنية"}</span>
              {hasPages && (
                <>
                  <span style={{ color:"rgba(255,255,255,0.12)" }}>·</span>
                  <span style={{ color:"rgba(59,175,122,0.6)" }}>
                    ص {toAr(currentPageNum)}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* الأدوات */}
          <div style={{ display:"flex", gap:5, alignItems:"center", flexShrink:0 }}>

            {/* حجم الخط */}
            <div style={{ display:"flex", border:"1px solid rgba(255,255,255,0.1)", borderRadius:7, overflow:"hidden" }} title={SIZE_LABELS[fontIdx]}>
              <button onClick={()=>changeFont(-1)} disabled={fontIdx===0}
                style={{ padding:"5px 8px", background:"rgba(255,255,255,0.04)", border:"none", borderLeft:"1px solid rgba(255,255,255,0.08)", cursor:fontIdx===0?"default":"pointer", color:fontIdx===0?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.55)", fontSize:12, fontFamily:"inherit" }}>
                أ-
              </button>
              <button onClick={()=>changeFont(1)} disabled={fontIdx===SIZES.length-1}
                style={{ padding:"5px 8px", background:"rgba(255,255,255,0.04)", border:"none", cursor:fontIdx===SIZES.length-1?"default":"pointer", color:fontIdx===SIZES.length-1?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.55)", fontSize:12, fontFamily:"inherit" }}>
                أ+
              </button>
            </div>

            {/* تفسير */}
            {tafsirOk && (
              <button
                onClick={() => { setShowTf(p=>!p); setShowTr(false); }}
                style={{ ...S.toggle, background:showTf?"rgba(59,175,122,0.2)":"rgba(255,255,255,0.05)", borderColor:showTf?"rgba(59,175,122,0.45)":"rgba(255,255,255,0.1)", color:showTf?"#6DCFA0":"rgba(255,255,255,0.45)" }}
              >تفسير</button>
            )}

            {/* ترجمة */}
            <button
              onClick={() => { setShowTr(p=>!p); setShowTf(false); }}
              style={{ ...S.toggle, background:showTr?"rgba(0,195,255,0.15)":"rgba(255,255,255,0.05)", borderColor:showTr?"rgba(0,195,255,0.4)":"rgba(255,255,255,0.1)", color:showTr?"#00C3FF":"rgba(255,255,255,0.45)" }}
            >EN</button>

            {/* مفضلة */}
            <button onClick={toggleBm}
              style={{ background:"transparent", border:"none", cursor:"pointer", fontSize:22, color:bm?"#3BAF7A":"rgba(255,255,255,0.18)", padding:"2px 4px", lineHeight:1, transition:"color 0.15s" }}>
              {bm?"★":"☆"}
            </button>
          </div>
        </div>
      </div>

      {/* ══ محتوى الصفحة ══ */}
      <div style={{ maxWidth:680, margin:"0 auto", paddingTop:52 }}>

        {/* رأس الصفحة — اسم السورة يسار، الجزء يمين (مثل المصحف) */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 20px 0", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <span className="font-arabic" style={{ fontSize:11, color:"rgba(255,255,255,0.25)" }}>
            {currentJuz > 0 ? `الجزء ${toAr(currentJuz)}` : ""}
          </span>
          <span className="font-arabic" style={{ fontSize:11, color:"rgba(255,255,255,0.25)" }}>
            {surah.name}
          </span>
        </div>

        {/* إطار اسم السورة — في الصفحة الأولى فقط */}
        {isFirstPage && <SurahFrame name={surah.name} />}

        {/* ── البسملة (مرة واحدة فقط) ──
            - للفاتحة: بسملة + رقم ① (لأن البسملة هي الآية الأولى)
            - سورة التوبة: لا بسملة
            - كل السور الأخرى: نص البسملة الثابت بدون رقم
        */}
        {isFirstPage && needsBism && (
          <BismillahBlock
            fontSize={sz}
            showNum={surah.number === 1}
          />
        )}

        {/* إذا كانت الآية الأولى تحتوي على نص إضافي بعد البسملة (مثل "الم" في البقرة) */}
        {isFirstPage && isBismInData && afterBism && (
          <div style={{ textAlign:"center", padding:"0 20px 16px" }}>
            <span className="font-arabic" style={{ fontSize:sz, color:"rgba(255,255,255,0.92)" }}>
              {afterBism}
            </span>
            {" "}<AyahNum n={1} sz={sz}/>
          </div>
        )}

        {/* ══ النص القرآني المتدفق ══ */}
        <div style={{ padding:"8px 20px 20px" }}>
          <div className="font-arabic" style={{
            fontSize:sz, lineHeight:2.7,
            color:"rgba(255,255,255,0.92)",
            textAlign:"justify", textAlignLast:"center",
            direction:"rtl", wordSpacing:1,
          }}>
            {pageAyahs.map(ayah => (
              <span key={ayah.number}>
                {ayah.text}{" "}
                <AyahNum n={ayah.numberInSurah} sz={sz}/>{" "}
              </span>
            ))}
          </div>
        </div>

        {/* ══ التنقل بين صفحات المصحف ══ */}
        {hasPages && pageNums.length > 1 && (
          <div style={{ display:"flex", alignItems:"center", gap:12, padding:"8px 20px 20px", justifyContent:"center" }}>

            {/* السابقة */}
            <button onClick={goPrev} disabled={pageIdx===0}
              style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:9, padding:"8px 16px", color:pageIdx===0?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.55)", cursor:pageIdx===0?"default":"pointer", fontSize:13, fontFamily:"inherit" }}>
              ← السابقة
            </button>

            {/* رقم الصفحة */}
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <div style={{ width:42, height:42, borderRadius:"50%", border:"1.5px solid rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:"rgba(255,255,255,0.5)" }}>
                <span className="font-arabic">{toAr(currentPageNum)}</span>
              </div>
              <span style={{ fontSize:10, color:"rgba(255,255,255,0.2)" }}>
                {toAr(pageIdx+1)} / {toAr(pageNums.length)}
              </span>
            </div>

            {/* التالية */}
            <button onClick={goNext} disabled={isLastPage}
              style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:9, padding:"8px 16px", color:isLastPage?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.55)", cursor:isLastPage?"default":"pointer", fontSize:13, fontFamily:"inherit" }}>
              التالية →
            </button>
          </div>
        )}

        {/* ══ الترجمة الإنجليزية ══ */}
        {showTr && trans.length > 0 && (
          <div style={{ margin:"4px 14px 16px", border:"1px solid rgba(0,195,255,0.13)", borderRadius:12, overflow:"hidden" }}>
            <div style={{ background:"rgba(0,195,255,0.05)", padding:"9px 16px", borderBottom:"1px solid rgba(0,195,255,0.08)" }}>
              <span style={{ fontSize:10, color:"rgba(0,195,255,0.55)", letterSpacing:3 }}>ENGLISH TRANSLATION — SAHEEH INTERNATIONAL</span>
            </div>
            <div style={{ padding:"10px 16px 14px", direction:"ltr", textAlign:"left" }}>
              {trans.filter(t => pageAyahs.some(a => a.numberInSurah === t.numberInSurah)).map(t => (
                <p key={t.numberInSurah} style={{ fontSize:13.5, color:"rgba(255,255,255,0.5)", lineHeight:1.85, marginBottom:10, paddingBottom:10, borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontSize:10, color:"rgba(0,195,255,0.45)", marginLeft:7, fontWeight:"bold" }}>{t.numberInSurah}.</span>
                  {t.text}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* ══ تفسير السعدي ══ */}
        {showTf && tafsir && (
          <div style={{ margin:"4px 14px 16px", border:"1px solid rgba(59,175,122,0.13)", borderRadius:12, overflow:"hidden" }}>
            <div style={{ background:"rgba(59,175,122,0.05)", padding:"9px 16px", borderBottom:"1px solid rgba(59,175,122,0.1)", display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:15 }}>📖</span>
              <span className="font-arabic" style={{ fontSize:13, color:"rgba(59,175,122,0.7)", letterSpacing:0.5 }}>تفسير السعدي – رحمه الله</span>
            </div>
            <div style={{ padding:"10px 14px 14px" }}>
              {pageAyahs.map(ayah => {
                const t = tafsir[id]?.[String(ayah.numberInSurah)];
                if (!t) return null;
                return (
                  <div key={ayah.number} style={{ marginBottom:14, padding:"12px 14px", background:"rgba(59,175,122,0.025)", border:"1px solid rgba(59,175,122,0.07)", borderRadius:9 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:9 }}>
                      <AyahNum n={ayah.numberInSurah} sz={20}/>
                      <span className="font-arabic" style={{ fontSize:11, color:"rgba(59,175,122,0.45)" }}>الآية {toAr(ayah.numberInSurah)}</span>
                      {ayah.sajda && <span style={{ fontSize:10, color:"rgba(59,175,122,0.4)" }}>۩ سجدة</span>}
                    </div>
                    <div className="font-arabic" style={{ fontSize:Math.max(13, sz-10), color:"rgba(255,255,255,0.62)", lineHeight:2, textAlign:"right", direction:"rtl" }}>
                      {t}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ تنقل بين السور (في نهاية السورة) ══ */}
        {isLastPage && (
          <div style={{ display:"flex", gap:10, justifyContent: surah.number>1&&surah.number<114 ? "space-between" : surah.number===1 ? "flex-end" : "flex-start", padding:"16px 16px 52px", marginTop:8 }}>
            {surah.number > 1 && (
              <Link href={`/surah/${surah.number-1}`} style={{ textDecoration:"none" }}>
                <button style={S.navBtn}>← السورة السابقة</button>
              </Link>
            )}
            {surah.number < 114 && (
              <Link href={`/surah/${surah.number+1}`} style={{ textDecoration:"none" }}>
                <button style={S.navBtn}>السورة التالية →</button>
              </Link>
            )}
          </div>
        )}
        {!isLastPage && <div style={{ height:40 }}/>}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  );
}

/* ── أنماط مشتركة ── */
const S = {
  btn: {
    background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)",
    borderRadius:8, padding:"6px 11px", color:"rgba(255,255,255,0.55)",
    cursor:"pointer", fontSize:13, fontFamily:"inherit",
  } as React.CSSProperties,

  arrow: {
    background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)",
    borderRadius:7, padding:"5px 10px", color:"rgba(255,255,255,0.45)",
    cursor:"pointer", fontSize:18, lineHeight:1,
  } as React.CSSProperties,

  toggle: {
    border:"1px solid", borderRadius:8, padding:"5px 10px",
    cursor:"pointer", fontSize:12, fontFamily:"inherit", transition:"all 0.15s",
  } as React.CSSProperties,

  navBtn: {
    background:"rgba(59,175,122,0.07)", border:"1px solid rgba(59,175,122,0.2)",
    borderRadius:11, padding:"12px 22px", color:"rgba(255,255,255,0.6)",
    cursor:"pointer", fontSize:14, fontFamily:"inherit",
  } as React.CSSProperties,
};
