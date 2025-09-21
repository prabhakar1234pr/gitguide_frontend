import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import DynamicClerkProvider from "../components/DynamicClerkProvider";
import ClientLayout from "../components/ClientLayout";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GitGuide - Transform GitHub repos into learning journeys",
  description: "Master new technologies with guided, interactive tutorials from any GitHub repository",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DynamicClerkProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </DynamicClerkProvider>
      </body>
    </html>
  );
}
