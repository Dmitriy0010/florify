import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const UNITS_MAP: Record<string, string> = {
  PIECE: 'шт',
  BUNCH: 'букет',
  GRAM: 'г',
  SET: 'набор'
}
