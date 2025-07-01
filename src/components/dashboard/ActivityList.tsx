// src/components/dashboard/ActivityList.tsx
'use client'

import { useState, useEffect } from 'react'
import { useGitHubPosts } from '@/lib/hooks/useGitHub'
import {
  START_DATE,
  MONTH_NAMES,
  WEEK_DAYS,
  ANIMATION_CONFIG,
  CATEGORY_ICONS,
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

const formatPostTitle = (filename: string): string => {
  return filename
    .replace('.md', '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
}

const getPostCategory = (path: string): string => {
  const parts = path.split('/')
  return parts.length > 1 ? parts[0].toUpperCase() : 'DOCS'
}

const getPostIcon = (category: string): string => {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS.DEFAULT
}

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

function LoadingSkeleton() {
  return (
    <div className='space-y-3'>
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className='animate-pulse'>
          <div className='h-4 bg-gray-700 rounded w-3/4 mb-2' />
          <div className='h-3 bg-gray-800 rounded w-1/2' />
        </div>
      ))}
    </div>
  )
}

function EmptyState({ error }: { error?: string | null }) {
  return (
    <div className='text-center py-8 text-gray-500'>
      <div className='text-2xl mb-2'>{error ? '❌' : '📄'}</div>
      <div className='text-sm'>
        {error ? 'GitHub 포스트 로드 실패' : '포스트가 없습니다'}
      </div>
      {error && (
        <div className='text-xs text-red-400 mt-1 max-w-xs mx-auto truncate'>
          {error}
        </div>
      )}
    </div>
  )
}

function PostItem({ post }: { post: any }) {
  const category = getPostCategory(post.path)
  const icon = getPostIcon(category)
  const title = formatPostTitle(post.name)

  return (
    <a
      href={post.html_url}
      target='_blank'
      rel='noopener noreferrer'
      className='block p-3 hover:bg-gray-800/50 rounded-lg transition-colors group'
    >
      <div className='flex items-start space-x-3'>
        <div className='text-sm mt-0.5 group-hover:scale-110 transition-transform'>
          {icon}
        </div>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center space-x-2 mb-1'>
            <span className='text-xs text-blue-400 font-medium'>
              {category}
            </span>
            <div className='w-1 h-1 bg-gray-600 rounded-full' />
            <span className='text-xs text-gray-500 truncate'>{post.path}</span>
          </div>
          <div className='text-sm text-gray-300 group-hover:text-white transition-colors line-clamp-2'>
            {title}
          </div>
        </div>
        <div className='text-gray-500 group-hover:text-gray-300 transition-colors'>
          <svg
            className='w-4 h-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
            />
          </svg>
        </div>
      </div>
    </a>
  )
}

function GitHubPosts() {
  const { posts, isLoading, error } = useGitHubPosts(5)

  return (
    <div className='bg-gray-900/50 backdrop-blur-lg border border-blue-500/20 rounded-lg p-4'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-sm font-medium text-blue-300'>Recent Posts</h3>
        <div className='flex items-center space-x-2'>
          <span className='text-xs text-gray-400'>edith-docs</span>
          {!isLoading && !error && (
            <span className='text-xs text-green-400'>{posts.length}개</span>
          )}
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : error || posts.length === 0 ? (
        <EmptyState error={error} />
      ) : (
        <div className='space-y-1'>
          {posts.map((post, index) => (
            <PostItem key={index} post={post} />
          ))}
        </div>
      )}
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
      <GitHubPosts />
    </div>
  )
}
