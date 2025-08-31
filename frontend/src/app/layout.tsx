import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./Provider/ThemeProvider";
import ClientSessionProvider from "./Provider/ClientSessionProvider";
import { Toaster } from "sonner";
import StoreProvider from "@/components/Common_Components/StoreProvider";
import Image from "next/image";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Personal Tutor - Personalized Learning with AI",
  description: "Advanced AI-powered personal tutor offering interactive quizzes, Q&A sessions, current affairs updates, and interview preparation. Enhance your learning experience with personalized education technology.",
  keywords: ["AI tutor","AI Personal Tutor","StudyAI","personalized learning", "online education", "quiz platform", "interview preparation", "current affairs", "educational technology", "AI learning assistant"],
  authors: [{ name: "StudyAI Team" }],
  creator: "StudyAI",
  publisher: "StudyAI",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",

  // Icons
  icons: {
    icon: "/Logo2.jpg",
    shortcut: "/Logo2.jpg",
    apple: "/Logo2.jpg",
  },
  
  // Additional SEO
  category: "Education",
  classification: "Educational Technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "StudyAI",
              "description": "Advanced AI-powered personal tutor offering interactive quizzes, Q&A sessions, current affairs updates, and interview preparation.",
              "url": "https://study-ai-assist.vercel.app/",
              "logo": "https://study-ai-assist.vercel.app/Logo2.jpg",
              "educationalCredentialAwarded": "Learning Certificates",
              "hasCredential": "AI-Powered Learning Platform"
            })
          }}
        />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="color-scheme" content="light dark" />
        <link rel="canonical" href="https://study-ai-assist.vercel.app/" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientSessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <StoreProvider>{children}</StoreProvider>

            <Toaster />
          </ThemeProvider>
        </ClientSessionProvider>
      </body>
    </html>
  );
}
