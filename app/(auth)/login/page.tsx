"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const LogoSVG = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ll1" x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#fcd34d"/>
        <stop offset="50%" stopColor="#f59e0b"/>
        <stop offset="100%" stopColor="#b45309"/>
      </linearGradient>
      <linearGradient id="ls" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="rgba(255,255,255,0.22)"/>
        <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
      </linearGradient>
      <filter id="lg" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>
    <rect width="52" height="52" rx="15" fill="url(#ll1)" filter="url(#lg)"/>
    <rect width="52" height="52" rx="15" fill="url(#ls)"/>
    <path d="M14 33 C14 33 14 22 19 19 C22 17.5 25 19 26 22 C27 25 27 29 25.5 32 C24 35 21 36 18.5 34.5"
      stroke="#0a0f1e" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
    <path d="M26 22 C27.5 19.5 30 18 32.5 19 C35.5 20.5 37 23 37 26 C37 30 34.5 34 30.5 35.5"
      stroke="#0a0f1e" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
    <circle cx="30.5" cy="37" r="2" fill="#0a0f1e"/>
    <circle cx="18.5" cy="36.5" r="2" fill="#0a0f1e"/>
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="hero-bg" style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, position: "relative", overflow: "hidden",
    }}>
      {/* Ambient orbs */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 65%)",
        }}/>
        <div style={{
          position: "absolute", bottom: "5%", right: "5%",
          width: 350, height: 350, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 65%)",
        }}/>
        <div style={{
          position: "absolute", top: "20%", left: "5%",
          width: 250, height: 250, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 65%)",
        }}/>
      </div>

      <div className="fade-in" style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
        {/* Logo block */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <Link href="/" style={{ textDecoration: "none", display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div className="glow-pulse" style={{ display: "inline-flex" }}>
              <LogoSVG />
            </div>
            <div>
              <div style={{
                fontWeight: 900, fontSize: 28, letterSpacing: "-0.5px",
                background: "linear-gradient(135deg, #f0f4ff 0%, #fcd34d 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>موظفي</div>
              <div style={{ fontSize: 12, color: "rgba(240,244,255,0.35)", marginTop: 2, letterSpacing: "1px", fontWeight: 500 }}>
                AI WORKFORCE OS
              </div>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(12,19,38,0.85)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 24,
          padding: "36px 32px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}>
          {/* Top line shimmer */}
          <div style={{
            position: "absolute", top: 0, left: "20%", right: "20%",
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.4), transparent)",
            borderRadius: "50%",
          }}/>

          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f0f4ff", marginBottom: 6, textAlign: "center" }}>
            مرحباً بعودتك 👋
          </h1>
          <p style={{ fontSize: 14, color: "rgba(240,244,255,0.45)", textAlign: "center", marginBottom: 28 }}>
            سجّل دخولك لإدارة فريقك من الذكاء الاصطناعي
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "rgba(240,244,255,0.6)", marginBottom: 8 }}>
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="input-field focus-gold"
                style={{ direction: "ltr", textAlign: "right" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "rgba(240,244,255,0.6)", marginBottom: 8 }}>
                كلمة المرور
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-field focus-gold"
                  style={{ direction: "ltr", textAlign: "right", paddingLeft: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{
                    position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "rgba(240,244,255,0.3)", fontSize: 16, padding: 0, lineHeight: 1,
                  }}>
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {error && (
              <div className="fade-in-fast" style={{
                padding: "11px 14px", borderRadius: 12,
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
                color: "#f87171", fontSize: 13, textAlign: "center",
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold"
              style={{
                padding: "14px", fontSize: 16,
                marginTop: 4,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <span className="pulse-gold">⏳</span> جاري الدخول...
                </span>
              ) : "تسجيل الدخول →"}
            </button>
          </form>

          <div className="divider" style={{ margin: "24px 0" }}/>

          <p style={{ textAlign: "center", fontSize: 14, color: "rgba(240,244,255,0.4)" }}>
            ليس لديك حساب؟{" "}
            <Link href="/welcome" style={{
              color: "#f59e0b", fontWeight: 700, textDecoration: "none",
            }}>
              جرّب مجاناً 7 أيام ←
            </Link>
          </p>
        </div>

        {/* Features hint */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 20,
          marginTop: 28, flexWrap: "wrap",
        }}>
          {["🤖 10 موظفين AI", "⚡ رد فوري 24/7", "🌍 10 لهجات"].map((f, i) => (
            <div key={i} style={{ fontSize: 12, color: "rgba(240,244,255,0.3)", fontWeight: 500 }}>{f}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
