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
  title: "StudyAI - AI-Powered Educational Platform | Smart Learning Assistant",
  description: "StudyAI is an advanced AI-powered educational platform offering personalized learning through interactive quizzes, interview preparation, current affairs, and PDF summarization. Transform your learning experience with intelligent tutoring powered by Gemini AI.",
  keywords: [
    "StudyAI", "Study AI", "AI tutor", "AI Personal Tutor", "AI educational platform",
    "personalized learning", "online education", "AI learning assistant", "smart tutor",
    "quiz platform", "interview preparation", "current affairs", "PDF summarization",
    "educational technology", "AI-powered learning", "intelligent tutoring system",
    "Gemini AI education", "adaptive learning", "speech recognition learning",
    "educational AI assistant", "study platform", "learning analytics"
  ],
  authors: [ { name: "StudyAI Team" }],
  publisher: "StudyAI",
  applicationName: "StudyAI",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  viewport: "width=device-width, initial-scale=1",

  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://study-ai-assist.vercel.app/",
    siteName: "StudyAI",
    title: "StudyAI - AI-Powered Educational Platform",
    description: "Transform your learning with StudyAI's intelligent tutoring system. Features AI-powered quizzes, interview prep, current affairs, and personalized learning experiences.",
    images: [
      {
        url: "https://study-ai-assist.vercel.app/Logo2.jpg",
        width: 1200,
        height: 630,
        alt: "StudyAI - AI-Powered Educational Platform",
      },
    ],
  },

  

  // Icons
  icons: {
    icon: [
      { url: "/Logo2.jpg", sizes: "32x32", type: "image/jpeg" },
      { url: "/Logo2.jpg", sizes: "16x16", type: "image/jpeg" },
    ],
    shortcut: "/Logo2.jpg",
    apple: [
      { url: "/Logo2.jpg", sizes: "180x180", type: "image/jpeg" },
    ],
  },
  
  // Additional SEO
  category: "Education",
  classification: "Educational Technology Platform",
  other: {
    "google-site-verification": "your-google-verification-code", // Add your actual verification code
    "msvalidate.01": "your-bing-verification-code", // Add your actual verification code
  },
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
              "@type": "WebApplication",
              "name": "StudyAI",
              "alternateName": ["Study AI", "AI Personal Tutor", "StudyAI Platform"],
              "description": "StudyAI is an advanced AI-powered educational platform offering personalized learning through interactive quizzes, interview preparation, current affairs, and PDF summarization. Transform your learning experience with intelligent tutoring powered by Gemini AI.",
              "url": "https://study-ai-assist.vercel.app/",
              "logo": "https://study-ai-assist.vercel.app/Logo2.jpg",
              "image": "https://study-ai-assist.vercel.app/Logo2.jpg",
              "applicationCategory": "EducationalApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Person",
                "name": "Rocky Sheoran and Sahil Sharma",
                "url": "https://github.com/RockySheoran"
              },
              "publisher": {
                "@type": "Organization",
                "name": "StudyAI",
                "logo": "https://study-ai-assist.vercel.app/Logo2.jpg"
              },
              "dateCreated": "2024",
              "dateModified": "2025",
              "inLanguage": "en-US",
              "isAccessibleForFree": true,
              "keywords": "StudyAI, AI tutor, educational platform, personalized learning, quiz platform, interview preparation, current affairs, PDF summarization, AI learning assistant",
              "featureList": [
                "AI-Powered Quiz Generation",
                "Interview Preparation with Speech Recognition",
                "Current Affairs Updates",
                "PDF Summarization",
                "Personalized Learning Analytics",
                "Voice-Enabled Learning"
              ]
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
