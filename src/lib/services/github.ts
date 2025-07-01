// src/lib/services/github.ts
import { GITHUB_EXCLUDE_FILES } from '../config/constants'

class GitHubService {
  private baseUrl = 'https://api.github.com'
  private token: string
  private postsCache: any[] = [] // ⚡ 캐시 추가

  constructor() {
    this.token =
      process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN || ''
    if (!this.token) {
      console.warn('GitHub token not found. API calls may be rate limited.')
    }
  }

  private async request<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: this.token ? `Bearer ${this.token}` : '',
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'nexus-blog',
        },
        next: { revalidate: 300 },
      })

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      throw new Error(
        `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async getRepository(owner: string, repo: string) {
    return this.request(`/repos/${owner}/${repo}`)
  }

  async getTotalCommitCount(author: string): Promise<number> {
    const result = await this.request<{ total_count: number }>(
      `/search/commits?q=author:${author}&per_page=1`
    )
    return result.total_count
  }

  async getEdithDocsPosts(owner: string) {
    try {
      const treeResponse = await this.request<{
        tree: Array<{
          path: string
          type: 'blob' | 'tree'
          url: string
        }>
      }>(`/repos/${owner}/edith-docs/git/trees/main?recursive=1`)

      const mdFiles = treeResponse.tree
        .filter(item => {
          if (item.type !== 'blob' || !item.path.endsWith('.md')) {
            return false
          }

          const fileName = item.path.split('/').pop()
          if (!fileName) return false

          // 명시적으로 string 타입으로 체크
          return !['README.md', 'CONTRIBUTING.md'].includes(fileName)
        })
        .map(item => ({
          name: item.path.split('/').pop() || '',
          path: item.path,
          type: 'file' as const,
          size: 0,
          download_url: `https://raw.githubusercontent.com/${owner}/edith-docs/main/${item.path}`,
          html_url: `https://github.com/${owner}/edith-docs/blob/main/${item.path}`,
        }))

      return mdFiles
    } catch (error) {
      console.error('Failed to fetch posts:', error)
      return []
    }
  }

  async getPostCount(owner: string): Promise<number> {
    const posts = await this.getEdithDocsPosts(owner)
    return posts.length
  }

  async getRecentPosts(owner: string, limit = 5) {
    const posts = await this.getEdithDocsPosts(owner)
    return posts.sort((a, b) => b.name.localeCompare(a.name)).slice(0, limit)
  }

  /**
   * 포스트의 실제 마크다운 내용을 가져옵니다
   */
  async getPostContent(downloadUrl: string): Promise<string> {
    try {
      const response = await fetch(downloadUrl, {
        headers: {
          Authorization: this.token ? `Bearer ${this.token}` : '',
          Accept: 'application/vnd.github.v3.raw',
          'User-Agent': 'nexus-blog',
        },
        next: { revalidate: 300 },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch post content: ${response.statusText}`)
      }

      return await response.text()
    } catch (error) {
      console.error('Error fetching post content:', error)
      return ''
    }
  }

  /**
   * ⚡ 빠른 버전: 처음 몇 개만 우선 로딩
   */
  async getPostsWithContent(owner: string, fastMode: boolean = true) {
    try {
      // 캐시 확인
      if (this.postsCache.length > 0) {
        console.log('⚡ Using cached posts')
        return this.postsCache
      }

      const posts = await this.getEdithDocsPosts(owner)
      console.log(`📚 Found ${posts.length} posts`)

      if (fastMode) {
        // ⚡ 빠른 모드: 처음 3개만 우선 로딩
        const priorityPosts = posts.slice(0, 3)
        console.log(
          `⚡ Fast mode: Loading first ${priorityPosts.length} posts quickly`
        )

        const results = await Promise.allSettled(
          priorityPosts.map(async post => {
            const content = await this.getPostContent(post.download_url)
            const title =
              this.extractTitle(content) || post.name.replace('.md', '')
            const excerpt = this.extractExcerpt(content, 100) // ⚡ 더 짧게
            const tags = this.extractTags(content)

            return {
              ...post,
              content: content.substring(0, 300), // ⚡ 내용 길이 제한
              title,
              excerpt,
              tags,
              wordCount: content.split(/\s+/).filter(word => word.length > 0)
                .length,
            }
          })
        )

        const successResults = results
          .filter(
            (result): result is PromiseFulfilledResult<any> =>
              result.status === 'fulfilled'
          )
          .map(result => result.value)

        // 나머지 포스트는 메타데이터만 (내용 없이)
        const remainingPosts = posts.slice(3).map(post => ({
          ...post,
          content: '', // 빈 내용
          title: post.name.replace('.md', ''),
          excerpt: '클릭하면 전체 내용을 확인할 수 있습니다.',
          tags: [],
          wordCount: 0,
        }))

        const allResults = [...successResults, ...remainingPosts]
        this.postsCache = allResults // 캐시 저장

        console.log(
          `⚡ Quick loaded ${successResults.length} posts with content, ${remainingPosts.length} as metadata only`
        )
        return allResults
      } else {
        // 🐌 전체 모드: 모든 포스트 내용 로딩
        console.log(
          `🐌 Full mode: Loading all ${posts.length} posts with content`
        )

        const batchSize = 3
        const results = []

        for (let i = 0; i < posts.length; i += batchSize) {
          const batch = posts.slice(i, i + batchSize)

          const batchResults = await Promise.allSettled(
            batch.map(async post => {
              const content = await this.getPostContent(post.download_url)
              const title =
                this.extractTitle(content) || post.name.replace('.md', '')
              const excerpt = this.extractExcerpt(content)
              const tags = this.extractTags(content)

              return {
                ...post,
                content,
                title,
                excerpt,
                tags,
                wordCount: content.split(/\s+/).filter(word => word.length > 0)
                  .length,
              }
            })
          )

          results.push(...batchResults)
          console.log(
            `📖 Processed ${Math.min(i + batchSize, posts.length)}/${posts.length} posts`
          )
        }

        const successfulResults = results
          .filter(
            (result): result is PromiseFulfilledResult<any> =>
              result.status === 'fulfilled'
          )
          .map(result => result.value)

        this.postsCache = successfulResults // 캐시 저장
        console.log(`✅ Full loaded ${successfulResults.length} posts`)
        return successfulResults
      }
    } catch (error) {
      console.error('Failed to fetch posts with content:', error)
      return []
    }
  }

  /**
   * ⚡ 빠른 검색: 로컬 필터링 (API 호출 없음)
   */
  async searchPostsByKeyword(owner: string, keyword: string) {
    // 캐시된 포스트에서 검색
    const allPosts =
      this.postsCache.length > 0
        ? this.postsCache
        : await this.getPostsWithContent(owner, true) // 빠른 모드로 로딩

    const searchTerm = keyword.toLowerCase()

    const filteredPosts = allPosts.filter(post => {
      const searchableText = [
        post.title,
        post.content,
        post.excerpt,
        ...post.tags,
      ]
        .join(' ')
        .toLowerCase()

      return searchableText.includes(searchTerm)
    })

    console.log(`🔍 Found ${filteredPosts.length} posts matching "${keyword}"`)
    return filteredPosts
  }

  /**
   * 카테고리별로 포스트를 그룹화합니다
   */
  async getPostsByCategory(owner: string) {
    const allPosts =
      this.postsCache.length > 0
        ? this.postsCache
        : await this.getPostsWithContent(owner, true)

    const categories: Record<string, any[]> = {}

    allPosts.forEach(post => {
      const pathParts = post.path.split('/')
      const category = pathParts.length > 1 ? pathParts[0] : 'uncategorized'

      if (!categories[category]) {
        categories[category] = []
      }
      categories[category].push(post)
    })

    return categories
  }

  /**
   * ⚡ 캐시 새로고침
   */
  async refreshCache(owner: string) {
    console.log('🔄 Refreshing cache...')
    this.postsCache = []
    return await this.getPostsWithContent(owner, false) // 전체 모드로 새로고침
  }

  /**
   * 마크다운에서 제목 추출
   */
  private extractTitle(content: string): string | null {
    const titleMatch = content.match(/^#\s+(.+)$/m)
    return titleMatch ? titleMatch[1].trim() : null
  }

  /**
   * 마크다운에서 요약 추출 (첫 번째 문단)
   */
  private extractExcerpt(content: string, maxLength: number = 150): string {
    // ⚡ 기본값 줄임
    const withoutTitle = content.replace(/^#.+$/m, '').trim()
    const withoutMeta = withoutTitle.replace(/^---[\s\S]*?---/m, '').trim()

    const firstParagraph = withoutMeta.split('\n\n')[0]

    if (!firstParagraph || firstParagraph.length === 0) {
      return ''
    }

    if (firstParagraph.length <= maxLength) {
      return firstParagraph
    }

    return firstParagraph.substring(0, maxLength) + '...'
  }

  /**
   * 마크다운에서 태그 추출
   */
  private extractTags(content: string): string[] {
    const tags: string[] = []

    // 프론트매터에서 태그 찾기
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1]
      const tagsMatch = frontmatter.match(/tags:\s*\[(.*?)\]/)
      if (tagsMatch) {
        tags.push(
          ...tagsMatch[1].split(',').map(tag => tag.trim().replace(/['"]/g, ''))
        )
      }
    }

    // 해시태그 찾기
    const hashtagMatches = content.match(/#[a-zA-Z][a-zA-Z0-9]*/g)
    if (hashtagMatches) {
      tags.push(...hashtagMatches.map(tag => tag.substring(1)))
    }

    return [...new Set(tags)]
  }
}

export const githubService = new GitHubService()
