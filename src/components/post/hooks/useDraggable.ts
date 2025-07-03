// src/components/post/hooks/useDraggable.ts
import { useState, useRef, useCallback, useEffect } from 'react'

interface Position {
  x: number
  y: number
}

interface DragState {
  isDragging: boolean
  dragOffset: Position
}

interface UseDraggableOptions {
  initialPosition?: Position
  storageKey?: string // localStorage에 위치 저장할 키
  boundary?: {
    top?: number
    left?: number
    right?: number
    bottom?: number
  }
}

interface UseDraggableReturn {
  position: Position
  isDragging: boolean
  dragHandleProps: {
    onMouseDown: (e: React.MouseEvent) => void
    onTouchStart: (e: React.TouchEvent) => void
    style: React.CSSProperties
  }
  elementRef: React.RefObject<HTMLDivElement>
  resetPosition: () => void
  setPosition: (newPosition: Position) => void
}

export const useDraggable = ({
  initialPosition = { x: 20, y: 20 },
  storageKey,
  boundary,
}: UseDraggableOptions = {}): UseDraggableReturn => {
  const elementRef = useRef<HTMLDivElement>(null)

  // localStorage에서 저장된 위치 불러오기
  const getStoredPosition = useCallback((): Position => {
    if (!storageKey || typeof window === 'undefined') return initialPosition

    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.warn('Failed to load stored position:', error)
    }
    return initialPosition
  }, [initialPosition, storageKey])

  const [position, setPositionState] = useState<Position>(getStoredPosition)
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
  })

  // 위치를 localStorage에 저장
  const savePosition = useCallback(
    (newPosition: Position) => {
      if (storageKey && typeof window !== 'undefined') {
        try {
          localStorage.setItem(storageKey, JSON.stringify(newPosition))
        } catch (error) {
          console.warn('Failed to save position:', error)
        }
      }
    },
    [storageKey]
  )

  // 경계 체크 함수
  const constrainPosition = useCallback(
    (pos: Position): Position => {
      if (!boundary) return pos

      let { x, y } = pos

      if (boundary.left !== undefined) x = Math.max(boundary.left, x)
      if (boundary.top !== undefined) y = Math.max(boundary.top, y)
      if (boundary.right !== undefined) x = Math.min(boundary.right, x)
      if (boundary.bottom !== undefined) y = Math.min(boundary.bottom, y)

      return { x, y }
    },
    [boundary]
  )

  // 위치 설정 함수
  const setPosition = useCallback(
    (newPosition: Position) => {
      const constrainedPosition = constrainPosition(newPosition)
      setPositionState(constrainedPosition)
      savePosition(constrainedPosition)
    },
    [constrainPosition, savePosition]
  )

  // 위치 리셋 함수
  const resetPosition = useCallback(() => {
    setPosition(initialPosition)
  }, [initialPosition, setPosition])

  // 마우스/터치 이벤트 핸들러
  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    if (!elementRef.current) return

    const rect = elementRef.current.getBoundingClientRect()
    const offset = {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }

    setDragState({
      isDragging: true,
      dragOffset: offset,
    })

    // 드래그 중에는 선택 방지
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'grabbing'
  }, [])

  const handleDragMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!dragState.isDragging) return

      const newPosition = {
        x: clientX - dragState.dragOffset.x,
        y: clientY - dragState.dragOffset.y,
      }

      setPosition(newPosition)
    },
    [dragState.isDragging, dragState.dragOffset, setPosition]
  )

  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      dragOffset: { x: 0, y: 0 },
    })

    // 스타일 복원
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
  }, [])

  // 마우스 이벤트
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      handleDragStart(e.clientX, e.clientY)
    },
    [handleDragStart]
  )

  // 터치 이벤트 (모바일)
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      handleDragStart(touch.clientX, touch.clientY)
    },
    [handleDragStart]
  )

  // 전역 이벤트 리스너 등록
  useEffect(() => {
    if (!dragState.isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientX, e.clientY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0]
      handleDragMove(touch.clientX, touch.clientY)
    }

    const handleMouseUp = () => {
      handleDragEnd()
    }

    const handleTouchEnd = () => {
      handleDragEnd()
    }

    // 이벤트 리스너 등록
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)

    // 클린업
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [dragState.isDragging, handleDragMove, handleDragEnd])

  // 윈도우 리사이즈 시 경계 체크
  useEffect(() => {
    const handleResize = () => {
      setPosition(position) // 현재 위치를 경계에 맞게 재조정
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [position, setPosition])

  // 컴포넌트 마운트 시 저장된 위치 불러오기
  useEffect(() => {
    const storedPosition = getStoredPosition()
    if (storedPosition.x !== position.x || storedPosition.y !== position.y) {
      setPositionState(storedPosition)
    }
  }, [])

  return {
    position,
    isDragging: dragState.isDragging,
    dragHandleProps: {
      onMouseDown: handleMouseDown,
      onTouchStart: handleTouchStart,
      style: {
        position: 'fixed',
        left: position.x,
        top: position.y,
        cursor: dragState.isDragging ? 'grabbing' : 'grab',
        zIndex: dragState.isDragging ? 9999 : 1000,
        userSelect: 'none',
        touchAction: 'none',
      },
    },
    elementRef,
    resetPosition,
    setPosition,
  }
}
