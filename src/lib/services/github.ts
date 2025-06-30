// src/lib/services/github.ts
import { GITHUB_EXCLUDE_FILES } from "../config/constants";

class GitHubService {
  private baseUrl = "https://api.github.com";
  private token: string;

  constructor() {
    this.token =
      process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN || "";
    if (!this.token) {
      console.warn("GitHub token not found. API calls may be rate limited.");
    }
  }

  private async request<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: this.token ? `Bearer ${this.token}` : "",
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "nexus-blog",
        },
        next: { revalidate: 300 },
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(
        `Request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async getRepository(owner: string, repo: string) {
    return this.request(`/repos/${owner}/${repo}`);
  }

  async getTotalCommitCount(author: string): Promise<number> {
    const result = await this.request<{ total_count: number }>(
      `/search/commits?q=author:${author}&per_page=1`,
    );
    return result.total_count;
  }

  // src/lib/services/github.ts의 해당 부분만 수정
  async getEdithDocsPosts(owner: string) {
    try {
      const treeResponse = await this.request<{
        tree: Array<{
          path: string;
          type: "blob" | "tree";
          url: string;
        }>;
      }>(`/repos/${owner}/edith-docs/git/trees/main?recursive=1`);

      const mdFiles = treeResponse.tree
        .filter((item) => {
          if (item.type !== "blob" || !item.path.endsWith(".md")) {
            return false;
          }

          const fileName = item.path.split("/").pop();
          if (!fileName) return false;

          // 명시적으로 string 타입으로 체크
          return !["README.md", "CONTRIBUTING.md"].includes(fileName);
        })
        .map((item) => ({
          name: item.path.split("/").pop() || "",
          path: item.path,
          type: "file" as const,
          size: 0,
          download_url: `https://raw.githubusercontent.com/${owner}/edith-docs/main/${item.path}`,
          html_url: `https://github.com/${owner}/edith-docs/blob/main/${item.path}`,
        }));

      return mdFiles;
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      return [];
    }
  }

  async getPostCount(owner: string): Promise<number> {
    const posts = await this.getEdithDocsPosts(owner);
    return posts.length;
  }

  async getRecentPosts(owner: string, limit = 5) {
    const posts = await this.getEdithDocsPosts(owner);
    return posts.sort((a, b) => b.name.localeCompare(a.name)).slice(0, limit);
  }
}

export const githubService = new GitHubService();
