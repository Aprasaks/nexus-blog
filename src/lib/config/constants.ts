// src/lib/config/constants.ts

// GitHub 설정
export const GITHUB_CONFIG = {
  owner: "Aprasaks",
  repo: "nexus-blog",
} as const;

// 애니메이션 설정
export const ANIMATION_CONFIG = {
  duration: 2000,
  interval: 50,
  counterDuration: 30,
  counterInterval: 50,
} as const;

// E.D.I.T.H 시작일
export const START_DATE = new Date("2025-06-01");

// 월/요일 이름
export const MONTH_NAMES = [
  "1월",
  "2월",
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
  "10월",
  "11월",
  "12월",
] as const;

export const WEEK_DAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

// GitHub 제외 파일 목록
export const GITHUB_EXCLUDE_FILES = ["README.md", "CONTRIBUTING.md"] as const;

// 카테고리별 아이콘 매핑
export const CATEGORY_ICONS: Record<string, string> = {
  GIT: "🌿",
  NEXTJS: "⚡",
  REACT: "⚛️",
  DOCS: "📄",
  DEFAULT: "📝",
} as const;
