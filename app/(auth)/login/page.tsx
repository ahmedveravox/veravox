"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0f1e",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
      backgroundImage: "radial-gradient(circle at 50% 0%, rgba(245,158,11,0.06) 0%, transparent 60%)",
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: 22, color: "#0a0f1e",
            }}>V</div>
            <span style={{ fontWeight: 800, fontSize: 22, color: "#f8fafc" }}>Veravox</span>
          </Link>
          <p style={{ color: "rgba(248,250,252,0.5)", fontSize: 15, marginTop: 10 }}>
            سجّل دخولك إلى لوحة التحكم
          </p>
        </div>

        {/* Form Card */}
        <div style={{
          background: "rgba(30,41,59,0.8)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 20, padding: "36px 32px",
          backdropFilter: "blur(10px)",
        }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "rgba(248,250,252,0.7)", marginBottom: 8 }}>
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="example@gmail.com"
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 10,
                  background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.08)",
                  color: "#f8fafc", fontSize: 15, outline: "none",
                  boxSizing: "border-box", fontFamily: "inherit",
                  direction: "ltr", textAlign: "right",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "rgba(248,250,252,0.7)", marginBottom: 8 }}>
                كلمة المرور
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 10,
                  background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.08)",
                  color: "#f8fafc", fontSize: 15, outline: "none",
                  boxSizing: "border-box", fontFamily: "inherit",
                  direction: "ltr", textAlign: "right",
                }}
              />
            </div>

            {error && (
              <div style={{
                padding: "10px 14px", borderRadius: 8,
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
                color: "#f87171", fontSize: 14,
              }}>{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "14px", borderRadius: 10, border: "none",
                background: loading ? "rgba(245,158,11,0.4)" : "linear-gradient(135deg, #f59e0b, #d97706)",
                color: "#0a0f1e", fontWeight: 700, fontSize: 16,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                fontFamily: "inherit",
              }}
            >
              {loading ? "جاري الدخول..." : "دخول"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "rgba(248,250,252,0.45)" }}>
            ليس لديك حساب؟{" "}
            <Link href="/register" style={{ color: "#f59e0b", fontWeight: 600, textDecoration: "none" }}>
              سجّل الآن مجاناً
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
