import { Compass, Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="py-12 px-4 border-t border-border">
      <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-primary" />
          <span className="font-serif text-lg text-foreground">CareerCoach</span>
        </div>

        <p className="text-sm text-muted-foreground flex items-center gap-1">
          Built with <Heart className="h-3.5 w-3.5 text-destructive" /> for students who dare to dream
        </p>

        <div className="flex gap-6">
          <span className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            About
          </span>
          <span className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            Privacy
          </span>
          <span className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            Contact
          </span>
        </div>
      </div>
    </footer>
  )
}
