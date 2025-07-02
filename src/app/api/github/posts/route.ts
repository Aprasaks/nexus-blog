// app/api/github/posts/route.ts

import { NextResponse } from 'next/server'

// GitHub API 인터페이스
interface GitHubFile {
  name: string
  path: string
  sha: string
  size: number
  download_url: string
  type: 'file' | 'dir'
}

interface BlogPost {
  id: string
  title: string
  content: string
  excerpt: string
  category: string
  date: string
  slug: string
  path: string
}

class SecureGitHubService {
  private readonly owner = 'Aprasaks'
  private readonly repo = 'edith-docs'
  private readonly baseUrl = 'https://api.github.com'

  // 안전한 헤더 생성 (서버에서만 실행)
  private getHeaders() {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'EDITH-Blog-Server',
    }

    // 서버 환경변수에서 토큰 가져오기
    const token = process.env.GITHUB_TOKEN
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
      console.log('🔑 GitHub 토큰 사용 중 (서버)')
    } else {
      console.warn('⚠️ GITHUB_TOKEN이 환경변수에 없습니다!')
    }

    return headers
  }

  // 디렉토리 내용 가져오기
  async getDirectoryContents(path: string = ''): Promise<GitHubFile[]> {
    const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}`

    try {
      const response = await fetch(url, {
        headers: this.getHeaders(),
        next: { revalidate: 300 }, // 5분 캐시
      })

      if (!response.ok) {
        const remaining = response.headers.get('X-RateLimit-Remaining')
        const reset = response.headers.get('X-RateLimit-Reset')
        console.error(`GitHub API Error: ${response.status}`)
        console.error(`Rate Limit Remaining: ${remaining}`)

        if (reset) {
          const resetTime = new Date(parseInt(reset) * 1000)
          console.error(`Rate Limit Reset: ${resetTime.toLocaleString()}`)
        }

        throw new Error(
          `GitHub API Error: ${response.status} - Rate Limit: ${remaining}`
        )
      }

      const data = await response.json()
      return Array.isArray(data) ? data : [data]
    } catch (error) {
      console.error('Error fetching directory:', error)
      throw error
    }
  }

  // 모든 마크다운 파일 재귀적으로 찾기
  async getAllMarkdownFiles(path: string = ''): Promise<GitHubFile[]> {
    const contents = await this.getDirectoryContents(path)
    const markdownFiles: GitHubFile[] = []

    for (const item of contents) {
      if (item.type === 'file' && item.name.endsWith('.md')) {
        markdownFiles.push(item)
      } else if (item.type === 'dir') {
        const subFiles = await this.getAllMarkdownFiles(item.path)
        markdownFiles.push(...subFiles)
      }
    }

    return markdownFiles
  }

  // 파일 내용 가져오기
  async getFileContent(downloadUrl: string): Promise<string> {
    try {
      const response = await fetch(downloadUrl, {
        headers: this.getHeaders(),
        next: { revalidate: 300 }, // 5분 캐시
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status}`)
      }

      return await response.text()
    } catch (error) {
      console.error('Error fetching file content:', error)
      return ''
    }
  }

  // frontmatter 파싱
  private parseFrontmatter(content: string) {
    const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/
    const match = content.match(frontmatterRegex)

    if (!match) {
      return { metadata: {}, content }
    }

    const [, frontmatter, body] = match
    const metadata: Record<string, any> = {}

    frontmatter.split('\n').forEach(line => {
      const colonIndex = line.indexOf(':')
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim()
        const value = line
          .substring(colonIndex + 1)
          .trim()
          .replace(/['"]/g, '')
        metadata[key] = value
      }
    })

    return { metadata, content: body }
  }

  // 카테고리 추출
  private extractCategory(path: string): string | null {
    const parts = path.split('/')
    return parts.length > 1 ? parts[0] : null
  }

  // 제목 추출
  private extractTitle(filename: string, metadata: any): string {
    if (metadata.title) return metadata.title

    return filename
      .replace('.md', '')
      .replace(/^\d+-/, '')
      .replace(/[-_]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // 요약 생성
  private generateExcerpt(content: string): string {
    const cleanContent = content
      .replace(/^#.+$/gm, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`[^`]+`/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\n+/g, ' ')
      .trim()

    return (
      cleanContent.substring(0, 150) + (cleanContent.length > 150 ? '...' : '')
    )
  }

  // 블로그 포스트로 변환
  async convertToBlogPost(file: GitHubFile): Promise<BlogPost | null> {
    const category = this.extractCategory(file.path)

    if (!category) {
      return null
    }

    const content = await this.getFileContent(file.download_url)
    const { metadata, content: body } = this.parseFrontmatter(content)

    return {
      id: file.sha,
      title: this.extractTitle(file.name, metadata),
      content: body,
      excerpt: this.generateExcerpt(body),
      category: category,
      date: metadata.date || new Date().toISOString().split('T')[0],
      slug: file.path.replace(/\.md$/, '').replace(/\//g, '-'),
      path: file.path,
    }
  }

  // 모든 블로그 포스트 가져오기
  async getAllPosts(): Promise<BlogPost[]> {
    try {
      console.log('🔍 서버에서 GitHub 마크다운 파일 검색 중...')

      const markdownFiles = await this.getAllMarkdownFiles()
      console.log(`📄 찾은 마크다운 파일: ${markdownFiles.length}개`)

      if (markdownFiles.length === 0) {
        console.warn('⚠️ 마크다운 파일을 찾을 수 없습니다.')
        return []
      }

      console.log('📥 파일 내용 다운로드 중...')
      const postsResults = await Promise.all(
        markdownFiles.map(file => this.convertToBlogPost(file))
      )

      const posts = postsResults.filter(
        (post): post is BlogPost => post !== null
      )

      console.log(
        `🗂️ 루트 파일 제외됨: ${markdownFiles.length - posts.length}개`
      )

      const sortedPosts = posts.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )

      console.log(`✅ 블로그 포스트 ${sortedPosts.length}개 로드 완료`)
      return sortedPosts
    } catch (error) {
      console.error('❌ GitHub API 오류:', error)
      throw error
    }
  }
}

// 서비스 인스턴스 생성
const secureGitHubService = new SecureGitHubService()

// GET 요청 핸들러
export async function GET() {
  try {
    const posts = await secureGitHubService.getAllPosts()

    return NextResponse.json({
      success: true,
      posts,
      count: posts.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('API Route Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        posts: [],
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
