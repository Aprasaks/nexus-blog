// src/components/post/ChatModal.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send } from 'lucide-react'

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
}

interface ChatModalProps {
  isOpen: boolean
  onClose: () => void
  postTitle?: string
  postContent?: string
}

export default function ChatModal({
  isOpen,
  onClose,
  postTitle,
  postContent,
}: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 챗봇 SVG 아이콘
  const ChatbotIcon = () => (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='text-white'
    >
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
      <circle cx='8.5' cy='10' r='1.5' fill='currentColor' />
      <circle cx='15.5' cy='10' r='1.5' fill='currentColor' />
      <path
        d='M9 14h6'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
      />
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

  // 초기 메시지 설정
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        content: `안녕하세요! 저는 E.D.I.T.H AI입니다.${postTitle ? `\n현재 보고 계신 "${postTitle}" 포스트에 대해 궁금한 점이 있으시면 언제든 물어보세요!` : '\n무엇이든 물어보세요!'}`,
        sender: 'ai',
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, postTitle, messages.length])

  // 메시지가 추가될 때마다 스크롤 맨 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 모달이 열릴 때 입력창에 포커스
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // 메시지 전송
  const handleSendMessage = async () => {
    const trimmedMessage = inputMessage.trim()
    if (!trimmedMessage || isLoading) return

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: trimmedMessage,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // 실제 OpenAI API 호출
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmedMessage,
          postTitle,
          postContent,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        )
      }

      const data = await response.json()

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: data.response,
        sender: 'ai',
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('AI 응답 오류:', error)

      let errorMessage =
        '죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해 주세요.'

      if (error instanceof Error) {
        // 특정 에러 메시지들 처리
        if (error.message.includes('할당량')) {
          errorMessage =
            '⚠️ API 할당량이 부족합니다. 잠시 후 다시 시도해주세요.'
        } else if (error.message.includes('API 키')) {
          errorMessage =
            '🔑 API 키 설정에 문제가 있습니다. 관리자에게 문의해주세요.'
        } else if (error.message.includes('네트워크')) {
          errorMessage = '🌐 네트워크 연결을 확인해주세요.'
        }
      }

      const errorMessageObj: Message = {
        id: `error-${Date.now()}`,
        content: errorMessage,
        sender: 'ai',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessageObj])
    } finally {
      setIsLoading(false)
    }
  }

  // Enter 키로 메시지 전송
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // 추천 질문 클릭
  const handleSuggestedQuestion = (question: string) => {
    setInputMessage(question)
    inputRef.current?.focus()
  }

  // 모달 외부 클릭 시 닫기
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4'
      onClick={handleBackdropClick}
    >
      {/* 채팅창 */}
      <div className='relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl h-[600px] flex flex-col'>
        {/* 헤더 */}
        <div className='flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg'>
          <div className='flex items-center space-x-3'>
            <div className='w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center'>
              <ChatbotIcon />
            </div>
            <div>
              <h3 className='font-semibold'>E.D.I.T.H AI</h3>
              <p className='text-xs text-blue-100'>
                {postTitle
                  ? `"${postTitle}" 에 대해 질문하세요`
                  : '무엇이든 물어보세요'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* 메시지 영역 */}
        <div className='flex-1 overflow-y-auto p-4 space-y-4'>
          {/* 시스템 메시지 */}
          <div className='flex justify-center'>
            <div className='bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-xs text-gray-600 dark:text-gray-400'>
              AI 챗봇과의 대화가 시작되었습니다
            </div>
          </div>

          {/* 채팅 메시지들 */}
          {messages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {/* 로딩 인디케이터 */}
          {isLoading && (
            <div className='flex items-start space-x-3'>
              <div className='w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0'>
                <ChatbotIcon />
              </div>
              <div className='flex-1'>
                <div className='bg-gray-100 dark:bg-gray-700 rounded-lg p-3'>
                  <div className='flex space-x-1'>
                    <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' />
                    <div
                      className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                      style={{ animationDelay: '0.1s' }}
                    />
                    <div
                      className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                      style={{ animationDelay: '0.2s' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 추천 질문들 */}
          {messages.length === 1 && (
            <div className='space-y-2'>
              <p className='text-xs text-gray-500 dark:text-gray-400 text-center'>
                추천 질문
              </p>
              <div className='flex flex-wrap gap-2'>
                {[
                  '이 글의 핵심 내용은?',
                  '요약해 주세요',
                  '관련 예제가 있나요?',
                  '더 자세한 설명을 원해요',
                ].map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className='px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors'
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 */}
        <div className='p-4 border-t border-gray-200 dark:border-gray-700'>
          <div className='flex items-center space-x-2'>
            <input
              ref={inputRef}
              type='text'
              placeholder='메시지를 입력하세요...'
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className='flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50'
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className='p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <Send className='w-5 h-5' />
            </button>
          </div>

          {/* 안내 문구 */}
          <p className='text-xs text-gray-500 dark:text-gray-400 mt-2 text-center'>
            💡 AI가 포스트 내용을 바탕으로 답변해드립니다
          </p>
        </div>
      </div>
    </div>
  )
}

// 개별 메시지 컴포넌트
function ChatMessage({ message }: { message: Message }) {
  const isUser = message.sender === 'user'

  const ChatbotIcon = () => (
    <svg
      width='20'
      height='20'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='text-white'
    >
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
      <circle cx='8.5' cy='10' r='1.5' fill='currentColor' />
      <circle cx='15.5' cy='10' r='1.5' fill='currentColor' />
      <path
        d='M9 14h6'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
      />
    </svg>
  )

  return (
    <div
      className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
    >
      {/* 아바타 */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser
            ? 'bg-blue-500 text-white'
            : 'bg-gradient-to-r from-blue-500 to-purple-600'
        }`}
      >
        {isUser ? (
          <span className='text-sm font-semibold'>U</span>
        ) : (
          <ChatbotIcon />
        )}
      </div>

      {/* 메시지 내용 */}
      <div className='flex-1'>
        <div
          className={`rounded-lg p-3 max-w-xs ${
            isUser
              ? 'bg-blue-500 text-white ml-auto'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
          }`}
        >
          <p className='text-sm whitespace-pre-wrap'>{message.content}</p>
        </div>
        <span
          className={`text-xs text-gray-500 mt-1 block ${isUser ? 'text-right' : ''}`}
        >
          {message.timestamp.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  )
}
