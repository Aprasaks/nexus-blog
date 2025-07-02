// src/lib/services/github.ts

export interface BlogPost {
  id: string
  title: string
  excerpt: string
  date: string
  category: string
  content: string
  slug: string
}

interface GitHubFile {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string
  type: string
  content?: string
  encoding?: string
}

class GitHubService {
  private readonly baseUrl = 'https://api.github.com'
  private readonly owner = 'Aprasaks' // GitHub 사용자명으로 변경
  private readonly repo = 'edith-docs' // 레포지토리명으로 변경
  private readonly branch = 'main'

  async convertToBlogPost(file: GitHubFile): Promise<BlogPost | null> {
    try {
      if (!file.download_url) {
        console.warn(`파일 ${file.name}에 download_url이 없습니다.`)
        return null
      }

      const response = await fetch(file.download_url)
      if (!response.ok) {
        console.warn(`파일 ${file.name} 다운로드 실패: ${response.status}`)
        return null
      }

      const content = await response.text()
      const { metadata, content: postContent } = this.parseFrontmatter(content)

      // 필수 필드 검증
      if (!metadata.title || !metadata.date) {
        console.warn(`파일 ${file.name}에 필수 메타데이터가 없습니다.`)
        return null
      }

      return {
        id: file.sha,
        title: metadata.title,
        excerpt: metadata.excerpt || postContent.slice(0, 150) + '...',
        date: metadata.date,
        category: metadata.category || 'uncategorized',
        content: postContent,
        slug: file.name.replace('.md', ''),
      }
    } catch (error) {
      console.error(`파일 ${file.name} 변환 중 오류:`, error)
      return null
    }
  }

  private parseFrontmatter(content: string): {
    metadata: any
    content: string
  } {
    const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/
    const match = content.match(frontmatterRegex)

    if (!match) {
      return { metadata: {}, content }
    }

    try {
      // 간단한 YAML 파싱 (프로덕션에서는 yaml 라이브러리 사용 권장)
      const yamlContent = match[1] || ''
      const metadata: any = {}

      yamlContent.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':')
        if (colonIndex > 0) {
          const key = line.slice(0, colonIndex).trim()
          const value = line
            .slice(colonIndex + 1)
            .trim()
            .replace(/^['"]|['"]$/g, '')
          metadata[key] = value
        }
      })

      return { metadata, content: match[2] || content }
    } catch (error) {
      console.warn('Frontmatter 파싱 실패:', error)
      return { metadata: {}, content: match[2] || content }
    }
  }

  async getAllMarkdownFiles(): Promise<GitHubFile[]> {
    try {
      const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/posts?ref=${this.branch}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`GitHub API 오류: ${response.status}`)
      }

      const files: GitHubFile[] = await response.json()
      return files.filter(file => file.name.endsWith('.md'))
    } catch (error) {
      console.error('GitHub에서 파일 목록을 가져오는 중 오류:', error)
      throw error
    }
  }

  async getAllPosts(): Promise<BlogPost[]> {
    try {
      console.log('🔍 GitHub에서 마크다운 파일 검색 중...')

      const markdownFiles = await this.getAllMarkdownFiles()
      console.log(`📝 찾은 마크다운 파일: ${markdownFiles.length}개`)

      if (markdownFiles.length === 0) {
        console.warn('⚠️ 마크다운 파일을 찾을 수 없습니다.')
        return []
      }

      console.log('🔄 파일 내용 다운로드 중...')
      const postsResults = await Promise.all(
        markdownFiles.map((file: GitHubFile) => this.convertToBlogPost(file))
      )

      // null 값 제거 (올바른 타입 가드 적용)
      const posts = postsResults.filter((post): post is BlogPost => {
        return post !== null && post !== undefined
      })

      console.log(
        `📊 루트 파일 제외/필터링: ${markdownFiles.length - posts.length}개`
      )

      // 날짜별 정렬 (최신순)
      const sortedPosts = posts.sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0
        const dateB = b.date ? new Date(b.date).getTime() : 0
        return dateB - dateA
      })

      console.log(`✅ 블로그 포스트 ${sortedPosts.length}개 로드 완료`)
      return sortedPosts
    } catch (error) {
      console.error('❌ GitHub API 오류:', error)
      throw error
    }
  }
}

export const githubService = new GitHubService()
