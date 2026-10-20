import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EcoBank",
  description: "Waste Management Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
