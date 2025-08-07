'use client';
import Navbar from "@/components/common-Components/navbar";
import { useState } from "react";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <div className="flex min-h-screen">
      {/* Navbar container - fixed width */}
      <div className={`${isOpen ? 'md:w-64' : 'md:w-20'} transition-all duration-300`}>
        <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />
      </div>
      
      {/* Content container - flex-1 to take remaining space */}
      <div className="flex-1 overflow-auto transition-all duration-300">
        {children}
      </div>
    </div>
  );
}