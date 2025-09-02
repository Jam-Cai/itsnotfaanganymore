"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface LogoDisplayProps {
  company: {
    name: string
    logo: string
  }
  letter: string
  size?: "sm" | "md" | "lg" | "xl"
  showHover?: boolean
  className?: string
  onClick?: () => void
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-20 h-20 md:w-24 md:h-24",
}

const containerSizeClasses = {
  sm: "w-10 h-10",
  md: "w-14 h-14",
  lg: "w-18 h-18",
  xl: "w-20 h-20 md:w-24 md:h-24",
}

export function LogoDisplay({ company, letter, size = "lg", showHover = true, className, onClick }: LogoDisplayProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  const handleImageError = () => {
    console.log(`🚫 Logo not found for ${company.name} (${company.logo}) - using placeholder`)
    setImageError(true)
    setIsLoading(false)
  }

  const handleImageLoad = () => {
    console.log(`✅ Logo loaded successfully for ${company.name}`)
    setIsLoading(false)
  }

  const getLogoSrc = () => {
    if (imageError) {
      return `/placeholder.svg?height=${size === "xl" ? "96" : size === "lg" ? "64" : size === "md" ? "48" : "32"}&width=${size === "xl" ? "96" : size === "lg" ? "64" : size === "md" ? "48" : "32"}&query=${letter}`
    }

    const logoName = company.logo.replace(".svg", ".png")
    return `/logos/${logoName}`
  }

  return (
    <div 
      className={cn("relative flex items-center justify-center group cursor-pointer", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <img
        src={getLogoSrc() || "/placeholder.svg"}
        alt={`${company.name} logo`}
        className={cn(
          "object-contain transition-all duration-300", 
          sizeClasses[size],
          showHover && "group-hover:scale-110 group-hover:brightness-110"
        )}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
      />
      
      {/* Company name tooltip */}
      {showHover && (
        <div 
          className={cn(
            "absolute -bottom-12 left-1/2 transform -translate-x-1/2 z-10",
            "px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg shadow-lg",
            "transition-all duration-300 whitespace-nowrap",
            "before:content-[''] before:absolute before:-top-1 before:left-1/2 before:transform before:-translate-x-1/2",
            "before:border-l-4 before:border-r-4 before:border-b-4 before:border-transparent before:border-b-gray-900",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
          )}
        >
          {company.name}
        </div>
      )}
    </div>
  )
}
