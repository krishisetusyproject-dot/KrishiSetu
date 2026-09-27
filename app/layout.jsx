import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "KrishiSetu | Farm-to-Buyer Marketplace",
  description:
    "KrishiSetu connects verified farmers with buyers through transparent market pricing and direct pickup coordination.",
  icons: {
    icon: "/icons/krishisetu_logo.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#064e3b",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Preconnect to Supabase to reduce DNS+TLS overhead on first API call */}
        <link
          rel="preconnect"
          href={process.env.NEXT_PUBLIC_SUPABASE_URL
            ?.replace(/\/rest\/v1\/?$/, "")
            .replace(/\/+$/, "")}
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
