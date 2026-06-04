import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QR Menu",
  description: "Build menus and generate QR codes",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
