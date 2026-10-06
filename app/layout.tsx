import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/providers";
import { SmoothScrollProvider } from "@/animations/smooth-scroll/provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Preloader, PreloaderGate } from "@/components/preloader";

export const metadata: Metadata = {
  title: "Fullstack Hackathon Template",
  description: "A solid foundation for building fullstack web apps fast.",
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
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <SmoothScrollProvider>
            <TooltipProvider>
              <Preloader />
              <PreloaderGate>
                {children}
              </PreloaderGate>
            </TooltipProvider>
            <Toaster />
          </SmoothScrollProvider>
        </Providers>
      </body>
    </html>
  );
}
