import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "طيف – AI Workforce OS",
    template: "%s | طيف Tayf",
  },
  description:
    "طيف · Tayf – فريق موظفين ذكاء اصطناعي يشتغل بدل فريقك 24/7. مبيعات، خدمة عملاء، تسويق، تحليل وأكثر. Your complete AI workforce.",
  keywords: ["طيف", "Tayf", "AI workforce", "موظفين ذكاء اصطناعي", "أتمتة أعمال", "AI agents"],
  authors: [{ name: "Tayf" }],
  icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
  manifest: "/manifest.json",
  openGraph: {
    title: "طيف · Tayf – AI Workforce OS",
    description: "فريق موظفين ذكاء اصطناعي يشتغل بدل فريقك",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0f1e",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="طيف" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className="min-h-screen">
        <Providers>{children}</Providers>
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').catch(function() {});
            });
          }
        ` }} />
      </body>
    </html>
  );
}
