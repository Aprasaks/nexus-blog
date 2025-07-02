'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { usePosts } from '@/lib/hooks/usePosts'
import { BlogPost } from '@/lib/services/github'

export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0)

  // GitHub에서 포스트 데이터 가져오기
  const {
    posts,
    isLoading,
    error,
    searchPosts,
    getPostsByCategory,
    getCategories,
  } = usePosts()

  // 카테고리 목록
  const allCategories = getCategories()

  // 함수들을 useCallback으로 메모이제이션
  const memoizedSearchPosts = useCallback(
    (term: string) => {
      return searchPosts(term)
    },
    [searchPosts]
  )

  const memoizedGetPostsByCategory = useCallback(
    (category: string) => {
      return getPostsByCategory(category)
    },
    [getPostsByCategory]
  )

  // 첫 번째 카테고리를 기본으로 선택
  useEffect(() => {
    if (allCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(allCategories[0])
    }
  }, [allCategories, selectedCategory])

  // 검색 및 필터링
  useEffect(() => {
    let filtered = posts

    // 카테고리 필터링
    if (selectedCategory) {
      filtered = memoizedGetPostsByCategory(selectedCategory)
    }

    // 검색어 필터링
    if (searchTerm.trim()) {
      filtered = memoizedSearchPosts(searchTerm).filter(
        post => !selectedCategory || post.category === selectedCategory
      )
    }

    setFilteredPosts(filtered)
  }, [
    searchTerm,
    selectedCategory,
    posts,
    memoizedSearchPosts,
    memoizedGetPostsByCategory,
  ])

  // 카테고리 선택 핸들러
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category)
  }

  // 카테고리 네비게이션
  const nextCategory = () => {
    setCurrentCategoryIndex(prev =>
      prev === allCategories.length - 1 ? 0 : prev + 1
    )
  }

  const prevCategory = () => {
    setCurrentCategoryIndex(prev =>
      prev === 0 ? allCategories.length - 1 : prev - 1
    )
  }

  // 포스트 클릭 핸들러
  const handlePostClick = (post: BlogPost) => {
    console.log('포스트 클릭:', post.slug)
    // 나중에 라우팅 추가: router.push(`/post/${post.slug}`)
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600 dark:text-gray-400'>
            GitHub에서 포스트를 불러오는 중...
          </p>
        </div>
      </div>
    )
  }

  // 에러 상태
  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-red-500 text-4xl mb-4'>❌</div>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
            포스트를 불러올 수 없습니다
          </h2>
          <p className='text-gray-600 dark:text-gray-400 mb-4'>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      <div className='max-w-7xl mx-auto px-4 py-8'>
        {/* 중앙 검색바 */}
        <div className='max-w-2xl mx-auto mb-16'>
          <div className='relative'>
            <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
            <input
              type='text'
              placeholder='어떤 주제를 찾고 계신가요?'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full pl-12 pr-6 py-4 text-lg border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg'
            />
          </div>
        </div>

        {/* 카테고리 캐러셀 */}
        {allCategories.length > 1 && (
          <div className='mb-16'>
            {/* 카테고리 표시 영역 */}
            <div className='flex items-center justify-center space-x-8 mb-8'>
              {/* 원형 무한 루프로 5개 위치에 카테고리 표시 */}
              {[-2, -1, 0, 1, 2].map(offset => {
                const index =
                  (currentCategoryIndex + offset + allCategories.length) %
                  allCategories.length
                const category = allCategories[index]
                const isActive = selectedCategory === category
                const distance = Math.abs(offset)

                let opacity = 'opacity-40'
                let scale = 'scale-75'
                let zIndex = 'z-10'

                if (distance === 0) {
                  opacity = 'opacity-100'
                  scale = 'scale-110'
                  zIndex = 'z-30'
                } else if (distance === 1) {
                  opacity = 'opacity-70'
                  scale = 'scale-90'
                  zIndex = 'z-20'
                }

                return (
                  <button
                    key={`${category}-${offset}`}
                    onClick={() => {
                      setCurrentCategoryIndex(index)
                      handleCategoryClick(category)
                    }}
                    className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-500 capitalize relative ${opacity} ${scale} ${zIndex} ${
                      distance === 0
                        ? 'text-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl border-0'
                        : 'text-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    style={{
                      minWidth: distance === 0 ? '200px' : '150px',
                    }}
                  >
                    {category}
                    {distance === 0 && isActive && (
                      <div className='absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-lg opacity-30 -z-10'></div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* 포스트 그리드 */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredPosts.map(post => (
            <div
              key={post.id}
              onClick={() => handlePostClick(post)}
              className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer group'
            >
              {/* 카테고리 태그 */}
              <div className='mb-3'>
                <span className='inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-md capitalize'>
                  {post.category}
                </span>
              </div>

              {/* 포스트 제목 */}
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'>
                {post.title}
              </h3>

              {/* 포스트 요약 */}
              <p className='text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3'>
                {post.excerpt}
              </p>

              {/* 날짜 */}
              <div className='text-xs text-gray-500 dark:text-gray-500'>
                {new Date(post.date).toLocaleDateString('ko-KR')}
              </div>
            </div>
          ))}
        </div>

        {/* 검색 결과 없음 */}
        {filteredPosts.length === 0 && (
          <div className='text-center py-12'>
            <div className='text-gray-400 mb-2'>
              <Filter className='w-12 h-12 mx-auto' />
            </div>
            <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
              포스트를 찾을 수 없습니다
            </h3>
            <p className='text-gray-600 dark:text-gray-400'>
              다른 검색어나 카테고리를 시도해보세요
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
