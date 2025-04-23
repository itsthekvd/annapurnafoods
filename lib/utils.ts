import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function playSound(soundType: string): void {
  try {
    // Only run on client
    if (typeof window === "undefined") return

    // Create audio element
    const audio = new Audio()

    // Set source based on sound type
    switch (soundType) {
      case "click":
        audio.src = "/sounds/click.mp3"
        break
      case "success":
        audio.src = "/sounds/success.mp3"
        break
      case "error":
        audio.src = "/sounds/error.mp3"
        break
      default:
        audio.src = "/sounds/click.mp3"
    }

    // Play the sound
    audio.volume = 0.5
    audio.play().catch((err) => {
      // Silently fail - this is often due to browser autoplay restrictions
      console.log("Sound couldn't play, likely due to browser autoplay policy")
    })
  } catch (error) {
    // Silently fail if there's any error
    console.log("Error playing sound:", error)
  }
}
