"use client"

import React, { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { AcronymWord } from "@/components/acronym-word"
import { AcronymGenerator } from "@/lib/acronym-generator"

interface Company {
  name: string
  logo: string
}

interface AcronymResult {
  letter: string
  company: Company
  isPlaceholder: boolean
}

export default function HomeContent() {
  const searchParams = useSearchParams()
  const [inputWord, setInputWord] = useState("")
  const [generatedAcronym, setGeneratedAcronym] = useState<AcronymResult[]>([])
  const [isSharing, setIsSharing] = useState(false)
  const [shareSuccess, setShareSuccess] = useState(false)
  const [shouldFocus, setShouldFocus] = useState(false)

  const generator = new AcronymGenerator()

  // Initialize word from URL parameter
  useEffect(() => {
    const wordParam = searchParams.get('word')
    if (wordParam) {
      const filteredValue = wordParam.replace(/[^a-zA-Z\s]/g, "").toUpperCase()
      setInputWord(filteredValue)
      setShouldFocus(false)
    } else {
      // No URL parameter, should focus the input
      setShouldFocus(true)
    }
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow letters and spaces, remove any other characters
    const filteredValue = value.replace(/[^a-zA-Z\s]/g, "").toUpperCase()
    setInputWord(filteredValue)
  }

  const handleShare = async () => {
    if (!inputWord.trim()) return
    
    setIsSharing(true)
    setShareSuccess(false)
    
    try {
      const shareUrl = `${window.location.origin}${window.location.pathname}?word=${encodeURIComponent(inputWord.toLowerCase())}`
      
      // Try Web Share API first (mobile)
      if (navigator.share && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        await navigator.share({
          title: `${inputWord.toUpperCase()} - It's not FAANG anymore`,
          text: `Check out this cool tech company acronym for "${inputWord.toUpperCase()}"!`,
          url: shareUrl
        })
        setShareSuccess(true)
      } else {
        // Fallback to clipboard
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(shareUrl)
        } else {
          // Fallback for older browsers
          const textArea = document.createElement('textarea')
          textArea.value = shareUrl
          textArea.style.position = 'fixed'
          textArea.style.left = '-999999px'
          textArea.style.top = '-999999px'
          document.body.appendChild(textArea)
          textArea.focus()
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
        }
        setShareSuccess(true)
        console.log('✅ Shareable URL copied to clipboard:', shareUrl)
      }
    } catch (error) {
      console.error('❌ Share failed:', error)
      setShareSuccess(false)
    } finally {
      setIsSharing(false)
      // Reset success state after 2 seconds
      setTimeout(() => setShareSuccess(false), 2000)
    }
  }

  useEffect(() => {
    if (inputWord.trim()) {
      const result = generator.generateAcronym(inputWord)
      setGeneratedAcronym(result.acronym)
    } else {
      setGeneratedAcronym([])
    }
  }, [inputWord])

  return (
    <div className="h-screen w-full relative overflow-x-auto overflow-y-hidden">
      <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-background via-muted/10 to-primary/5">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-orange-500/10 rounded-full blur-lg animate-pulse delay-1000"></div>
          <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 bg-green-500/10 rounded-full blur-xl animate-pulse delay-700"></div>
        </div>

        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>

      <header className="fixed top-0 left-0 right-0 z-20 w-full p-6 flex justify-between items-center backdrop-blur-sm bg-background/80 border-b border-border/20">
        <div className="text-sm font-medium text-muted-foreground">itsnotfaanganymore.lol</div>
        <div className="text-xs text-muted-foreground/60"></div>
      </header>

      <main className="relative z-10 h-full flex flex-col items-center justify-center pl-16 pr-4 pt-32 pb-32 overflow-x-auto">
        <div className="text-left w-full max-w-none flex flex-col justify-center">
          <div className="mb-8">
            <div className="relative">
              <h1 className="text-4xl md:text-6xl font-black text-foreground mb-12 text-balance leading-tight animate-in fade-in duration-1000">
                It's not <span className="line-through text-muted-foreground opacity-60">FAANG</span> anymore,
                <br />
                it's{" "}
                <Input
                  type="text"
                  placeholder=""
                  value={inputWord}
                  onChange={handleInputChange}
                  autoFocus={shouldFocus}
                  className={`inline-block w-auto min-w-[300px] text-4xl md:text-6xl font-black bg-transparent border-none p-2 h-auto text-primary focus:outline-none placeholder:text-primary/50 transition-all duration-200 ${
                    shouldFocus && !inputWord ? 'ring-2 ring-primary/30 ring-offset-2 rounded-md' : 'focus:ring-0'
                  }`}
                  style={{ width: `${Math.max(inputWord.length || 5, 8)}ch` }}
                />
                .
              </h1>
              
              {generatedAcronym.length > 0 && (
                <div className="absolute -bottom-56 left-0 animate-in slide-in-from-bottom duration-500">
                  <button
                    onClick={handleShare}
                    disabled={isSharing || !inputWord.trim()}
                    className={`
                      relative px-4 py-2 text-xs font-medium rounded-md transition-all duration-200 
                      min-w-[120px] touch-manipulation
                      ${shareSuccess 
                        ? 'bg-green-500 text-white' 
                        : 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95'
                      }
                      ${isSharing ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md'}
                      disabled:opacity-50 disabled:cursor-not-allowed
                      focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2
                    `}
                  >
                    <span className={`transition-opacity duration-200 ${isSharing ? 'opacity-0' : 'opacity-100'}`}>
                      {shareSuccess ? '✅ Copied!' : '📱 Share your acronym'}
                    </span>
                    {isSharing && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                      </span>
                    )}
                  </button>
                  {shareSuccess && (
                    <div className="mt-1 text-xs text-green-600 animate-in fade-in duration-200">
                      Link copied!
                    </div>
                  )}
                </div>
              )}
            </div>

            {generatedAcronym.length > 0 && (
              <div className="mt-16 animate-in slide-in-from-bottom duration-500">
                <AcronymWord
                  acronym={generatedAcronym.map((item) => ({
                    letter: item.letter,
                    company: item.company,
                  }))}
                  word={inputWord}
                />
              </div>
            )}

            {!inputWord && (
              <div className="mt-16 text-sm text-muted-foreground/60 animate-in fade-in duration-1000 delay-500 text-left">
                Type any word to see it spelled with tech company logos
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-20 w-full p-6 border-t border-border/50 bg-background/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span>© 2025 itsnotfaanganymore.lol</span>
            <span className="hidden md:inline">•</span>
            <span>Inspired by the FAANG → MANGO meme</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <a href="https://x.com/jam__cai" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              Twitter
            </a>
            <span>•</span>
            <a href="https://github.com/Jam-Cai" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              GitHub
            </a>
            <span>•</span>
            <a href="https://www.linkedin.com/in/jam-cai/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
