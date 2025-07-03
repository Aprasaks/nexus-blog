'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter } from 'lucide-react'
import { usePosts } from '@/lib/hooks/usePosts'
import { BlogPost } from '@/lib/services/github'

export default function ExplorePage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0)

  // GitHub에서 포스트 데이터 가져오기
  const { posts, isLoading, error, getCategories } = usePosts()
  const allCategories = getCategories()

  // 필터링 함수들
  const filterPostsByCategory = useCallback(
    (category: string) => posts.filter(post => post.category === category),
    [posts]
  )

  const filterPostsBySearch = useCallback(
    (term: string) => {
      const lowerTerm = term.toLowerCase()
      return posts.filter(
        post =>
          post.title.toLowerCase().includes(lowerTerm) ||
          post.excerpt.toLowerCase().includes(lowerTerm) ||
          post.content.toLowerCase().includes(lowerTerm)
      )
    },
    [posts]
  )

  // 첫 번째 카테고리를 기본으로 선택
  useEffect(() => {
    if (allCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(allCategories[0])
    }
  }, [allCategories.length])

  // 검색 및 필터링
  useEffect(() => {
    let filtered = posts

    // 카테고리 필터링
    if (selectedCategory) {
      filtered = filterPostsByCategory(selectedCategory)
    }

    // 검색어 필터링
    if (searchTerm.trim()) {
      filtered = filterPostsBySearch(searchTerm).filter(
        post => !selectedCategory || post.category === selectedCategory
      )
    }

    setFilteredPosts(filtered)
  }, [
    searchTerm,
    selectedCategory,
    posts,
    filterPostsByCategory,
    filterPostsBySearch,
  ])

  // 카테고리 네비게이션
  const navigateToCategory = useCallback(
    (direction: 'next' | 'prev') => {
      setCurrentCategoryIndex(prev => {
        const newIndex =
          direction === 'next'
            ? prev === allCategories.length - 1
              ? 0
              : prev + 1
            : prev === 0
              ? allCategories.length - 1
              : prev - 1

        setSelectedCategory(allCategories[newIndex])
        return newIndex
      })
    },
    [allCategories]
  )

  // 이벤트 핸들러들
  const handleCategoryClick = (category: string) =>
    setSelectedCategory(category)
  const handlePostClick = (post: BlogPost) =>
    router.push(`/explore/${post.slug}`)

  // 로딩 상태
  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4' />
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
        {/* 검색바 */}
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        {/* 카테고리 캐러셀 */}
        {allCategories.length > 1 && (
          <CategoryCarousel
            categories={allCategories}
            currentIndex={currentCategoryIndex}
            selectedCategory={selectedCategory}
            onCategoryClick={handleCategoryClick}
            onNavigate={navigateToCategory}
          />
        )}

        {/* 포스트 그리드 */}
        <PostGrid posts={filteredPosts} onPostClick={handlePostClick} />

        {/* 검색 결과 없음 */}
        {filteredPosts.length === 0 && <EmptyState />}
      </div>
    </div>
  )
}

// 검색바 컴포넌트
function SearchBar({
  searchTerm,
  onSearchChange,
}: {
  searchTerm: string
  onSearchChange: (term: string) => void
}) {
  return (
    <div className='max-w-2xl mx-auto mb-16'>
      <div className='relative'>
        <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
        <input
          type='text'
          placeholder='어떤 주제를 찾고 계신가요?'
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          className='w-full pl-12 pr-6 py-4 text-lg border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg'
        />
      </div>
    </div>
  )
}

// 카테고리 캐러셀 컴포넌트
function CategoryCarousel({
  categories,
  currentIndex,
  selectedCategory,
  onCategoryClick,
  onNavigate,
}: {
  categories: string[]
  currentIndex: number
  selectedCategory: string
  onCategoryClick: (category: string) => void
  onNavigate: (direction: 'next' | 'prev') => void
}) {
  return (
    <div className='mb-16'>
      <div className='flex items-center justify-center space-x-8 mb-8'>
        {[-2, -1, 0, 1, 2].map(offset => {
          const index =
            (currentIndex + offset + categories.length) % categories.length
          const category = categories[index]
          const distance = Math.abs(offset)

          const styles = {
            opacity:
              distance === 0
                ? 'opacity-100'
                : distance === 1
                  ? 'opacity-70'
                  : 'opacity-40',
            scale:
              distance === 0
                ? 'scale-110'
                : distance === 1
                  ? 'scale-90'
                  : 'scale-75',
            zIndex: distance === 0 ? 'z-30' : distance === 1 ? 'z-20' : 'z-10',
          }

          return (
            <CategoryButton
              key={`${category}-${offset}`}
              category={category}
              isActive={distance === 0}
              isSelected={selectedCategory === category}
              styles={styles}
              onClick={() => {
                // 클릭한 카테고리의 인덱스로 이동
                const targetIndex = categories.indexOf(category)
                const steps =
                  (targetIndex - currentIndex + categories.length) %
                  categories.length
                for (let i = 0; i < steps; i++) {
                  onNavigate('next')
                }
                onCategoryClick(category)
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

// 카테고리 버튼 컴포넌트
function CategoryButton({
  category,
  isActive,
  isSelected,
  styles,
  onClick,
}: {
  category: string
  isActive: boolean
  isSelected: boolean
  styles: { opacity: string; scale: string; zIndex: string }
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-500 capitalize relative ${styles.opacity} ${styles.scale} ${styles.zIndex} ${
        isActive
          ? 'text-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl border-0'
          : 'text-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
      }`}
      style={{
        minWidth: isActive ? '200px' : '150px',
      }}
    >
      {category}
      {isActive && isSelected && (
        <div className='absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-lg opacity-30 -z-10' />
      )}
    </button>
  )
}

// 포스트 그리드 컴포넌트
function PostGrid({
  posts,
  onPostClick,
}: {
  posts: BlogPost[]
  onPostClick: (post: BlogPost) => void
}) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {posts.map(post => (
        <PostCard key={post.id} post={post} onClick={() => onPostClick(post)} />
      ))}
    </div>
  )
}

// 포스트 카드 컴포넌트
function PostCard({ post, onClick }: { post: BlogPost; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer group'
    >
      {/* 카테고리 태그 */}
      <div className='mb-3'>
        <span className='inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-md capitalize'>
          {post.category}
        </span>
      </div>

      {/* 제목 */}
      <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'>
        {post.title}
      </h3>

      {/* 요약 */}
      <p className='text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3'>
        {post.excerpt}
      </p>

      {/* 날짜 */}
      <div className='text-xs text-gray-500'>
        {new Date(post.date).toLocaleDateString('ko-KR')}
      </div>
    </div>
  )
}

// 빈 상태 컴포넌트
function EmptyState() {
  return (
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
  )
}
