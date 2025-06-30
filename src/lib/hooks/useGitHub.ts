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
 * GitHub 포스트 목록을 가져오는 Hook
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
