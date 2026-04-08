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

const ARABIC_NUMBERS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
function toArabicNum(n: number): string {
  return String(n)
    .split("")
    .map((d) => ARABIC_NUMBERS[parseInt(d)] ?? d)
    .join("");
}

export default function Home() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [search, setSearch] = useState("");
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "bookmarks">("all");
  const [filter, setFilter] = useState<"all" | "meccan" | "medinan">("all");
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("quran-bookmarks");
    if (saved) setBookmarks(JSON.parse(saved));

    // حاول من الملف المحلي أولاً (بدون إنترنت)
    fetch("/data/surahs.json")
      .then((r) => {
        if (!r.ok) throw new Error("no local data");
        return r.json();
      })
      .then((data) => {
        setSurahs(data);
        setLoading(false);
      })
      .catch(() => {
        // fallback: من الإنترنت
        fetch("https://api.alquran.cloud/v1/surah")
          .then((r) => r.json())
          .then((data) => {
            setSurahs(data.data);
            setLoading(false);
          })
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
    <main
      className="geo-pattern"
      style={{
        background: "var(--bg-primary)",
        minHeight: "100vh",
        direction: "rtl",
      }}
    >
      {/* Ambient glows */}
      <div
        style={{
          position: "fixed",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(201,168,76,0.04), transparent 70%)",
          top: "-100px",
          right: "-100px",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,212,255,0.03), transparent 70%)",
          bottom: "-100px",
          left: "-100px",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <header
        style={{
          background: "rgba(13,24,41,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border-gold)",
          padding: "40px 24px 0",
          textAlign: "center",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <p
          className="font-arabic"
          style={{
            fontSize: "14px",
            letterSpacing: "2px",
            color: "rgba(201,168,76,0.6)",
            marginBottom: "10px",
          }}
        >
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>

        {/* App name: نور */}
        <h1
          className="font-arabic"
          style={{
            fontSize: "58px",
            fontWeight: "bold",
            background: "linear-gradient(135deg, #F5D78E 0%, #C9A84C 50%, #9A6F1E 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            margin: "0",
            lineHeight: "1.1",
            letterSpacing: "4px",
            textShadow: "none",
            filter: "drop-shadow(0 0 30px rgba(201,168,76,0.3))",
          }}
        >
          نور الروح
        </h1>

        <p
          className="font-arabic"
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: "18px",
            marginBottom: "4px",
            letterSpacing: "1px",
          }}
        >
          القرآن الكريم
        </p>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "11px",
            letterSpacing: "5px",
            marginBottom: "28px",
          }}
        >
          NOOR AL-ROUH · THE HOLY QURAN
        </p>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "32px",
            marginBottom: "24px",
          }}
        >
          {[
            ["١١٤", "سورة"],
            ["٦٢٣٦", "آية"],
            ["٣٠", "جزء"],
          ].map(([num, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div
                className="font-arabic"
                style={{
                  fontSize: "22px",
                  fontWeight: "bold",
                  color: "var(--gold)",
                }}
              >
                {num}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div
          style={{
            maxWidth: "540px",
            margin: "0 auto 20px",
            position: "relative",
          }}
        >
          <span
            style={{
              position: "absolute",
              right: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
              fontSize: "16px",
              pointerEvents: "none",
            }}
          >
            🔍
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث باسم السورة أو رقمها..."
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(201,168,76,0.25)",
              borderRadius: "14px",
              padding: "14px 48px 14px 20px",
              color: "white",
              fontSize: "16px",
              outline: "none",
              boxSizing: "border-box",
              textAlign: "right",
              fontFamily: "inherit",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = "rgba(201,168,76,0.6)")
            }
            onBlur={(e) =>
              (e.target.style.borderColor = "rgba(201,168,76,0.25)")
            }
          />
        </div>

        {/* Tabs + Filter row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            maxWidth: "540px",
            margin: "0 auto",
            paddingBottom: "0",
          }}
        >
          {/* Tabs */}
          <div style={{ display: "flex", gap: "0" }}>
            {(
              [
                ["all", "كل السور"],
                ["bookmarks", "المفضلة"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  padding: "10px 20px",
                  background: "transparent",
                  border: "none",
                  borderBottom: `2px solid ${activeTab === key ? "var(--gold)" : "transparent"}`,
                  color:
                    activeTab === key ? "var(--gold)" : "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontFamily: "inherit",
                }}
              >
                {label}
                {key === "bookmarks" && bookmarks.length > 0 && (
                  <span
                    style={{
                      marginRight: "6px",
                      background: "rgba(201,168,76,0.2)",
                      borderRadius: "10px",
                      padding: "1px 7px",
                      fontSize: "11px",
                      color: "var(--gold)",
                    }}
                  >
                    {bookmarks.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Filter pills */}
          <div style={{ display: "flex", gap: "6px" }}>
            {(
              [
                ["all", "الكل"],
                ["meccan", "مكية"],
                ["medinan", "مدنية"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                style={{
                  padding: "5px 12px",
                  background:
                    filter === key
                      ? "rgba(201,168,76,0.15)"
                      : "rgba(255,255,255,0.03)",
                  border: `1px solid ${filter === key ? "rgba(201,168,76,0.5)" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: "20px",
                  color: filter === key ? "var(--gold)" : "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontFamily: "inherit",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Count */}
      <div
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          padding: "16px 16px 8px",
          color: "var(--text-muted)",
          fontSize: "13px",
        }}
      >
        {!loading && (
          <span>
            {toArabicNum(filtered.length)} سورة
            {search && ` · نتائج البحث عن "${search}"`}
          </span>
        )}
      </div>

      {/* Surah Grid */}
      <div
        style={{ maxWidth: "960px", margin: "0 auto", padding: "0 16px 48px" }}
      >
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px",
              color: "var(--text-muted)",
            }}
          >
            <div
              className="font-arabic"
              style={{ fontSize: "24px", marginBottom: "12px" }}
            >
              ﷽
            </div>
            <div style={{ fontSize: "16px" }}>جاري تحميل السور...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px",
              color: "var(--text-muted)",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔍</div>
            <div style={{ fontSize: "16px" }}>لا توجد نتائج</div>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "12px",
            }}
          >
            {filtered.map((surah) => {
              const isMeccan = surah.revelationType === "Meccan";
              const isBookmarked = bookmarks.includes(surah.number);
              const isHovered = hoveredCard === surah.number;

              return (
                <div key={surah.number} style={{ position: "relative" }}>
                  <Link
                    href={`/surah/${surah.number}`}
                    style={{ textDecoration: "none", display: "block" }}
                  >
                    <div
                      onMouseEnter={() => setHoveredCard(surah.number)}
                      onMouseLeave={() => setHoveredCard(null)}
                      style={{
                        background: isHovered
                          ? "rgba(201,168,76,0.06)"
                          : "rgba(255,255,255,0.025)",
                        border: `1px solid ${isHovered ? "rgba(201,168,76,0.35)" : "var(--border-gold)"}`,
                        borderRadius: "14px",
                        padding: "18px 20px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        transition: "all 0.2s ease",
                        transform: isHovered ? "translateY(-1px)" : "none",
                        boxShadow: isHovered
                          ? "0 4px 24px rgba(201,168,76,0.1)"
                          : "none",
                      }}
                    >
                      {/* Number badge */}
                      <div
                        style={{
                          minWidth: "46px",
                          height: "46px",
                          background:
                            "linear-gradient(135deg, rgba(201,168,76,0.18), rgba(201,168,76,0.05))",
                          border: "1px solid rgba(201,168,76,0.35)",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                          color: "var(--gold)",
                          fontWeight: "bold",
                          flexShrink: 0,
                        }}
                      >
                        {surah.number}
                      </div>

                      {/* Surah info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          className="font-arabic"
                          style={{
                            fontSize: "22px",
                            fontWeight: "bold",
                            color: "white",
                            lineHeight: "1.3",
                            marginBottom: "3px",
                          }}
                        >
                          {surah.name}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--text-muted)",
                          }}
                        >
                          {surah.englishName} · {surah.numberOfAyahs} آية
                        </div>
                      </div>

                      {/* Type badge */}
                      <div
                        style={{
                          fontSize: "11px",
                          padding: "4px 10px",
                          borderRadius: "20px",
                          background: isMeccan
                            ? "rgba(0,212,255,0.08)"
                            : "rgba(139,92,246,0.08)",
                          color: isMeccan ? "var(--cyan)" : "var(--purple)",
                          border: `1px solid ${isMeccan ? "rgba(0,212,255,0.25)" : "rgba(139,92,246,0.25)"}`,
                          flexShrink: 0,
                        }}
                      >
                        {isMeccan ? "مكية" : "مدنية"}
                      </div>
                    </div>
                  </Link>

                  {/* Bookmark button */}
                  <button
                    onClick={(e) => toggleBookmark(e, surah.number)}
                    title={isBookmarked ? "إزالة من المفضلة" : "إضافة للمفضلة"}
                    style={{
                      position: "absolute",
                      bottom: "14px",
                      left: "14px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "17px",
                      color: isBookmarked
                        ? "var(--gold)"
                        : "rgba(255,255,255,0.15)",
                      padding: "4px",
                      lineHeight: 1,
                      zIndex: 10,
                    }}
                    onMouseEnter={(e) => {
                      if (!isBookmarked)
                        (e.currentTarget as HTMLButtonElement).style.color =
                          "rgba(201,168,76,0.5)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isBookmarked)
                        (e.currentTarget as HTMLButtonElement).style.color =
                          "rgba(255,255,255,0.15)";
                    }}
                  >
                    {isBookmarked ? "★" : "☆"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          padding: "24px",
          borderTop: "1px solid var(--border-subtle)",
          color: "var(--text-muted)",
          fontSize: "12px",
        }}
      >
        <div>
          <span className="font-arabic" style={{ fontSize: "16px", color: "rgba(201,168,76,0.4)" }}>
            ❝ وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ ❞
          </span>
          <div style={{ marginTop: "8px", fontSize: "11px", letterSpacing: "3px", color: "rgba(255,255,255,0.15)" }}>
            نور الروح · NOOR AL-ROUH
          </div>
        </div>
      </div>
    </main>
  );
}
