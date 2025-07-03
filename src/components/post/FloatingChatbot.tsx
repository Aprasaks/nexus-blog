// src/components/post/FloatingChatbot.tsx
'use client'

import { useState } from 'react'
import { useDraggable } from './hooks/useDraggable'
import ChatModal from './ChatModal'

interface FloatingChatbotProps {
  postTitle?: string
  postContent?: string
}

export default function FloatingChatbot({
  postTitle,
  postContent,
}: FloatingChatbotProps) {
  const [isChatOpen, setIsChatOpen] = useState(false)

  // 드래그 기능 적용
  const { isDragging, dragHandleProps, elementRef } = useDraggable({
    initialPosition: { x: window.innerWidth - 80, y: window.innerHeight - 150 },
    storageKey: 'chatbot-position',
    boundary: {
      top: 60,
      left: 10,
      right: window.innerWidth - 60,
      bottom: window.innerHeight - 60,
    },
  })

  // 챗봇 아이콘 클릭 핸들러
  const handleChatbotClick = () => {
    if (!isDragging) {
      setIsChatOpen(true)
    }
  }

  // 채팅창 닫기
  const handleCloseChatModal = () => {
    setIsChatOpen(false)
  }

  return (
    <>
      {/* 드래그 가능한 챗봇 아이콘 */}
      <div
        ref={elementRef}
        {...dragHandleProps}
        onClick={handleChatbotClick}
        className={`w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer ${
          isDragging ? 'scale-110 shadow-2xl' : 'hover:scale-105'
        }`}
        title='AI 챗봇'
      >
        <ChatbotIcon />

        {/* 펄스 애니메이션 */}
        <div className='absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-ping opacity-20' />
      </div>

      {/* 채팅 모달 */}
      <ChatModal
        isOpen={isChatOpen}
        onClose={handleCloseChatModal}
        postTitle={postTitle}
        postContent={postContent}
      />
    </>
  )
}

// 챗봇 SVG 아이콘 컴포넌트
function ChatbotIcon() {
  return (
    <svg
      width='32'
      height='32'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='text-white'
    >
      {/* 로봇 머리 */}
      <rect
        x='4'
        y='6'
        width='16'
        height='12'
        rx='2'
        stroke='currentColor'
        strokeWidth='2'
        fill='currentColor'
        fillOpacity='0.1'
      />

      {/* 안테나 */}
      <line
        x1='12'
        y1='2'
        x2='12'
        y2='6'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
      />
      <circle cx='12' cy='2' r='1' fill='currentColor' />

      {/* 눈 */}
      <circle cx='8.5' cy='10' r='1.5' fill='currentColor' />
      <circle cx='15.5' cy='10' r='1.5' fill='currentColor' />

      {/* 입 */}
      <path
        d='M9 14h6'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
      />

      {/* 팔 */}
      <line
        x1='4'
        y1='12'
        x2='2'
        y2='14'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
      />
      <line
        x1='20'
        y1='12'
        x2='22'
        y2='14'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
      />
    </svg>
  )
}
