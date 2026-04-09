import type { Metadata } from "next";
import { Amiri } from "next/font/google";
import "./globals.css";

const amiri = Amiri({
  weight: ["400", "700"],
  subsets: ["arabic", "latin"],
  variable: "--font-amiri",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "نور الروح – القرآن الكريم", template: "%s | نور الروح" },
  description: "تطبيق نور الروح للقرآن الكريم – اقرأ وتدبّر",
  manifest: "/manifest.json",
  themeColor: "#1A3D2B",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "نور الروح" },
  icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={`${amiri.variable} h-full`}>
      <head>
        {/* تطبيق الثيم فوراً قبل الرسم لتجنب الوميض */}
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('quran-theme')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){}` }} />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="نور الروح" />
        <meta name="theme-color" content="#1A3D2B" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
