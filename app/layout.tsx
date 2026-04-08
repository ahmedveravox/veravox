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
  title: {
    default: "نور الروح – القرآن الكريم",
    template: "%s | نور الروح",
  },
  description: "تطبيق نور الروح للقرآن الكريم – اقرأ واستمع وتدبّر",
  manifest: "/manifest.json",
  themeColor: "#0A0F1E",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "نور الروح",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "نور الروح – القرآن الكريم",
    description: "اقرأ القرآن الكريم واستمع للتلاوة مع الترجمة",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${amiri.variable} h-full`}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="نور الروح" />
        <meta name="theme-color" content="#0A0F1E" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
