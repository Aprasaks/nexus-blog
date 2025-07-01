// src/components/dashboard/AIPanel.tsx
'use client'

export default function AIPanel() {
  return (
    <div className='space-y-4'>
      {/* 헤더 */}
      <div className='flex items-center space-x-2'>
        <div className='w-2 h-2 bg-blue-400 rounded-full animate-pulse'></div>
        <h2 className='text-lg font-light text-blue-300 tracking-wider'>
          AI ASSISTANT
        </h2>
      </div>

      {/* 메인 AI 패널 */}
      <div className='bg-gray-900/50 backdrop-blur-lg border border-blue-500/20 rounded-lg p-8'>
        <div className='text-center space-y-6'>
          {/* 제목 */}
          <div>
            <h3 className='text-2xl font-light text-blue-300 mb-2'>
              E.D.I.T.H AI
            </h3>
            <p className='text-gray-400 text-sm'>
              AI 기능은 추후 업데이트 예정입니다
            </p>
          </div>

          {/* 상태 표시 */}
          <div className='flex items-center justify-center space-x-2'>
            <div className='w-2 h-2 bg-yellow-400 rounded-full animate-pulse'></div>
            <span className='text-xs text-yellow-400 font-mono'>
              DEVELOPMENT
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
