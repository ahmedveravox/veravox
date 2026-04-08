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

interface LastRead {
  surahNum: number;
  surahName: string;
  ayahNum: number;
}

const ARABIC_NUMBERS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
function toArabicNum(n: number): string {
  return String(n).split("").map((d) => ARABIC_NUMBERS[parseInt(d)] ?? d).join("");
}

function SkeletonCard() {
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(201,168,76,0.07)",
      borderRadius: "14px",
      padding: "18px 20px",
      display: "flex",
      alignItems: "center",
      gap: "16px",
    }}>
      <div style={{ width: 46, height: 46, borderRadius: "50%", background: "rgba(255,255,255,0.05)", flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: 18, width: "60%", background: "rgba(255,255,255,0.05)", borderRadius: 6, marginBottom: 8 }} />
        <div style={{ height: 12, width: "40%", background: "rgba(255,255,255,0.03)", borderRadius: 6 }} />
      </div>
      <div style={{ width: 44, height: 24, background: "rgba(255,255,255,0.03)", borderRadius: 20 }} />
    </div>
  );
}

export default function Home() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [search, setSearch] = useState("");
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "bookmarks">("all");
  const [filter, setFilter] = useState<"all" | "meccan" | "medinan">("all");
  const [lastRead, setLastRead] = useState<LastRead | null>(null);

  useEffect(() => {
    const savedBm = localStorage.getItem("quran-bookmarks");
    if (savedBm) setBookmarks(JSON.parse(savedBm));

    const savedLast = localStorage.getItem("quran-last-read");
    if (savedLast) setLastRead(JSON.parse(savedLast));

    fetch("/data/surahs.json")
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => { setSurahs(data); setLoading(false); })
      .catch(() => {
        fetch("https://api.alquran.cloud/v1/surah")
          .then((r) => r.json())
          .then((data) => { setSurahs(data.data); setLoading(false); })
          .catch(() => setLoading(false));
      });
  }, []);

  const toggleBookmark = (e: React.MouseEvent, num: number) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = bookmarks.includes(num)
      ? bookmarks.filter((b) => b !== num)
      : [...bookmarks, num];
    setBookmarks(updated);
    localStorage.setItem("quran-bookmarks", JSON.stringify(updated));
  };

  const filtered = surahs.filter((s) => {
    if (activeTab === "bookmarks" && !bookmarks.includes(s.number)) return false;
    if (filter === "meccan" && s.revelationType !== "Meccan") return false;
    if (filter === "medinan" && s.revelationType !== "Medinan") return false;
    if (!search) return true;
    return (
      s.name.includes(search) ||
      s.englishName.toLowerCase().includes(search.toLowerCase()) ||
      String(s.number).includes(search)
    );
  });

  return (
    <main className="geo-pattern" style={{ background: "var(--bg-primary)", minHeight: "100vh", direction: "rtl" }}>
      {/* Ambient glows */}
      <div style={{ position: "fixed", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.05), transparent 70%)", top: -100, right: -100, pointerEvents: "none" }} />
      <div style={{ position: "fixed", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,212,255,0.03), transparent 70%)", bottom: -100, left: -100, pointerEvents: "none" }} />

      {/* ═══ HEADER ═══ */}
      <header style={{ background: "rgba(13,24,41,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border-gold)", padding: "32px 20px 0", textAlign: "center", position: "sticky", top: 0, zIndex: 100 }}>
        <p className="font-arabic" style={{ fontSize: 13, color: "rgba(201,168,76,0.55)", marginBottom: 8, letterSpacing: 1 }}>
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
        <h1 className="font-arabic" style={{
          fontSize: "clamp(40px, 8vw, 62px)",
          fontWeight: "bold",
          background: "linear-gradient(135deg, #F5D78E 0%, #C9A84C 50%, #9A6F1E 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          margin: 0, lineHeight: 1.1, letterSpacing: 4,
          filter: "drop-shadow(0 0 28px rgba(201,168,76,0.25))",
        }}>نور الروح</h1>
        <p className="font-arabic" style={{ color: "rgba(255,255,255,0.45)", fontSize: 16, marginBottom: 2 }}>القرآن الكريم</p>
        <p style={{ color: "var(--text-muted)", fontSize: 10, letterSpacing: 5, marginBottom: 20 }}>NOOR AL-ROUH · THE HOLY QURAN</p>

        {/* Stats */}
        <div style={{ display: "flex", justifyContent: "center", gap: 28, marginBottom: 20 }}>
          {[["١١٤", "سورة"], ["٦٢٣٦", "آية"], ["٣٠", "جزءً"]].map(([num, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div className="font-arabic" style={{ fontSize: 20, fontWeight: "bold", color: "var(--gold)" }}>{num}</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ maxWidth: 540, margin: "0 auto 16px", position: "relative" }}>
          <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }}>🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث باسم السورة أو رقمها..."
            style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 12, padding: "12px 44px 12px 16px", color: "white", fontSize: 15, outline: "none", boxSizing: "border-box", textAlign: "right", fontFamily: "inherit" }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.55)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.2)")}
          />
        </div>

        {/* Tabs + Filter */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 540, margin: "0 auto" }}>
          <div style={{ display: "flex" }}>
            {([ ["all", "كل السور"], ["bookmarks", "المفضلة"] ] as const).map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key)} style={{
                padding: "9px 18px", background: "transparent", border: "none",
                borderBottom: `2px solid ${activeTab === key ? "var(--gold)" : "transparent"}`,
                color: activeTab === key ? "var(--gold)" : "var(--text-muted)",
                cursor: "pointer", fontSize: 13, fontFamily: "inherit",
              }}>
                {label}
                {key === "bookmarks" && bookmarks.length > 0 && (
                  <span style={{ marginRight: 5, background: "rgba(201,168,76,0.18)", borderRadius: 10, padding: "1px 6px", fontSize: 10, color: "var(--gold)" }}>
                    {bookmarks.length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            {([ ["all", "الكل"], ["meccan", "مكية"], ["medinan", "مدنية"] ] as const).map(([key, label]) => (
              <button key={key} onClick={() => setFilter(key)} style={{
                padding: "4px 10px",
                background: filter === key ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${filter === key ? "rgba(201,168,76,0.5)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 20, color: filter === key ? "var(--gold)" : "var(--text-muted)",
                cursor: "pointer", fontSize: 11, fontFamily: "inherit",
              }}>{label}</button>
            ))}
          </div>
        </div>
      </header>

      {/* ═══ CONTINUE READING ═══ */}
      {lastRead && !search && activeTab === "all" && (
        <div style={{ maxWidth: 960, margin: "16px auto 0", padding: "0 16px" }}>
          <Link href={`/surah/${lastRead.surahNum}`} style={{ textDecoration: "none", display: "block" }}>
            <div style={{
              background: "linear-gradient(135deg, rgba(201,168,76,0.1), rgba(201,168,76,0.03))",
              border: "1px solid rgba(201,168,76,0.3)",
              borderRadius: 14, padding: "14px 20px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              cursor: "pointer",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ fontSize: 22, color: "var(--gold)" }}>📖</div>
                <div>
                  <div style={{ fontSize: 11, color: "rgba(201,168,76,0.6)", letterSpacing: 2, marginBottom: 3 }}>متابعة القراءة</div>
                  <div className="font-arabic" style={{ fontSize: 20, fontWeight: "bold", color: "white" }}>
                    {lastRead.surahName}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    الآية {toArabicNum(lastRead.ayahNum)}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 20, color: "rgba(201,168,76,0.5)" }}>‹</div>
            </div>
          </Link>
        </div>
      )}

      {/* Count */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "12px 16px 6px", color: "var(--text-muted)", fontSize: 12 }}>
        {!loading && <span>{toArabicNum(filtered.length)} سورة{search && ` · نتائج البحث عن "${search}"`}</span>}
      </div>

      {/* ═══ SURAH GRID ═══ */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 16px 48px" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
            <div className="font-arabic" style={{ fontSize: 18 }}>لا توجد نتائج</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
            {filtered.map((surah) => {
              const isMeccan = surah.revelationType === "Meccan";
              const isBookmarked = bookmarks.includes(surah.number);
              const isLastRead = lastRead?.surahNum === surah.number;

              return (
                <div key={surah.number} style={{ position: "relative" }}>
                  <Link href={`/surah/${surah.number}`} style={{ textDecoration: "none", display: "block" }}>
                    <div className="surah-card" style={{
                      background: isLastRead ? "rgba(201,168,76,0.05)" : "rgba(255,255,255,0.025)",
                      border: `1px solid ${isLastRead ? "rgba(201,168,76,0.3)" : "var(--border-gold)"}`,
                      borderRadius: 14, padding: "16px 18px", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 14,
                      transition: "all 0.18s ease",
                    }}>
                      {/* Number */}
                      <div style={{
                        minWidth: 44, height: 44,
                        background: "linear-gradient(135deg, rgba(201,168,76,0.18), rgba(201,168,76,0.04))",
                        border: "1px solid rgba(201,168,76,0.32)", borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, color: "var(--gold)", fontWeight: "bold", flexShrink: 0,
                      }}>{surah.number}</div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="font-arabic" style={{ fontSize: 21, fontWeight: "bold", color: "white", lineHeight: 1.3, marginBottom: 2 }}>
                          {surah.name}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          {surah.englishName} · {surah.numberOfAyahs} آية
                        </div>
                      </div>

                      {/* Badge */}
                      <div style={{
                        fontSize: 10, padding: "3px 9px", borderRadius: 20, flexShrink: 0,
                        background: isMeccan ? "rgba(0,212,255,0.08)" : "rgba(139,92,246,0.08)",
                        color: isMeccan ? "var(--cyan)" : "var(--purple)",
                        border: `1px solid ${isMeccan ? "rgba(0,212,255,0.22)" : "rgba(139,92,246,0.22)"}`,
                      }}>{isMeccan ? "مكية" : "مدنية"}</div>
                    </div>
                  </Link>

                  {/* Bookmark */}
                  <button
                    onClick={(e) => toggleBookmark(e, surah.number)}
                    style={{
                      position: "absolute", bottom: 12, left: 12,
                      background: "transparent", border: "none", cursor: "pointer",
                      fontSize: 16, color: isBookmarked ? "var(--gold)" : "rgba(255,255,255,0.12)",
                      padding: 4, lineHeight: 1, zIndex: 10, transition: "color 0.15s",
                    }}
                  >{isBookmarked ? "★" : "☆"}</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "20px 16px", borderTop: "1px solid var(--border-subtle)" }}>
        <div className="font-arabic" style={{ fontSize: 15, color: "rgba(201,168,76,0.35)" }}>
          ❝ وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ ❞
        </div>
        <div style={{ marginTop: 6, fontSize: 10, letterSpacing: 4, color: "rgba(255,255,255,0.1)" }}>
          نور الروح · NOOR AL-ROUH
        </div>
      </div>

      <style>{`
        .surah-card:hover {
          background: rgba(201,168,76,0.07) !important;
          border-color: rgba(201,168,76,0.38) !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(201,168,76,0.08);
        }
      `}</style>
    </main>
  );
}
