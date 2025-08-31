import companiesData from "@/data/companies.json"

interface Company {
  name: string
  logo: string
}

interface CompaniesData {
  [key: string]: Company[]
}

interface AcronymResult {
  letter: string
  company: Company
  isPlaceholder: boolean
}

interface GenerationStats {
  totalLetters: number
  uniqueCompanies: number
  placeholders: number
  duplicateLetters: string[]
}

export class AcronymGenerator {
  private companies: CompaniesData
  private usedCompanies: Set<string>
  private letterCounts: Map<string, number>
  private seed: number = 0

  constructor() {
    this.companies = companiesData as CompaniesData
    this.usedCompanies = new Set()
    this.letterCounts = new Map()
  }

  // Simple seeded random number generator
  private seededRandom(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280
    return this.seed / 233280
  }

  // Create a seed from a string
  private createSeed(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  generateAcronym(word: string): {
    acronym: AcronymResult[]
    stats: GenerationStats
    canRegenerate: boolean
  } {
    const upperWord = word.toUpperCase().trim()
    this.reset()
    
    // Initialize seed based on the word for deterministic results
    this.seed = this.createSeed(upperWord)

    // Count letter frequencies to prioritize rare letters
    this.analyzeLetterFrequency(upperWord)

    // Sort letters by rarity (letters that appear less frequently get priority)
    const letterPriority = this.createLetterPriority(upperWord)

    const acronym: AcronymResult[] = []
    const duplicateLetters: string[] = []

    // First pass: assign companies to letters in priority order
    for (const { letter, indices } of letterPriority) {
      const availableCompanies = this.getAvailableCompanies(letter)

      if (availableCompanies.length >= indices.length) {
        // We have enough companies for all instances of this letter
        const selectedCompanies = this.selectCompaniesForLetter(availableCompanies, indices.length)

        indices.forEach((index, i) => {
          acronym[index] = {
            letter,
            company: selectedCompanies[i],
            isPlaceholder: false,
          }
          this.usedCompanies.add(selectedCompanies[i].name)
        })
      } else {
        // Not enough unique companies, some will be placeholders
        const selectedCompanies = this.selectCompaniesForLetter(availableCompanies, availableCompanies.length)

        indices.forEach((index, i) => {
          if (i < selectedCompanies.length) {
            acronym[index] = {
              letter,
              company: selectedCompanies[i],
              isPlaceholder: false,
            }
            this.usedCompanies.add(selectedCompanies[i].name)
          } else {
            acronym[index] = {
              letter,
              company: this.createPlaceholder(letter),
              isPlaceholder: true,
            }
            if (!duplicateLetters.includes(letter)) {
              duplicateLetters.push(letter)
            }
          }
        })
      }
    }

    const stats: GenerationStats = {
      totalLetters: upperWord.length,
      uniqueCompanies: this.usedCompanies.size,
      placeholders: acronym.filter((item) => item.isPlaceholder).length,
      duplicateLetters,
    }

    const canRegenerate = this.canRegenerateWithDifferentResults(upperWord)

    return { acronym, stats, canRegenerate }
  }

  private selectCompaniesForLetter(companies: Company[], count: number): Company[] {
    if (count >= companies.length) {
      return [...companies]
    }

    // Weighted selection favoring well-known companies
    const weights = companies.map((company) => this.getCompanyWeight(company))
    const selected: Company[] = []
    const availableIndices = companies.map((_, i) => i)

    for (let i = 0; i < count; i++) {
      const selectedIndex = this.weightedRandomSelection(availableIndices, weights)
      selected.push(companies[selectedIndex])

      // Remove selected company from available options
      const indexInAvailable = availableIndices.indexOf(selectedIndex)
      availableIndices.splice(indexInAvailable, 1)
      weights.splice(indexInAvailable, 1)
    }

    return selected
  }

  private getCompanyWeight(company: Company): number {
    // Higher weight for more recognizable companies
    const popularCompanies = [
      "Apple",
      "Google",
      "Microsoft",
      "Meta",
      "Amazon",
      "Netflix",
      "Tesla",
      "OpenAI",
      "Nvidia",
      "Adobe",
      "Spotify",
      "Discord",
      "GitHub",
      "LinkedIn",
    ]

    if (popularCompanies.includes(company.name)) {
      return 3
    }

    // Medium weight for other well-known companies
    const knownCompanies = ["Instagram", "WhatsApp", "YouTube", "TikTok", "Uber", "PayPal", "Reddit"]

    if (knownCompanies.includes(company.name)) {
      return 2
    }

    return 1 // Default weight
  }

  private weightedRandomSelection(indices: number[], weights: number[]): number {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
    let random = this.seededRandom() * totalWeight

    for (let i = 0; i < indices.length; i++) {
      random -= weights[i]
      if (random <= 0) {
        return indices[i]
      }
    }

    return indices[indices.length - 1] // Fallback
  }

  private analyzeLetterFrequency(word: string): void {
    this.letterCounts.clear()
    for (const letter of word) {
      this.letterCounts.set(letter, (this.letterCounts.get(letter) || 0) + 1)
    }
  }

  private createLetterPriority(word: string): { letter: string; indices: number[] }[] {
    const letterIndices = new Map<string, number[]>()

    // Group indices by letter
    for (let i = 0; i < word.length; i++) {
      const letter = word[i]
      if (!letterIndices.has(letter)) {
        letterIndices.set(letter, [])
      }
      letterIndices.get(letter)!.push(i)
    }

    // Sort by frequency (ascending) and available companies (descending)
    return Array.from(letterIndices.entries())
      .map(([letter, indices]) => ({ letter, indices }))
      .sort((a, b) => {
        const aFreq = this.letterCounts.get(a.letter) || 0
        const bFreq = this.letterCounts.get(b.letter) || 0
        const aCompanies = this.companies[a.letter]?.length || 0
        const bCompanies = this.companies[b.letter]?.length || 0

        // Prioritize letters with fewer occurrences but more available companies
        if (aFreq !== bFreq) {
          return aFreq - bFreq
        }
        return bCompanies - aCompanies
      })
  }

  private getAvailableCompanies(letter: string): Company[] {
    if (!this.companies[letter]) {
      return []
    }

    return this.companies[letter].filter((company) => !this.usedCompanies.has(company.name))
  }

  private createPlaceholder(letter: string): Company {
    return {
      name: `${letter}-Company`,
      logo: "placeholder.svg",
    }
  }

  private canRegenerateWithDifferentResults(word: string): boolean {
    // Check if there are enough alternative companies to generate different results
    let totalAlternatives = 0
    const letterCounts = new Map<string, number>()

    for (const letter of word) {
      letterCounts.set(letter, (letterCounts.get(letter) || 0) + 1)
    }

    for (const [letter, count] of letterCounts) {
      const availableCompanies = this.companies[letter]?.length || 0
      if (availableCompanies > count) {
        totalAlternatives += availableCompanies - count
      }
    }

    return totalAlternatives > 0
  }

  private reset(): void {
    this.usedCompanies.clear()
    this.letterCounts.clear()
  }

  regenerateWithAlternatives(word: string, currentAcronym: AcronymResult[]): AcronymResult[] | null {
    const upperWord = word.toUpperCase().trim()
    this.reset()

    // Mark current companies as used to force different selection
    const currentCompanies = new Set(
      currentAcronym.filter((item) => !item.isPlaceholder).map((item) => item.company.name),
    )

    // Try to generate with different companies using different seeds
    let attempts = 0
    const maxAttempts = 10

    while (attempts < maxAttempts) {
      // Use a different seed for each attempt to get variation
      this.seed = this.createSeed(upperWord + attempts.toString())
      
      const result = this.generateAcronym(word)
      const newCompanies = new Set(
        result.acronym.filter((item) => !item.isPlaceholder).map((item) => item.company.name),
      )

      // Check if we got different companies
      const hasNewCompanies = Array.from(newCompanies).some((name) => !currentCompanies.has(name))

      if (hasNewCompanies) {
        return result.acronym
      }

      attempts++
    }

    return null // Could not generate different result
  }
}
