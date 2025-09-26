import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: Date): string {
  // Verificar se a data é inválida ou não
  if (!date || isNaN(date.getTime())) {
    return 'Data inválida'
  }
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function formatDateTime(date: Date): string {
  // Verificar se a data é inválida ou não
  if (!date || isNaN(date.getTime())) {
    return 'Data inválida'
  }
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function parseLocalDate(dateString: string): Date {
  // Corrige problema de timezone criando data em meio-dia UTC
  return new Date(dateString + 'T12:00:00.000Z')
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
  return date >= startDate && date <= endDate
}

export function generateBookingId(): string {
  return `CHC-${Date.now().toString(36).toUpperCase()}`
}
