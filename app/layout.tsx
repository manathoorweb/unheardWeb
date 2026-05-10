import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { BookingProvider } from "@/components/BookingContext";
import { Footer } from "@/components/Footer";
import { NotificationProvider } from "@/components/NotificationContext";
import { PushInitializer } from "@/components/PushInitializer";
import { PhonePeProvider } from "@/components/PhonePeProvider";

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
  title: "unHeard - Clarity For Your Inner World",
  description: "Professional psychological counseling that listens, understands context, and responds with clarity. Begin with understanding at unHeard.",
  manifest: '/manifest.json',
  icons: {
    icon: '/assets/logo unherd white.svg',
    apple: '/assets/logo unherd white.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'unHeard',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${nunito.variable} antialiased min-h-screen bg-[#111111] text-white overflow-x-clip`}
      >
        <BookingProvider>
          <NotificationProvider>
            <PhonePeProvider />
            <PushInitializer />
            <Navbar />
            {children}
            <Footer />
          </NotificationProvider>
        </BookingProvider>
      </body>
    </html>
  );
}
