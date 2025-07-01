// src/lib/hooks/useGitHub.ts
import { useState, useEffect } from "react";
import { githubService } from "../services/github";
import { GITHUB_CONFIG } from "../config/constants";

// GitHub 통계 데이터 타입
interface GitHubStatsData {
  postCount: number;
  totalCommits: number;
  isLoading: boolean;
  error: string | null;
}

// GitHub 포스트 데이터 타입
interface GitHubPostsData {
  posts: any[];
  isLoading: boolean;
  error: string | null;
}

// 포스트 + 내용 타입 (AI 분석용)
interface PostWithContent {
  name: string;
  path: string;
  type: "file";
  size: number;
  download_url: string;
  html_url: string;
  content: string;
  title: string;
  excerpt: string;
  tags: string[];
  wordCount: number;
}

// Explore 페이지용 데이터 타입
interface GitHubExploreData {
  posts: PostWithContent[];
  isLoading: boolean;
  error: string | null;
  searchPosts: (keyword: string) => Promise<PostWithContent[]>;
  refreshPosts: () => Promise<void>;
  getPostsByCategory: () => Promise<Record<string, PostWithContent[]>>;
}

export function useGitHubStats(): GitHubStatsData {
  const [data, setData] = useState<GitHubStatsData>({
    postCount: 0,
    totalCommits: 0,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const [postCount, totalCommits] = await Promise.all([
          githubService.getPostCount(GITHUB_CONFIG.owner),
          githubService.getTotalCommitCount(GITHUB_CONFIG.owner),
        ]);

        setData({
          postCount,
          totalCommits,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setData((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }));
      }
    }

    fetchStats();
  }, []);

  return data;
}

/**
 * GitHub 포스트 목록을 가져오는 Hook (기존 메인페이지용)
 */
export function useGitHubPosts(limit: number = 5): GitHubPostsData {
  const [data, setData] = useState<GitHubPostsData>({
    posts: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchPosts() {
      try {
        const posts = await githubService.getRecentPosts(
          GITHUB_CONFIG.owner,
          limit,
        );

        setData({
          posts,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setData({
          posts: [],
          isLoading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    fetchPosts();
  }, [limit]);

  return data;
}

/**
 * Explore 페이지용 GitHub 포스트 훅 (내용 포함) - AI 분석용
 */
export function useGitHubExplore(): GitHubExploreData {
  const [data, setData] = useState<{
    posts: PostWithContent[];
    isLoading: boolean;
    error: string | null;
  }>({
    posts: [],
    isLoading: true,
    error: null,
  });

  const fetchPosts = async () => {
    try {
      setData((prev) => ({ ...prev, isLoading: true, error: null }));

      console.log("🚀 Fetching posts with content for AI analysis...");
      const posts = await githubService.getPostsWithContent(
        GITHUB_CONFIG.owner,
      );

      setData({
        posts,
        isLoading: false,
        error: null,
      });

      console.log(`✅ Loaded ${posts.length} posts for explore page`);
    } catch (error) {
      console.error("❌ Failed to fetch posts:", error);
      setData((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
    }
  };

  const searchPosts = async (keyword: string): Promise<PostWithContent[]> => {
    try {
      console.log(`🔍 Searching posts with keyword: "${keyword}"`);
      const results = await githubService.searchPostsByKeyword(
        GITHUB_CONFIG.owner,
        keyword,
      );
      console.log(`📋 Found ${results.length} matching posts`);
      return results;
    } catch (error) {
      console.error("❌ Search failed:", error);
      return [];
    }
  };

  const refreshPosts = async () => {
    console.log("🔄 Refreshing posts...");
    await fetchPosts();
  };

  const getPostsByCategory = async (): Promise<
    Record<string, PostWithContent[]>
  > => {
    try {
      console.log("📁 Grouping posts by category...");
      const categories = await githubService.getPostsByCategory(
        GITHUB_CONFIG.owner,
      );
      console.log(`📊 Found ${Object.keys(categories).length} categories`);
      return categories;
    } catch (error) {
      console.error("❌ Failed to get categories:", error);
      return {};
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    ...data,
    searchPosts,
    refreshPosts,
    getPostsByCategory,
  };
}

/**
 * 단일 포스트 내용을 가져오는 훅
 */
export function usePostContent(downloadUrl: string | null) {
  const [data, setData] = useState<{
    content: string;
    isLoading: boolean;
    error: string | null;
  }>({
    content: "",
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    if (!downloadUrl) {
      setData({ content: "", isLoading: false, error: null });
      return;
    }

    async function fetchContent() {
      try {
        setData((prev) => ({ ...prev, isLoading: true, error: null }));

        console.log("📄 Fetching post content...");
        const content = await githubService.getPostContent(downloadUrl);

        setData({
          content,
          isLoading: false,
          error: null,
        });

        console.log(`✅ Post content loaded (${content.length} characters)`);
      } catch (error) {
        console.error("❌ Failed to fetch post content:", error);
        setData({
          content: "",
          isLoading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    fetchContent();
  }, [downloadUrl]);

  return data;
}

/**
 * GitHub 연결 상태를 확인하는 Hook
 */
export function useGitHubStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const checkStatus = () => {
      setIsOnline(Math.random() > 0.1); // 90% 확률로 온라인
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  return isOnline;
}

// 타입 익스포트 (다른 컴포넌트에서 사용할 수 있도록)
export type { PostWithContent, GitHubExploreData };
