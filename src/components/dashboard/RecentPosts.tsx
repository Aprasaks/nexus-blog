// src/components/dashboard/RecentPosts.tsx
'use client'

import { usePosts } from '@/lib/hooks/usePosts'
import { BlogPost } from '@/lib/services/github'
import { CATEGORY_ICONS } from '@/lib/config/constants'

// ==================== 유틸리티 함수 ====================
const getPostIcon = (category: string): string => {
  return (
    CATEGORY_ICONS[category.toUpperCase()] || CATEGORY_ICONS.DEFAULT || '📄'
  )
}

// ==================== 컴포넌트 ====================
function LoadingSkeleton() {
  return (
    <div className='space-y-3'>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className='animate-pulse flex items-center space-x-3'>
          <div className='w-6 h-6 bg-gray-700 rounded' />
          <div className='flex-1'>
            <div className='h-4 bg-gray-700 rounded w-3/4 mb-2' />
            <div className='h-3 bg-gray-800 rounded w-1/2' />
          </div>
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

function PostItem({ post }: { post: BlogPost }) {
  const icon = getPostIcon(post.category)

  return (
    <div className='bg-gray-800/30 hover:bg-gray-800/50 rounded-lg transition-all duration-200 group cursor-pointer border border-gray-700/50 hover:border-blue-500/30'>
      <div className='p-4'>
        <div className='flex items-center justify-between mb-3'>
          <div className='text-lg group-hover:scale-110 transition-transform'>
            {icon}
          </div>
          <div className='flex items-center space-x-2'>
            <span className='text-xs text-blue-400 font-medium uppercase bg-blue-400/10 px-2 py-1 rounded'>
              {post.category}
            </span>
          </div>
        </div>

        <div className='mb-3'>
          <h4 className='text-sm font-medium text-gray-200 group-hover:text-white transition-colors line-clamp-2 mb-2'>
            {post.title}
          </h4>
          <p className='text-xs text-gray-500 line-clamp-2'>{post.excerpt}</p>
        </div>

        <div className='flex items-center justify-between'>
          <span className='text-xs text-gray-500'>
            {new Date(post.date).toLocaleDateString('ko-KR')}
          </span>
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
                d='M9 5l7 7-7 7'
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== 메인 컴포넌트 ====================
export default function RecentPosts() {
  const { posts, isLoading, error } = usePosts()

  // 최근 3개 포스트만 가져오기 (이미 날짜순 정렬됨)
  const recentPosts = posts.slice(0, 3)

  return (
    <div className='bg-gray-900/50 backdrop-blur-lg border border-blue-500/20 rounded-lg p-6'>
      {/* 헤더 섹션 */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center space-x-2'>
          <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse' />
          <h2 className='text-lg font-light text-blue-300 tracking-wider'>
            RECENT POSTS
          </h2>
        </div>
        <div className='flex items-center space-x-2'>
          <span className='text-xs text-gray-400'>edith-docs</span>
          {!isLoading && !error && (
            <span className='text-xs text-green-400'>
              {recentPosts.length}개
            </span>
          )}
        </div>
      </div>

      {/* 콘텐츠 섹션 */}
      {isLoading ? (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className='animate-pulse'>
              <div className='flex items-center space-x-3 p-4 bg-gray-800/30 rounded-lg'>
                <div className='w-6 h-6 bg-gray-700 rounded' />
                <div className='flex-1'>
                  <div className='h-4 bg-gray-700 rounded w-3/4 mb-2' />
                  <div className='h-3 bg-gray-800 rounded w-1/2' />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error || recentPosts.length === 0 ? (
        <EmptyState error={error} />
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {recentPosts.map(post => (
            <PostItem key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
