// src/app/explore/[slug]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Tag } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { usePosts } from '@/lib/hooks/usePosts'
import { BlogPost } from '@/lib/services/github'
import FloatingTOC from '@/components/post/FloatingTOC'
import FloatingChatbot from '@/components/post/FloatingChatbot'

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [post, setPost] = useState<BlogPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // GitHub에서 포스트 데이터 가져오기
  const { posts, isLoading: postsLoading, error: postsError } = usePosts()

  // slug로 해당 포스트 찾기
  useEffect(() => {
    if (postsLoading) return

    if (postsError) {
      setError(postsError)
      setIsLoading(false)
      return
    }

    const foundPost = posts.find(p => p.slug === slug)
    if (foundPost) {
      setPost(foundPost)
    } else {
      setError('포스트를 찾을 수 없습니다.')
    }
    setIsLoading(false)
  }, [posts, postsLoading, postsError, slug])

  // 뒤로가기
  const handleBack = () => {
    router.back()
  }

  // 헤딩 ID 생성 함수
  const createHeadingId = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s가-힣]/g, '')
      .replace(/\s+/g, '-')
      .trim()
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600 dark:text-gray-400'>
            포스트를 불러오는 중...
          </p>
        </div>
      </div>
    )
  }

  // 에러 상태
  if (error || !post) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-red-500 text-4xl mb-4'>❌</div>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
            {error || '포스트를 찾을 수 없습니다'}
          </h2>
          <button
            onClick={handleBack}
            className='mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
            돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      {/* 헤더 영역 */}
      <div className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40'>
        <div className='max-w-4xl mx-auto px-6 py-4'>
          <div className='flex items-center space-x-4'>
            <button
              onClick={handleBack}
              className='flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors'
            >
              <ArrowLeft className='w-5 h-5' />
              <span>돌아가기</span>
            </button>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className='max-w-4xl mx-auto px-6 py-8'>
        {/* 포스트 헤더 */}
        <header className='mb-8'>
          {/* 카테고리 태그 */}
          <div className='flex items-center space-x-4 mb-4'>
            <span className='inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium'>
              <Tag className='w-4 h-4' />
              <span className='capitalize'>{post.category}</span>
            </span>
            <span className='inline-flex items-center space-x-1 text-gray-500 dark:text-gray-400 text-sm'>
              <Calendar className='w-4 h-4' />
              <span>{new Date(post.date).toLocaleDateString('ko-KR')}</span>
            </span>
          </div>

          {/* 제목 */}
          <h1 className='text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight'>
            {post.title}
          </h1>

          {/* 요약 */}
          {post.excerpt && (
            <p className='text-xl text-gray-600 dark:text-gray-400 leading-relaxed'>
              {post.excerpt}
            </p>
          )}
        </header>

        {/* 포스트 본문 */}
        <article className='max-w-none'>
          <div
            className='prose prose-lg dark:prose-invert max-w-none prose-headings:scroll-mt-20 
                         prose-pre:bg-gray-800 prose-pre:text-gray-100 
                         prose-code:bg-gray-100 dark:prose-code:bg-gray-800 
                         prose-code:text-gray-800 dark:prose-code:text-gray-100
                         prose-code:px-2 prose-code:py-1 prose-code:rounded
                         prose-pre:overflow-x-auto'
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                h1: ({ children, ...props }) => {
                  const id = createHeadingId(String(children))
                  return (
                    <h1
                      id={id}
                      className='text-3xl font-bold mb-4 text-gray-900 dark:text-white'
                      {...props}
                    >
                      {children}
                    </h1>
                  )
                },
                h2: ({ children, ...props }) => {
                  const id = createHeadingId(String(children))
                  return (
                    <h2
                      id={id}
                      className='text-2xl font-bold mb-3 text-gray-900 dark:text-white'
                      {...props}
                    >
                      {children}
                    </h2>
                  )
                },
                h3: ({ children, ...props }) => {
                  const id = createHeadingId(String(children))
                  return (
                    <h3
                      id={id}
                      className='text-xl font-bold mb-2 text-gray-900 dark:text-white'
                      {...props}
                    >
                      {children}
                    </h3>
                  )
                },
                h4: ({ children, ...props }) => {
                  const id = createHeadingId(String(children))
                  return (
                    <h4
                      id={id}
                      className='text-lg font-bold mb-2 text-gray-900 dark:text-white'
                      {...props}
                    >
                      {children}
                    </h4>
                  )
                },
                h5: ({ children, ...props }) => {
                  const id = createHeadingId(String(children))
                  return (
                    <h5
                      id={id}
                      className='text-base font-bold mb-2 text-gray-900 dark:text-white'
                      {...props}
                    >
                      {children}
                    </h5>
                  )
                },
                h6: ({ children, ...props }) => {
                  const id = createHeadingId(String(children))
                  return (
                    <h6
                      id={id}
                      className='text-sm font-bold mb-2 text-gray-900 dark:text-white'
                      {...props}
                    >
                      {children}
                    </h6>
                  )
                },
                p: ({ children, ...props }) => (
                  <p
                    className='mb-4 text-gray-700 dark:text-gray-300 leading-relaxed'
                    {...props}
                  >
                    {children}
                  </p>
                ),
                a: ({ href, children, ...props }) => (
                  <a
                    href={href}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 dark:text-blue-400 hover:underline'
                    {...props}
                  >
                    {children}
                  </a>
                ),
                ul: ({ children, ...props }) => (
                  <ul
                    className='list-disc list-inside mb-4 space-y-2 text-gray-700 dark:text-gray-300'
                    {...props}
                  >
                    {children}
                  </ul>
                ),
                ol: ({ children, ...props }) => (
                  <ol
                    className='list-decimal list-inside mb-4 space-y-2 text-gray-700 dark:text-gray-300'
                    {...props}
                  >
                    {children}
                  </ol>
                ),
                li: ({ children, ...props }) => (
                  <li className='text-gray-700 dark:text-gray-300' {...props}>
                    {children}
                  </li>
                ),
                blockquote: ({ children, ...props }) => (
                  <blockquote
                    className='border-l-4 border-blue-500 pl-4 italic my-4 text-gray-600 dark:text-gray-400'
                    {...props}
                  >
                    {children}
                  </blockquote>
                ),
                pre: ({ children, ...props }) => (
                  <pre
                    className='bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto my-4 text-sm'
                    {...props}
                  >
                    {children}
                  </pre>
                ),
                code: ({ className, children, ...props }: any) => {
                  const isInline = !className?.includes('language-')

                  if (isInline) {
                    return (
                      <code
                        className='bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-1 py-0.5 rounded text-sm'
                        {...props}
                      >
                        {children}
                      </code>
                    )
                  }
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                },
                table: ({ children, ...props }) => (
                  <div className='overflow-x-auto my-4'>
                    <table
                      className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'
                      {...props}
                    >
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children, ...props }) => (
                  <thead className='bg-gray-50 dark:bg-gray-800' {...props}>
                    {children}
                  </thead>
                ),
                tbody: ({ children, ...props }) => (
                  <tbody
                    className='bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700'
                    {...props}
                  >
                    {children}
                  </tbody>
                ),
                th: ({ children, ...props }) => (
                  <th
                    className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'
                    {...props}
                  >
                    {children}
                  </th>
                ),
                td: ({ children, ...props }) => (
                  <td
                    className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100'
                    {...props}
                  >
                    {children}
                  </td>
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </article>

        {/* 포스트 푸터 */}
        <footer className='mt-12 pt-8 border-t border-gray-200 dark:border-gray-700'>
          <div className='flex items-center justify-between'>
            <div className='text-sm text-gray-500 dark:text-gray-400'>
              마지막 수정: {new Date(post.date).toLocaleDateString('ko-KR')}
            </div>
            <button
              onClick={handleBack}
              className='px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors'
            >
              목록으로 돌아가기
            </button>
          </div>
        </footer>
      </div>

      {/* FloatingTOC와 FloatingChatbot 추가 */}
      {post && (
        <>
          <FloatingTOC content={post.content} />
          <FloatingChatbot postTitle={post.title} postContent={post.content} />
        </>
      )}
    </div>
  )
}
