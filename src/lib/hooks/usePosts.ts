// lib/hooks/usePosts.ts

import { useState, useEffect } from 'react'

export interface BlogPost {
  id: string
  title: string
  content: string
  excerpt: string
  category: string
  date: string
  slug: string
  path: string
}

interface ApiResponse {
  success: boolean
  posts: BlogPost[]
  count: number
  timestamp: string
  error?: string
}

export function usePosts() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPosts = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('📡 API Route에서 포스트 데이터 요청 중...')

      const response = await fetch('/api/github/posts', {
        cache: 'no-store', // 항상 최신 데이터
      })

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`)
      }

      const data: ApiResponse = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'API 응답 오류')
      }

      console.log(`✅ API Route에서 ${data.count}개 포스트 로드 완료`)
      setPosts(data.posts)
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : '포스트를 불러오는 중 오류가 발생했습니다.'
      setError(errorMessage)
      console.error('Posts loading error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // 포스트 검색
  const searchPosts = (query: string): BlogPost[] => {
    if (!query.trim()) return posts

    const searchTerm = query.toLowerCase()
    return posts.filter(
      post =>
        post.title.toLowerCase().includes(searchTerm) ||
        post.excerpt.toLowerCase().includes(searchTerm) ||
        post.category.toLowerCase().includes(searchTerm) ||
        post.content.toLowerCase().includes(searchTerm)
    )
  }

  // 카테고리별 필터링
  const getPostsByCategory = (category: string): BlogPost[] => {
    return posts.filter(post => post.category === category)
  }

  // 카테고리 목록 추출
  const getCategories = (): string[] => {
    const categories = Array.from(new Set(posts.map(post => post.category)))
    return categories.sort()
  }

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadPosts()
  }, [])

  return {
    posts,
    isLoading,
    error,
    searchPosts,
    getPostsByCategory,
    getCategories,
    refetch: loadPosts,
  }
}
