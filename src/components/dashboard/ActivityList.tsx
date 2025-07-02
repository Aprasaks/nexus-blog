// src/components/dashboard/ActivityList.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  START_DATE,
  MONTH_NAMES,
  WEEK_DAYS,
  ANIMATION_CONFIG,
} from '@/lib/config/constants'

// ==================== 타입 정의 ====================
interface CalendarDate {
  year: number
  month: number
  today: number
  firstDay: number
  lastDate: number
}

// ==================== 유틸리티 함수 ====================
const calculateDaysDiff = (startDate: Date, endDate: Date): number => {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

const getCalendarData = (currentDate: Date): CalendarDate => ({
  year: currentDate.getFullYear(),
  month: currentDate.getMonth(),
  today: new Date().getDate(),
  firstDay: new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay(),
  lastDate: new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate(),
})

// ==================== 커스텀 훅 ====================
const useDayCounter = () => {
  const [days, setDays] = useState(0)

  useEffect(() => {
    const totalDays = calculateDaysDiff(START_DATE, new Date())
    const increment = totalDays / ANIMATION_CONFIG.counterDuration

    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= totalDays) {
        setDays(totalDays)
        clearInterval(timer)
      } else {
        setDays(Math.floor(current))
      }
    }, ANIMATION_CONFIG.counterInterval)

    return () => clearInterval(timer)
  }, [])

  return days
}

// ==================== 컴포넌트 ====================
function SectionHeader() {
  return (
    <div className='flex items-center space-x-2'>
      <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse' />
      <h2 className='text-lg font-light text-blue-300 tracking-wider'>
        ACTIVITY
      </h2>
    </div>
  )
}

function DayCounter() {
  const days = useDayCounter()

  return (
    <div className='bg-gray-900/50 backdrop-blur-lg border border-blue-500/20 rounded-lg p-4 text-center'>
      <div className='flex items-center justify-center space-x-2 mb-2'>
        <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse' />
        <span className='text-xs text-gray-400 uppercase tracking-wider'>
          EDITH 학습한지
        </span>
      </div>
      <div className='text-3xl font-bold text-green-400 font-mono'>
        D+{days}
      </div>
    </div>
  )
}

function CalendarNavigation({
  year,
  month,
  onPrevMonth,
  onNextMonth,
}: {
  year: number
  month: number
  onPrevMonth: () => void
  onNextMonth: () => void
}) {
  return (
    <div className='flex items-center justify-between mb-3'>
      <h3 className='text-sm font-medium text-blue-300'>
        {year}년 {MONTH_NAMES[month]}
      </h3>
      <div className='flex space-x-1'>
        <button
          onClick={onPrevMonth}
          className='w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white transition-colors'
        >
          ←
        </button>
        <button
          onClick={onNextMonth}
          className='w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white transition-colors'
        >
          →
        </button>
      </div>
    </div>
  )
}

function CalendarGrid({ calendarData }: { calendarData: CalendarDate }) {
  const { firstDay, lastDate, today } = calendarData

  const renderDays = () => {
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className='w-8 h-8' />)
    }

    for (let date = 1; date <= lastDate; date++) {
      const isToday = date === today
      days.push(
        <div
          key={date}
          className={`w-8 h-8 flex items-center justify-center text-xs rounded transition-all cursor-pointer ${isToday ? 'bg-blue-500 text-white font-bold' : 'text-gray-500 hover:text-gray-300'}`}
        >
          {date}
        </div>
      )
    }

    return days
  }

  return (
    <>
      <div className='grid grid-cols-7 gap-1 mb-2'>
        {WEEK_DAYS.map(day => (
          <div
            key={day}
            className='text-xs text-gray-400 text-center font-medium'
          >
            {day}
          </div>
        ))}
      </div>
      <div className='grid grid-cols-7 gap-1'>{renderDays()}</div>
    </>
  )
}

function MiniCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const calendarData = getCalendarData(currentDate)

  const handlePrevMonth = () =>
    setCurrentDate(new Date(calendarData.year, calendarData.month - 1))
  const handleNextMonth = () =>
    setCurrentDate(new Date(calendarData.year, calendarData.month + 1))

  return (
    <div className='bg-gray-900/50 backdrop-blur-lg border border-blue-500/20 rounded-lg p-4'>
      <CalendarNavigation
        year={calendarData.year}
        month={calendarData.month}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />
      <CalendarGrid calendarData={calendarData} />
      <div className='flex items-center justify-center mt-3 text-xs'>
        <div className='flex items-center space-x-1'>
          <div className='w-2 h-2 bg-blue-500 rounded' />
          <span className='text-gray-400'>오늘</span>
        </div>
      </div>
    </div>
  )
}

// ==================== 메인 컴포넌트 ====================
export default function ActivityList() {
  return (
    <div className='space-y-4'>
      <SectionHeader />
      <DayCounter />
      <MiniCalendar />
    </div>
  )
}
