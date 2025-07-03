// src/components/post/FloatingTOC.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  List,
  ChevronDown,
  ChevronUp,
  Minimize2,
  Maximize2,
} from 'lucide-react'
import { useDraggable } from './hooks/useDraggable'

interface TOCItem {
  id: string
  title: string
  level: number // 1, 2, 3 (h1, h2, h3)
  element?: HTMLElement
}

interface FloatingTOCProps {
  content: string // 마크다운 콘텐츠
}

export default function FloatingTOC({ content }: FloatingTOCProps) {
  const [tocItems, setTocItems] = useState<TOCItem[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [isExpanded, setIsExpanded] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)

  // 드래그 기능 적용
  const { position, isDragging, dragHandleProps, elementRef, resetPosition } =
    useDraggable({
      initialPosition: { x: 20, y: 100 },
      storageKey: 'toc-position',
      boundary: {
        top: 60, // 헤더 아래
        left: 10,
        right: window.innerWidth - 300,
        bottom: window.innerHeight - 100,
      },
    })

  // 마크다운에서 헤딩 추출하여 TOC 생성
  const generateTOC = useCallback(() => {
    const headingRegex = /^(#{1,3})\s+(.+)$/gm
    const items: TOCItem[] = []
    let match

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length // #의 개수
      const title = match[2].trim()
      const id = title
        .toLowerCase()
        .replace(/[^a-z0-9\s가-힣]/g, '') // 특수문자 제거
        .replace(/\s+/g, '-') // 공백을 하이픈으로
        .trim()

      items.push({
        id: `heading-${id}-${items.length}`, // 중복 방지
        title,
        level,
      })
    }

    setTocItems(items)
  }, [content])

  // 실제 DOM 요소 찾기 및 ID 할당
  const attachElementsToTOC = useCallback(() => {
    const updatedItems = tocItems.map((item, index) => {
      // 실제 DOM에서 헤딩 요소 찾기
      const headings = document.querySelectorAll('h1, h2, h3')
      const element = headings[index] as HTMLElement

      if (element) {
        // 요소에 ID 할당 (스크롤 타겟용)
        element.id = item.id
        return { ...item, element }
      }

      return item
    })

    setTocItems(updatedItems)
  }, [tocItems])

  // 스크롤 시 현재 활성 섹션 감지
  const handleScroll = useCallback(() => {
    const headings = tocItems
      .map(item => item.element)
      .filter(Boolean) as HTMLElement[]

    if (headings.length === 0) return

    // 현재 스크롤 위치
    const scrollY = window.scrollY + 100 // 헤더 높이 고려

    // 현재 보이는 헤딩 찾기
    let activeIndex = 0
    for (let i = headings.length - 1; i >= 0; i--) {
      const heading = headings[i]
      if (heading.offsetTop <= scrollY) {
        activeIndex = i
        break
      }
    }

    const activeItem = tocItems[activeIndex]
    if (activeItem && activeItem.id !== activeId) {
      setActiveId(activeItem.id)
    }
  }, [tocItems, activeId])

  // 헤딩 클릭 시 해당 위치로 스크롤
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const headerHeight = 80 // 헤더 높이
      const elementTop = element.offsetTop - headerHeight

      window.scrollTo({
        top: elementTop,
        behavior: 'smooth',
      })

      setActiveId(id)
    }
  }

  // TOC 접기/펼치기
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  // TOC 최소화/복원
  const toggleMinimized = () => {
    setIsMinimized(!isMinimized)
    if (isMinimized) {
      setIsExpanded(true) // 복원시 펼친 상태로
    }
  }

  // 초기 TOC 생성
  useEffect(() => {
    generateTOC()
  }, [generateTOC])

  // DOM 요소 연결 (마크다운 렌더링 후)
  useEffect(() => {
    if (tocItems.length > 0) {
      // 약간의 지연을 두어 DOM 렌더링 완료 대기
      const timer = setTimeout(() => {
        attachElementsToTOC()
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [tocItems.length])

  // 스크롤 이벤트 리스너
  useEffect(() => {
    if (tocItems.some(item => item.element)) {
      window.addEventListener('scroll', handleScroll, { passive: true })
      handleScroll() // 초기 활성 섹션 설정

      return () => {
        window.removeEventListener('scroll', handleScroll)
      }
    }
  }, [handleScroll, tocItems])

  // TOC 항목이 없으면 렌더링하지 않음
  if (tocItems.length === 0) {
    return null
  }

  return (
    <div
      ref={elementRef}
      {...dragHandleProps}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 ${
        isDragging ? 'shadow-2xl scale-105' : ''
      } ${isMinimized ? 'w-12 h-12' : 'w-64'}`}
    >
      {/* 헤더 */}
      <div className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600'>
        <div className='flex items-center space-x-2'>
          <List className='w-4 h-4 text-gray-600 dark:text-gray-300' />
          {!isMinimized && (
            <span className='text-sm font-medium text-gray-800 dark:text-gray-200'>
              목차
            </span>
          )}
        </div>

        <div className='flex items-center space-x-1'>
          {!isMinimized && (
            <button
              onClick={toggleExpanded}
              className='p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded'
              title={isExpanded ? '접기' : '펼치기'}
            >
              {isExpanded ? (
                <ChevronUp className='w-3 h-3 text-gray-600 dark:text-gray-300' />
              ) : (
                <ChevronDown className='w-3 h-3 text-gray-600 dark:text-gray-300' />
              )}
            </button>
          )}

          <button
            onClick={toggleMinimized}
            className='p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded'
            title={isMinimized ? '복원' : '최소화'}
          >
            {isMinimized ? (
              <Maximize2 className='w-3 h-3 text-gray-600 dark:text-gray-300' />
            ) : (
              <Minimize2 className='w-3 h-3 text-gray-600 dark:text-gray-300' />
            )}
          </button>
        </div>
      </div>

      {/* TOC 목록 */}
      {!isMinimized && isExpanded && (
        <div className='max-h-80 overflow-y-auto'>
          <ul className='py-2'>
            {tocItems.map(item => (
              <li key={item.id}>
                <button
                  onClick={() => scrollToHeading(item.id)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    activeId === item.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-r-2 border-blue-500'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                  style={{
                    paddingLeft: `${12 + (item.level - 1) * 16}px`, // 레벨에 따른 들여쓰기
                  }}
                >
                  <span className='block truncate' title={item.title}>
                    {item.title}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 읽기 진행도 (선택사항) */}
      {!isMinimized && isExpanded && (
        <div className='px-3 py-2 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600'>
          <div className='flex items-center justify-between text-xs text-gray-500 dark:text-gray-400'>
            <span>진행도</span>
            <span>
              {tocItems.findIndex(item => item.id === activeId) + 1} /{' '}
              {tocItems.length}
            </span>
          </div>
          <div className='mt-1 h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden'>
            <div
              className='h-full bg-blue-500 transition-all duration-300'
              style={{
                width: `${((tocItems.findIndex(item => item.id === activeId) + 1) / tocItems.length) * 100}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
