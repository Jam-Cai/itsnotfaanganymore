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
      <div className="flex justify-start gap-6 min-w-max">
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