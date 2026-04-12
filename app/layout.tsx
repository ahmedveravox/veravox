import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

const ibmArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Veravox – AI Workforce OS", template: "%s | Veravox" },
  description: "فريق موظفين ذكاء اصطناعي يشتغل بدل فريقك – مبيعات، خدمة عملاء، تسويق، وأكثر",
  keywords: ["AI", "موظفين ذكاء اصطناعي", "أتمتة أعمال", "chatbot"],
  icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0f1e",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={ibmArabic.variable}>
      <body className={`${ibmArabic.className} min-h-screen`}>{children}</body>
    </html>
  );
}
