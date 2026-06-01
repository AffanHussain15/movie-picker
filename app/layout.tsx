import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutShell from "../components/LayoutShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Movie Night Picker - Find a Movie Everyone Will Love",
  description: "Stop wasting 30 minutes deciding what to watch. Let Movie Night Picker find the perfect movie for your group by aggregating preferences and swiping cards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0F0F0F] text-white">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
