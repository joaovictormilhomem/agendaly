import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const CATEGORIES = [
  {
    label: "Unhas",
    emojis: ["💅", "✨", "💎", "🌸", "🌺", "🌷", "🌹", "🦋", "🌈", "💫"],
  },
  {
    label: "Beleza",
    emojis: ["💄", "👄", "💋", "✂️", "🪄", "🧴", "🪮", "🫧", "👑", "🎀"],
  },
  {
    label: "Arte",
    emojis: ["🎨", "🖌️", "🖍️", "🌟", "⭐", "🔮", "🌙", "❤️", "🩷", "🧡"],
  },
  {
    label: "Cuidados",
    emojis: ["🌿", "🍃", "🌱", "🌼", "🌻", "🫶", "🙌", "🤍", "🧼", "💧"],
  },
]

interface Props {
  value: string
  onChange: (emoji: string) => void
}

export function EmojiPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)

  const handleSelect = (emoji: string) => {
    onChange(emoji)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center justify-center w-full h-9 rounded-md border border-input bg-transparent text-2xl bg-white",
            "hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            !value && "text-muted-foreground text-base"
          )}
          aria-label="Escolher emoji"
        >
          {value || "＋"}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-3 space-y-3">
        {CATEGORIES.map((cat) => (
          <div key={cat.label}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              {cat.label}
            </p>
            <div className="grid grid-cols-10 gap-0.5">
              {cat.emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleSelect(emoji)}
                  className={cn(
                    "flex items-center justify-center w-7 h-7 rounded text-lg hover:bg-accent transition-colors",
                    value === emoji && "bg-primary/10 ring-1 ring-primary/30"
                  )}
                  aria-label={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  )
}
