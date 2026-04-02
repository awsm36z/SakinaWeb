import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Anton,
  Inter,
  Noto_Serif,
  Plus_Jakarta_Sans,
} from "next/font/google";
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

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-noto-serif",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
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
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${anton.variable} ${inter.variable} ${notoSerif.variable} ${plusJakartaSans.variable} app-shell min-h-screen w-full antialiased text-gray-900`}
      >
        <Navbar />
        <main className="w-full pt-20">
          {children}
        </main>
      </body>
    </html>
  );
}
