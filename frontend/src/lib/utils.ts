import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes safely with dynamic inputs.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
