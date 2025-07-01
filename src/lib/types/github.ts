// src/lib/types/github.ts

// GitHub Repository 정보
export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  private: boolean
  created_at: string
  updated_at: string
  stargazers_count: number
  forks_count: number
  description?: string
}

// GitHub Commit 정보
export interface GitHubCommit {
  sha: string
  commit: {
    author: {
      name: string
      email: string
      date: string
    }
    message: string
  }
  author: {
    login: string
    avatar_url: string
  } | null
}

// GitHub 파일/폴더 정보
export interface GitHubContent {
  name: string
  path: string
  type: 'file' | 'dir'
  size: number
  download_url: string | null
  html_url: string
}

// GitHub 검색 결과 (커밋)
export interface GitHubCommitSearchResult {
  total_count: number
  incomplete_results: boolean
  items: GitHubCommit[]
}

// Hook용 데이터 타입들
export interface GitHubStatsData {
  postCount: number
  totalCommits: number
  isLoading: boolean
  error: string | null
}

export interface GitHubPostsData {
  posts: GitHubContent[]
  isLoading: boolean
  error: string | null
}

// 에러 클래스
export class GitHubApiError extends Error {
  public status: number
  public url: string

  constructor(data: { message: string; status: number; url: string }) {
    super(data.message)
    this.name = 'GitHubApiError'
    this.status = data.status
    this.url = data.url
  }
}
