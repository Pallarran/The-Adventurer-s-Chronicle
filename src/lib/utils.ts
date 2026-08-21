import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a session's "date played" as a fixed calendar date.
 *
 * `realDatePlayed` is stored as UTC midnight of the intended calendar date, so
 * we format in UTC to always show the day the user picked — regardless of
 * whether this runs on the server or in the browser, or the viewer's timezone.
 */
export function formatSessionDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
}
