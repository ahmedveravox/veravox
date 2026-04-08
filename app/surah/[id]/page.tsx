"use client";
import { useState, useEffect, useRef, use } from "react";
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

// تفسير السعدي: { [surahNum]: { [ayahNum]: "نص التفسير" } }
type TafsirData = Record<string, Record<string, string>>;

const ARABIC_NUMBERS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
function toArabicNum(n: number): string {
  return String(n)
    .split("")
    .map((d) => ARABIC_NUMBERS[parseInt(d)] ?? d)
    .join("");
}

export default function SurahPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [surah, setSurah] = useState<SurahData | null>(null);
  const [translations, setTranslations] = useState<TranslationAyah[]>([]);
  const [tafsir, setTafsir] = useState<TafsirData | null>(null);
  const [tafsirAvailable, setTafsirAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showTafsir, setShowTafsir] = useState(false);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [audioLoading, setAudioLoading] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("quran-bookmarks");
    if (saved) {
      const bm: number[] = JSON.parse(saved);
      setBookmarked(bm.includes(Number(id)));
    }

    setLoading(true);
    Promise.all([
      fetch(`https://api.alquran.cloud/v1/surah/${id}`).then((r) => r.json()),
      fetch(`https://api.alquran.cloud/v1/surah/${id}/en.sahih`).then((r) =>
        r.json()
      ),
    ])
      .then(([arabicData, engData]) => {
        setSurah(arabicData.data);
        setTranslations(engData.data?.ayahs ?? []);
        setLoading(false);
        document.title = `${arabicData.data.name} | نور الروح`;
      })
      .catch(() => setLoading(false));

    // تحميل التفسير من الملف المحلي
    fetch("/data/tafsir-saadi.json")
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data: TafsirData) => {
        setTafsir(data);
        setTafsirAvailable(true);
      })
      .catch(() => {
        setTafsirAvailable(false);
      });

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [id]);

  const playAudio = (ayahNum: number) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (playingAyah === ayahNum) {
      setPlayingAyah(null);
      return;
    }

    const surahPad = String(id).padStart(3, "0");
    const ayahPad = String(ayahNum).padStart(3, "0");
    const url = `https://everyayah.com/data/Alafasy_128kbps/${surahPad}${ayahPad}.mp3`;

    setAudioLoading(ayahNum);
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.addEventListener("canplay", () => {
      setAudioLoading(null);
      setPlayingAyah(ayahNum);
      audio.play();
    });

    audio.addEventListener("ended", () => {
      setPlayingAyah(null);
      setAudioLoading(null);
    });

    audio.addEventListener("error", () => {
      setAudioLoading(null);
      setPlayingAyah(null);
    });

    audio.load();
  };

  const toggleBookmark = () => {
    const saved = localStorage.getItem("quran-bookmarks");
    const bm: number[] = saved ? JSON.parse(saved) : [];
    const num = Number(id);
    const updated = bm.includes(num)
      ? bm.filter((b) => b !== num)
      : [...bm, num];
    localStorage.setItem("quran-bookmarks", JSON.stringify(updated));
    setBookmarked(!bookmarked);
  };

  if (loading) {
    return (
      <div
        style={{
          background: "var(--bg-primary)",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
          gap: "16px",
        }}
      >
        <div
          className="font-arabic"
          style={{ fontSize: "36px", color: "rgba(201,168,76,0.4)" }}
        >
          ﷽
        </div>
        <div style={{ fontSize: "16px" }}>جاري تحميل السورة...</div>
      </div>
    );
  }

  if (!surah) {
    return (
      <div
        style={{
          background: "var(--bg-primary)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div style={{ fontSize: "32px" }}>⚠️</div>
        <div>حدث خطأ في تحميل السورة</div>
        <Link href="/" style={{ color: "var(--gold)", textDecoration: "none" }}>
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  const isMeccan = surah.revelationType === "Meccan";

  return (
    <main
      className="geo-pattern"
      style={{
        background: "var(--bg-primary)",
        minHeight: "100vh",
        direction: "rtl",
      }}
    >
      {/* Sticky Header */}
      <header
        style={{
          background: "rgba(13,24,41,0.97)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border-gold)",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Back */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <button
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px",
              padding: "8px 16px",
              color: "rgba(255,255,255,0.7)",
              cursor: "pointer",
              fontSize: "14px",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.borderColor =
                "rgba(201,168,76,0.4)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.borderColor =
                "rgba(255,255,255,0.1)")
            }
          >
            ← رئيسية
          </button>
        </Link>

        {/* Navigation arrows */}
        <div style={{ display: "flex", gap: "6px" }}>
          {surah.number > 1 && (
            <Link
              href={`/surah/${surah.number - 1}`}
              style={{ textDecoration: "none" }}
            >
              <button
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  color: "rgba(255,255,255,0.5)",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
                title="السورة السابقة"
              >
                ‹
              </button>
            </Link>
          )}
          {surah.number < 114 && (
            <Link
              href={`/surah/${surah.number + 1}`}
              style={{ textDecoration: "none" }}
            >
              <button
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  color: "rgba(255,255,255,0.5)",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
                title="السورة التالية"
              >
                ›
              </button>
            </Link>
          )}
        </div>

        {/* Surah title */}
        <div style={{ flex: 1, textAlign: "center" }}>
          <span
            className="font-arabic"
            style={{ fontSize: "22px", fontWeight: "bold", color: "white" }}
          >
            {surah.name}
          </span>
          <span
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
              marginRight: "10px",
            }}
          >
            {toArabicNum(surah.numberOfAyahs)} آية ·{" "}
            {isMeccan ? "مكية" : "مدنية"}
          </span>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          {/* زر تفسير السعدي */}
          {tafsirAvailable ? (
            <button
              onClick={() => setShowTafsir(!showTafsir)}
              style={{
                background: showTafsir
                  ? "rgba(201,168,76,0.15)"
                  : "rgba(255,255,255,0.04)",
                border: `1px solid ${showTafsir ? "rgba(201,168,76,0.5)" : "rgba(255,255,255,0.1)"}`,
                borderRadius: "8px",
                padding: "7px 12px",
                color: showTafsir ? "var(--gold)" : "rgba(255,255,255,0.5)",
                cursor: "pointer",
                fontSize: "12px",
                fontFamily: "inherit",
              }}
              title="تفسير السعدي"
            >
              تفسير
            </button>
          ) : (
            <span
              style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.2)",
                padding: "7px 10px",
                border: "1px dashed rgba(255,255,255,0.1)",
                borderRadius: "8px",
                cursor: "default",
              }}
              title="شغّل: node scripts/download-tafsir.mjs"
            >
              تفسير ✗
            </span>
          )}

          <button
            onClick={() => setShowTranslation(!showTranslation)}
            style={{
              background: showTranslation
                ? "rgba(0,212,255,0.12)"
                : "rgba(255,255,255,0.04)",
              border: `1px solid ${showTranslation ? "rgba(0,212,255,0.4)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: "8px",
              padding: "7px 14px",
              color: showTranslation ? "var(--cyan)" : "rgba(255,255,255,0.5)",
              cursor: "pointer",
              fontSize: "12px",
              fontFamily: "inherit",
              letterSpacing: "1px",
            }}
          >
            EN
          </button>

          <button
            onClick={toggleBookmark}
            title={bookmarked ? "إزالة من المفضلة" : "إضافة للمفضلة"}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "22px",
              color: bookmarked ? "var(--gold)" : "rgba(255,255,255,0.25)",
              padding: "4px 8px",
            }}
          >
            {bookmarked ? "★" : "☆"}
          </button>
        </div>
      </header>

      {/* Surah hero */}
      <div
        style={{
          background:
            "linear-gradient(180deg, rgba(13,24,41,0.8) 0%, transparent 100%)",
          padding: "32px 24px",
          textAlign: "center",
          borderBottom: "1px solid rgba(201,168,76,0.08)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid var(--border-gold)",
            borderRadius: "14px",
            padding: "12px 24px",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              color: "var(--text-muted)",
              direction: "ltr",
            }}
          >
            {surah.englishNameTranslation}
          </div>
          <div
            style={{
              width: "1px",
              height: "20px",
              background: "var(--border-gold)",
            }}
          />
          <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            سورة رقم {toArabicNum(surah.number)}
          </div>
          <div
            style={{
              width: "1px",
              height: "20px",
              background: "var(--border-gold)",
            }}
          />
          <div
            style={{
              fontSize: "12px",
              padding: "3px 10px",
              borderRadius: "20px",
              background: isMeccan
                ? "rgba(0,212,255,0.08)"
                : "rgba(139,92,246,0.08)",
              color: isMeccan ? "var(--cyan)" : "var(--purple)",
              border: `1px solid ${isMeccan ? "rgba(0,212,255,0.25)" : "rgba(139,92,246,0.25)"}`,
            }}
          >
            {isMeccan ? "مكية" : "مدنية"}
          </div>
        </div>
      </div>

      {/* Bismillah — not for Al-Fatiha (already has it) or At-Tawbah */}
      {surah.number !== 1 && surah.number !== 9 && (
        <div
          style={{
            textAlign: "center",
            padding: "28px 24px",
            borderBottom: "1px solid rgba(201,168,76,0.06)",
          }}
        >
          <div
            className="font-arabic"
            style={{
              fontSize: "30px",
              color: "rgba(201,168,76,0.85)",
              lineHeight: "2",
              letterSpacing: "2px",
            }}
          >
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>
        </div>
      )}

      {/* Ayahs */}
      <div
        style={{ maxWidth: "800px", margin: "0 auto", padding: "16px 16px" }}
      >
        {surah.ayahs.map((ayah, idx) => {
          const isPlaying = playingAyah === ayah.numberInSurah;
          const isLoading = audioLoading === ayah.numberInSurah;
          const translation = translations[idx];
          const tafsirText = tafsir?.[id]?.[String(ayah.numberInSurah)];

          return (
            <div
              key={ayah.number}
              style={{
                background: isPlaying
                  ? "rgba(201,168,76,0.04)"
                  : "rgba(255,255,255,0.02)",
                border: `1px solid ${isPlaying ? "rgba(201,168,76,0.3)" : "rgba(201,168,76,0.07)"}`,
                borderRadius: "14px",
                padding: "24px 24px 20px",
                marginBottom: "10px",
                transition: "all 0.2s ease",
              }}
            >
              {/* Ayah header row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                }}
              >
                {/* Ayah number */}
                <div
                  style={{
                    minWidth: "40px",
                    height: "40px",
                    background:
                      "linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.04))",
                    border: "1px solid rgba(201,168,76,0.4)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    color: "var(--gold)",
                    fontWeight: "bold",
                    flexShrink: 0,
                  }}
                >
                  {toArabicNum(ayah.numberInSurah)}
                </div>

                {/* Juz / page info */}
                <div
                  style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.2)",
                    display: "flex",
                    gap: "12px",
                  }}
                >
                  {ayah.juz > 0 && <span>جزء {toArabicNum(ayah.juz)}</span>}
                  {ayah.page > 0 && (
                    <span>صفحة {toArabicNum(ayah.page)}</span>
                  )}
                  {ayah.sajda && (
                    <span
                      style={{
                        color: "rgba(201,168,76,0.5)",
                        fontSize: "12px",
                      }}
                    >
                      ۩ سجدة
                    </span>
                  )}
                </div>

                {/* Play button */}
                <button
                  onClick={() => playAudio(ayah.numberInSurah)}
                  style={{
                    background: isPlaying
                      ? "rgba(201,168,76,0.18)"
                      : "rgba(255,255,255,0.05)",
                    border: `1px solid ${isPlaying ? "rgba(201,168,76,0.5)" : "rgba(255,255,255,0.1)"}`,
                    borderRadius: "10px",
                    padding: "8px 16px",
                    color: isPlaying ? "var(--gold)" : "rgba(255,255,255,0.45)",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isPlaying) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        "rgba(201,168,76,0.35)";
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "rgba(255,255,255,0.7)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isPlaying) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        "rgba(255,255,255,0.1)";
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "rgba(255,255,255,0.45)";
                    }
                  }}
                >
                  {isLoading ? (
                    <>
                      <span
                        style={{
                          display: "inline-block",
                          width: "10px",
                          height: "10px",
                          border: "2px solid rgba(201,168,76,0.3)",
                          borderTopColor: "var(--gold)",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                      تحميل
                    </>
                  ) : isPlaying ? (
                    <>⏸ إيقاف</>
                  ) : (
                    <>▶ استمع</>
                  )}
                </button>
              </div>

              {/* Arabic text */}
              <div
                className="font-arabic"
                style={{
                  fontSize: "30px",
                  lineHeight: "2.3",
                  color: "rgba(255,255,255,0.95)",
                  textAlign: "right",
                  marginBottom: (showTafsir && tafsirText) || (showTranslation && translation) ? "18px" : "0",
                  letterSpacing: "0.5px",
                }}
              >
                {ayah.text}
              </div>

              {/* تفسير السعدي */}
              {showTafsir && tafsirText && (
                <div
                  style={{
                    borderTop: "1px solid rgba(201,168,76,0.12)",
                    paddingTop: "16px",
                    marginBottom: showTranslation && translation ? "16px" : "0",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      color: "rgba(201,168,76,0.5)",
                      letterSpacing: "2px",
                      marginBottom: "10px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ color: "var(--gold)", fontSize: "14px" }}>📖</span>
                    تفسير السعدي
                  </div>
                  <div
                    className="font-arabic"
                    style={{
                      fontSize: "17px",
                      color: "rgba(255,255,255,0.7)",
                      lineHeight: "2",
                      textAlign: "right",
                      background: "rgba(201,168,76,0.03)",
                      border: "1px solid rgba(201,168,76,0.08)",
                      borderRadius: "10px",
                      padding: "14px 16px",
                    }}
                  >
                    {tafsirText}
                  </div>
                </div>
              )}

              {/* English translation */}
              {showTranslation && translation && (
                <div
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    paddingTop: "16px",
                    fontSize: "15px",
                    color: "rgba(255,255,255,0.55)",
                    lineHeight: "1.8",
                    direction: "ltr",
                    textAlign: "left",
                    fontStyle: "italic",
                  }}
                >
                  {translation.text}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom navigation */}
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "8px 16px 48px",
          display: "flex",
          gap: "12px",
          justifyContent:
            surah.number > 1 && surah.number < 114
              ? "space-between"
              : surah.number === 1
                ? "flex-end"
                : "flex-start",
        }}
      >
        {surah.number > 1 && (
          <Link
            href={`/surah/${surah.number - 1}`}
            style={{ textDecoration: "none" }}
          >
            <button
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(201,168,76,0.2)",
                borderRadius: "12px",
                padding: "12px 24px",
                color: "rgba(255,255,255,0.65)",
                cursor: "pointer",
                fontSize: "14px",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.borderColor =
                  "rgba(201,168,76,0.45)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.borderColor =
                  "rgba(201,168,76,0.2)")
              }
            >
              ← السورة السابقة
            </button>
          </Link>
        )}
        {surah.number < 114 && (
          <Link
            href={`/surah/${surah.number + 1}`}
            style={{ textDecoration: "none" }}
          >
            <button
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(201,168,76,0.2)",
                borderRadius: "12px",
                padding: "12px 24px",
                color: "rgba(255,255,255,0.65)",
                cursor: "pointer",
                fontSize: "14px",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.borderColor =
                  "rgba(201,168,76,0.45)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.borderColor =
                  "rgba(201,168,76,0.2)")
              }
            >
              السورة التالية →
            </button>
          </Link>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
