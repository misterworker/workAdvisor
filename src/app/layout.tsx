// src/app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css'; import '@mantine/notifications/styles.css';
import { HeaderSimple } from "./components/HeaderSimple";

const theme = createTheme({
  primaryColor: 'blue',
  colors: {
    dark: [
      '#C1C2C5',
      '#A6A7AB',
      '#909296',
      '#5c5f66',
      '#373A40',
      '#2C2E33',
      '#25262b',
      '#171717',
      '#141517',
      '#101113',
    ],
  },
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WorkAdvisor - AI Career Guidance Platform",
  description: "Your AI-powered career companion for salary negotiations, professional growth, and educational guidance. Get personalized salary insights, negotiation strategies, and market analysis.",
  keywords: "career advice, salary negotiation, AI career guidance, professional development, salary insights, job market analysis",
  authors: [{ name: "WorkAdvisor" }],
  openGraph: {
    title: "WorkAdvisor - AI Career Guidance Platform",
    description: "Your AI-powered career companion for salary negotiations and professional growth",
    type: "website",
    siteName: "WorkAdvisor",
  },
  twitter: {
    card: "summary_large_image",
    title: "WorkAdvisor - AI Career Guidance Platform",
    description: "Your AI-powered career companion for salary negotiations and professional growth",
  },
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          <Notifications position="top-right" />
          <HeaderSimple />

          <div style={{ marginTop: '50px' }}>
            {children}
          </div>
        </MantineProvider>
      </body>
    </html>
  );
}
