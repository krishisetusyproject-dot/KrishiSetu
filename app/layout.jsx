import "./globals.css";

export const metadata = {
  title: "KrishiSetu | Farm-to-Buyer Marketplace",
  description:
    "KrishiSetu connects verified farmers with buyers through transparent market pricing and direct pickup coordination.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
