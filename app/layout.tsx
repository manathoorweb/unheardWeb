import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "unHeard - Professional Therapy & Counseling",
  description: "Experience professional therapy and counseling services with unHeard.",
};

import { BookingProvider } from "@/components/BookingContext";
import { Footer } from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${nunito.variable} antialiased min-h-screen bg-[#111111] text-white`}
      >
        <BookingProvider>
          <Navbar />
          {children}
          <Footer />
        </BookingProvider>
      </body>
    </html>
  );
}
