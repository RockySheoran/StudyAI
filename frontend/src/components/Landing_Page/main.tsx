"use client";
import Header from "./header";
import FeaturesSection from "./feature_section";
import Footer from "./footer";
import { ThemeToggle } from "../Common_Components/Theme-toggle";

export default function LandingPage() {
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-end pt-6">
          <ThemeToggle />
        </div>
        <Header />
        <FeaturesSection />
      </div>
      <Footer />
    </div>
  );
}