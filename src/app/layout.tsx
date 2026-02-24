import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LayoutDebugClient } from "@/shared/components/tools/layout-debug-client";
import { Toaster } from "@/shared/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "inBeat - UGC Hub",
  description: "inBeat UGC Hub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/sign-in">
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-[775px] flex flex-col`}
        >
          <div className="min-h-0 flex-1 overflow-y-auto">
            <Toaster position="top-center" />
            {children}
          </div>
          <LayoutDebugClient />
        </body>
      </html>
    </ClerkProvider>
  );
}
