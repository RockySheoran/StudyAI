'use client';

import Navbar from "@/components/Common_Components/Navbar";
import { useState, useEffect } from "react";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isOpen, setIsOpen] = useState(true);

  // Load initial state from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem("isOpen");
    if (savedState !== null) {
      setIsOpen(JSON.parse(savedState));
    }
  }, []);

  // Save to localStorage whenever isOpen changes
  useEffect(() => {
    localStorage.setItem("isOpen", JSON.stringify(isOpen));
  }, [isOpen]);

  
  return (
    <div className="flex min-h-screen">
      {/* Navbar container - fixed width */}
      <div className={`${isOpen ? 'md:w-64' : 'md:w-20'} transition-all duration-300`}>
        <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />
      </div>
      
      {/* Content container - flex-1 to take remaining space */}
      <div className="flex-1 overflow-hidden transition-all duration-300 mt-16 md:mt-0 ">
        {children}
      </div>
    </div>
  );
}