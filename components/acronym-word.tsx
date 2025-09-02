"use client"

import { LogoDisplay } from "./logo-display"

interface Company {
  name: string
  logo: string
}

interface AcronymWordProps {
  acronym: { letter: string; company: Company }[]
  word: string
  className?: string
}

export function AcronymWord({ acronym, word, className }: AcronymWordProps) {
  return (
    <div className={className}>
      <div className="text-left mb-8">
        <span className="text-lg font-bold text-foreground">{word.toUpperCase()}</span> - Built with {acronym.length}{" "}
        unique companies
      </div>
      <div className="flex justify-start gap-6 pb-16" style={{ minWidth: 'max-content' }}>
        {acronym.map((item, index) => (
          <LogoDisplay
            key={`${item.letter}-${index}`}
            letter={item.letter}
            company={item.company}
          />
        ))}
      </div>
    </div>
  )
}