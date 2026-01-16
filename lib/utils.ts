import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const KEYWORD_COLORS = [
  '#2563eb', // Blue-600
  '#16a34a', // Green-600
  '#dc2626', // Red-600
  '#9333ea', // Purple-600
  '#ea580c', // Orange-600
  '#0891b2', // Cyan-600
  '#be185d', // Pink-700
  '#4f46e5', // Indigo-600
  '#059669', // Emerald-600
  '#b91c1c', // Red-700
];

export function getColorForKeyword(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % KEYWORD_COLORS.length;
  return KEYWORD_COLORS[index];
}
