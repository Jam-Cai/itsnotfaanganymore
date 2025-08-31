import { Suspense } from "react"
import HomeContent from "@/components/home-content"

export default function Home() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}