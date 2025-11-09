import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export const maskCard = (numberLike: string | number): string => {
  const digits = String(numberLike).replace(/\D/g, '')

  // Only apply this mask to 16-digit numbers
  if (digits.length !== 16) return String(numberLike)

  const first4 = digits.slice(0, 4)
  const last3 = digits.slice(-3)
  return `${first4} **** **** *${last3}`
}

// Status class helper
export const statusClasses = (status: string) => {
  return cn('px-2 py-1 rounded-2xl text-white text-sm capitalize', {
    'bg-green-200 text-green-600': status === 'delivered',
    'bg-blue-200 text-blue-600': status === 'shipped',
    'bg-yellow-200 text-yellow-600': status === 'pending',
  })
}

export const formatDate = (date: string | Date) => {
  const d = new Date(date)
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`
}

/**
 * Capitalizes the first letter of a string
 * @param str - The string to capitalize
 * @returns The string with the first letter capitalized
 */
export const capitalizeFirstLetter = (str: string): string => {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}
