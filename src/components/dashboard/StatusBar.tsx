// src/components/dashboard/StatusBar.tsx
'use client'

import { useState, useEffect } from 'react'
import { usePosts } from '@/lib/hooks/usePosts'
import { ANIMATION_CONFIG } from '@/lib/config/constants'

// ==================== 타입 정의 ====================
interface StatusCardProps {
  icon: string
  title: string
  value: number
  subtitle: string
  color: string
  isLoading?: boolean
}

interface StatData {
  posts: number
  visitors: number
  categories: number
}

// ==================== 상수 ====================
const MOCK_DATA: StatData = {
  posts: 0,
  visitors: 1247,
  categories: 0,
}

// ==================== 유틸리티 함수 ====================
const getStatusColor = (isOnline: boolean): string =>
  isOnline ? 'bg-green-500/20' : 'bg-red-500/20'

const getStatusText = (isOnline: boolean): string =>
  isOnline ? 'online' : 'offline'

// GitHub API 상태 확인 (간단한 핑 체크)
const useGitHubStatus = () => {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const checkGitHubStatus = async () => {
      try {
        const response = await fetch('https://api.github.com', {
          method: 'HEAD',
        })
        setIsOnline(response.ok)
      } catch {
        setIsOnline(false)
      }
    }

    checkGitHubStatus()
    const interval = setInterval(checkGitHubStatus, 60000) // 1분마다 체크

    return () => clearInterval(interval)
  }, [])

  return isOnline
}

// ==================== 컴포넌트 ====================
function AnimatedCounter({
  target,
  isLoading,
}: {
  target: number
  isLoading?: boolean
}) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (isLoading) return

    const increment =
      target / (ANIMATION_CONFIG.duration / ANIMATION_CONFIG.interval)

    const timer = setInterval(() => {
      setCount(prev => {
        const next = prev + increment
        if (next >= target) {
          clearInterval(timer)
          return target
        }
        return next
      })
    }, ANIMATION_CONFIG.interval)

    return () => clearInterval(timer)
  }, [target, isLoading])

  if (isLoading) {
    return <span className='animate-pulse'>---</span>
  }

  return Math.floor(count)
}

function StatusCard({
  icon,
  title,
  value,
  subtitle,
  color,
  isLoading,
}: StatusCardProps) {
  return (
    <div className='bg-gray-900/50 backdrop-blur-lg border border-blue-500/20 rounded-lg p-4 hover:border-blue-400/40 transition-all duration-200 group'>
      <div className='flex items-center space-x-3'>
        <div
          className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform`}
        >
          <span className='text-xl'>{icon}</span>
        </div>
        <div className='flex-1'>
          <div className='text-xs text-gray-400 uppercase tracking-wide'>
            {title}
          </div>
          <div className='text-2xl font-bold text-white'>
            <AnimatedCounter target={value} isLoading={isLoading} />
          </div>
          <div className='text-xs text-gray-500'>{subtitle}</div>
        </div>
      </div>
    </div>
  )
}

function SectionHeader() {
  return (
    <div className='flex items-center space-x-2'>
      <div className='w-2 h-2 bg-blue-400 rounded-full animate-pulse' />
      <h2 className='text-lg font-light text-blue-300 tracking-wider'>
        SYSTEM STATUS
      </h2>
    </div>
  )
}

// ==================== 메인 컴포넌트 ====================
export default function StatusBar() {
  const { posts, isLoading, error, getCategories } = usePosts()
  const isGitHubOnline = useGitHubStatus()

  // 통계 데이터 계산
  const stats = {
    posts: posts.length,
    visitors: MOCK_DATA.visitors, // 방문자는 여전히 Mock 데이터
    categories: getCategories().length,
  }

  // 에러가 있으면 Mock 데이터 사용
  const finalData = error ? MOCK_DATA : stats

  const statusCards = [
    {
      icon: '📝',
      title: 'Total Posts',
      value: finalData.posts,
      subtitle: error ? 'failed to load' : 'from edith-docs',
      color: 'bg-blue-500/20',
      isLoading: isLoading,
    },
    {
      icon: '📁',
      title: 'Categories',
      value: finalData.categories,
      subtitle: error ? 'failed to load' : 'active folders',
      color: 'bg-purple-500/20',
      isLoading: isLoading,
    },
    {
      icon: '📊',
      title: 'GitHub',
      value: finalData.visitors,
      subtitle: `API ${getStatusText(isGitHubOnline)} • visitors (mock)`,
      color: getStatusColor(isGitHubOnline),
      isLoading: false,
    },
  ]

  return (
    <div className='space-y-4'>
      <SectionHeader />
      <div className='space-y-3'>
        {statusCards.map((card, index) => (
          <StatusCard key={index} {...card} />
        ))}
      </div>

      {/* 추가 정보 */}
      {!isLoading && !error && posts.length > 0 && (
        <div className='bg-gray-900/30 border border-blue-500/10 rounded-lg p-3'>
          <div className='flex items-center justify-between text-xs'>
            <span className='text-gray-400'>Last Updated</span>
            <span className='text-gray-300'>
              {new Date().toLocaleTimeString('ko-KR')}
            </span>
          </div>
          <div className='flex items-center justify-between text-xs mt-1'>
            <span className='text-gray-400'>Latest Post</span>
            <span className='text-gray-300 truncate ml-2 max-w-32'>
              {posts[0]?.title || 'N/A'}
            </span>
          </div>
        </div>
      )}

      {/* 개발용 에러 표시 */}
      {process.env.NODE_ENV === 'development' && error && (
        <div className='text-xs text-red-400 p-2 bg-red-900/20 rounded'>
          GitHub API Error: {error}
        </div>
      )}
    </div>
  )
}
