"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { setTheme, resolvedTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Ensure we're rendering on the client
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    // Fallback to 'light' if resolvedTheme is undefined
    const newTheme = resolvedTheme === "light" ? "dark" : "light"
    setTheme(newTheme)
  }

  // Render a placeholder while mounting to avoid hydration mismatch
  if (!mounted) {
    return (
      <>
      <Button 
        variant="outline" 
        size="icon" 
        aria-label="Toggle theme"
        className="cursor-pointer opacity-0" // Make invisible but maintain layout
        >
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      </Button>

        </>
    )
  }

  // Determine which icon to show (with fallback to Sun if resolvedTheme is undefined)
  const Icon = resolvedTheme === "light" ? Moon : Sun

  return (
    <>
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="cursor-pointer transition-all hover:scale-105"
      aria-label={`Toggle theme - currently ${resolvedTheme || 'system'}`}
      title={`Current theme: ${theme || 'system'}`}
    >
      <Icon className="h-[1.2rem] w-[1.2rem] transition-all" />
    </Button>
    
    </>
  )
}