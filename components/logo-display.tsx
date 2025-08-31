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
    <div className={cn("flex items-center justify-center", className)}>
      <img
        src={getLogoSrc() || "/placeholder.svg"}
        alt={`${company.name} logo`}
        className={cn("object-contain", sizeClasses[size])}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
      />
    </div>
  )
}
