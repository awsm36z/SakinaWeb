import type { Metadata } from "next";
import { Geist, Geist_Mono, Anton, Inter } from "next/font/google";
import Navbar from "./components/navbar/navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const anton = Anton({
  subsets: ["latin"],
  weight: "400", // Anton only comes in a single ultra-bold weight
  variable: "--font-anton",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Sakina Wilderness — Tranquility in nature, together.",
  description:
    "Muslim-led wilderness trips in the Pacific Northwest with reflection, prayer, and community.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${anton.variable} ${inter.variable} antialiased bg-white text-gray-900 w-full min-h-screen`}
      >
        <Navbar />
        <main className="pt-20 w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
