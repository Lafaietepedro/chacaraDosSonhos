'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'

interface CalendarProps {
  onDateSelect?: (date: Date) => void
  selectedDate?: Date
  blockedDates?: Date[]
  bookings?: Array<{
    startDate: Date
    endDate: Date
    status: 'confirmed' | 'pending' | 'blocked'
  }>
}

export function Calendar({ onDateSelect, selectedDate, blockedDates = [], bookings = [] }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Adicionar dias do mês anterior para preencher a primeira semana
  const startDate = new Date(monthStart)
  startDate.setDate(startDate.getDate() - monthStart.getDay())
  const endDate = new Date(monthEnd)
  endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()))
  const allDays = eachDayOfInterval({ start: startDate, end: endDate })

  const isDateBlocked = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Bloquear datas passadas
    if (date < today) return true
    
    // Verificar se está na lista de datas bloqueadas
    return blockedDates.some(blockedDate => isSameDay(date, blockedDate))
  }

  const isDateBooked = (date: Date) => {
    return bookings.some(booking => {
      try {
        // Usar formato de data para comparação sem timezone
        const bookingDateStr = format(new Date(booking.startDate), 'yyyy-MM-dd')
        const inputDateStr = format(date, 'yyyy-MM-dd')
        return bookingDateStr === inputDateStr
      } catch {
        return false
      }
    })
  }

  const getDateStatus = (date: Date) => {
    if (isDateBlocked(date)) return 'blocked'
    if (isDateBooked(date)) return 'booked'
    if (isSameDay(date, new Date())) return 'today'
    if (selectedDate && isSameDay(date, selectedDate)) return 'selected'
    return 'available'
  }

  const getDateClassName = (date: Date) => {
    const status = getDateStatus(date)
    const isCurrentMonth = isSameMonth(date, currentMonth)
    
    const baseClasses = "w-10 h-10 flex items-center justify-center text-sm rounded-full transition-colors cursor-pointer"
    
    if (!isCurrentMonth) {
      return `${baseClasses} text-gray-300 cursor-not-allowed`
    }
    
    switch (status) {
      case 'blocked':
        return `${baseClasses} bg-gray-200 text-gray-400 cursor-not-allowed`
      case 'booked':
        return `${baseClasses} bg-red-100 text-red-600 cursor-not-allowed`
      case 'today':
        return `${baseClasses} bg-primary text-white font-semibold`
      case 'selected':
        return `${baseClasses} bg-primary/20 text-primary border-2 border-primary`
      case 'available':
        return `${baseClasses} hover:bg-gray-100 text-gray-700`
      default:
        return baseClasses
    }
  }

  const handleDateClick = (date: Date) => {
    if (isDateBlocked(date) || isDateBooked(date)) return
    onDateSelect?.(date)
  }

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2" />
            Calendário de Disponibilidade
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={prevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-medium min-w-[120px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {allDays.map((date, index) => (
            <div
              key={index}
              className={getDateClassName(date)}
              onClick={() => handleDateClick(date)}
              onMouseEnter={() => setHoveredDate(date)}
              onMouseLeave={() => setHoveredDate(null)}
            >
              {format(date, 'd')}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-100 rounded-full mr-2"></div>
            <span className="text-gray-600">Disponível</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 rounded-full mr-2"></div>
            <span className="text-gray-600">Reservado</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-200 rounded-full mr-2"></div>
            <span className="text-gray-600">Indisponível</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-primary rounded-full mr-2"></div>
            <span className="text-gray-600">Hoje</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
