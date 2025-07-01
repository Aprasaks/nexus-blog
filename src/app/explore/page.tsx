// src/app/explore/page.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useGitHubExplore, type PostWithContent } from "@/lib/hooks/useGitHub";

// 타입: AI가 만든 포스트
export interface GeneratedPost {
  id: string;
  title: string;
  content: string;
  timestamp: Date;
  status: "generating" | "completed" | "error";
  sourceKeyword: string;
  sourcePosts: string[];
}

interface Message {
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

export default function ExplorePage() {
  // 대화, 입력, 로딩
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: "원하는 기술/주제를 입력하면 AI가 포스트를 생성해줍니다.",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPost, setCurrentPost] = useState<GeneratedPost | null>(null);
  const chatRef = useRef<HTMLDivElement | null>(null);

  // github 포스트
  const {
    posts: githubPosts,
    isLoading: isLoadingPosts,
    error: postsError,
    searchPosts,
  } = useGitHubExplore();

  // 대화 스크롤 최신
  useEffect(() => {
    if (chatRef.current)
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, isLoading]);

  // AI 포스트 생성
  const generatePost = async (keyword: string): Promise<GeneratedPost> => {
    const postId = Date.now().toString();
    const generatingPost: GeneratedPost = {
      id: postId,
      title: `"${keyword}" 포스트 생성중...`,
      content: "",
      timestamp: new Date(),
      status: "generating",
      sourceKeyword: keyword,
      sourcePosts: [],
    };

    setCurrentPost(generatingPost);

    try {
      console.log("키워드로 포스트 검색 시작:", keyword);
      const relatedPosts = await searchPosts(keyword);
      console.log("검색된 관련 포스트 수:", relatedPosts.length);

      if (relatedPosts.length === 0) {
        console.warn("관련 포스트가 없어서 요청 안내 포스트를 생성합니다.");

        // 관련 포스트가 없을 때 요청 안내 포스트 생성
        const requestGuideContent = `# "${keyword}" 관련 포스트 요청

## 검색 결과

죄송합니다. **"${keyword}"**와 관련된 블로그 포스트가 현재 데이터베이스에 없습니다.

## 해결 방법

### 1. 다른 키워드로 검색해보세요

다음과 같은 개발 관련 키워드를 추천합니다:

#### Frontend 기술
- **React** - 컴포넌트 기반 라이브러리
- **Vue** - 점진적 프레임워크  
- **JavaScript** - 기본 언어
- **TypeScript** - 타입 안전성

#### Backend 기술
- **Node.js** - 서버사이드 JavaScript
- **Express** - Node.js 프레임워크
- **API** - REST API 설계
- **Database** - 데이터베이스 관리

#### 도구 및 기타
- **Git** - 버전 관리
- **Docker** - 컨테이너화
- **AWS** - 클라우드 서비스

### 2. 포스트 작성 요청

원하시는 주제의 포스트가 없다면, 새로운 포스트 작성을 요청하실 수 있습니다.

### 3. 키워드 제안

더 구체적인 키워드를 사용해보세요:
- 너무 짧은 키워드 대신 구체적인 기술명
- 오타가 있는지 확인
- 영어 기술명 사용 권장

## 참고사항

현재 시스템에는 주로 **웹 개발 관련 포스트**들이 저장되어 있습니다. 다른 분야의 내용을 원하신다면 관련 키워드로 다시 검색해보시기 바랍니다.`;

        const noResultPost: GeneratedPost = {
          id: postId,
          title: `"${keyword}" 관련 포스트 요청`,
          content: requestGuideContent,
          timestamp: new Date(),
          status: "completed",
          sourceKeyword: keyword,
          sourcePosts: ["포스트 없음 - 요청 필요"],
        };

        setCurrentPost(noResultPost);
        return noResultPost;
      }

      // API에 맞는 요청 데이터 형식
      const requestData = {
        message: `"${keyword}"에 대한 새로운 상세한 블로그 포스트를 마크다운 형식으로 생성해주세요. 

작성 가이드라인:
- 제목은 # 으로 시작하고, 소제목은 ## 으로 만들어주세요
- 최소 500자 이상의 구체적이고 실용적인 내용으로 작성해주세요
- 핵심 개발 용어만 영어로 사용하세요 (Router, Component, API, Framework, Repository 등)
- 일반적인 단어는 한국어로 자연스럽게 작성해주세요
- 코드 예시가 있다면 \`\`\` 코드 블록을 사용해주세요
- 실무에서 바로 활용할 수 있는 구체적인 내용으로 작성해주세요

POST_GENERATE: 방식으로 응답해주세요.`,
        posts: relatedPosts.slice(0, 3).map((post) => ({
          title: post.title,
          content: post.content,
          excerpt: post.excerpt,
          tags: post.tags,
          wordCount: post.wordCount,
        })),
      };

      console.log("API 요청 완료");

      // AI API 호출
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      console.log("API 응답 상태:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API 오류 응답:", errorText);
        throw new Error(`AI 응답 오류: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("AI 포스트 생성 성공!");

      // API 응답에서 success 확인
      if (!data.success) {
        throw new Error(data.error || "API 응답 실패");
      }

      // generatedPost가 있는지 확인
      if (!data.generatedPost || !data.generatedPost.content) {
        throw new Error("생성된 포스트 데이터가 없습니다.");
      }

      const completedPost: GeneratedPost = {
        id: postId,
        title: data.generatedPost.title || `${keyword}에 대한 포스트`,
        content: data.generatedPost.content,
        timestamp: new Date(),
        status: "completed",
        sourceKeyword: keyword,
        sourcePosts: relatedPosts.map((p) => p.title),
      };

      console.log("포스트 생성 완료:", completedPost.title);
      setCurrentPost(completedPost);
      return completedPost;
    } catch (error) {
      console.error("포스트 생성 에러:", error);

      // 모든 에러 상황에서 Mock 데이터로 대체
      console.warn("에러 발생으로 인해 Mock 데이터를 사용합니다.");
      const mockContent = `# ${keyword} 관련 정보

## 검색 결과

죄송합니다. "${keyword}"에 대한 정보를 생성하는 중 문제가 발생했습니다.

## 가능한 원인

- 관련 블로그 포스트가 데이터베이스에 없을 수 있습니다
- AI 서버 연결에 문제가 있을 수 있습니다
- 키워드가 너무 일반적이거나 구체적이지 않을 수 있습니다

## 해결 방법

다음과 같은 개발 관련 키워드로 다시 시도해보세요:

### Frontend 기술
- React
- Vue
- Angular
- JavaScript
- TypeScript

### Backend 기술  
- Node.js
- Express
- NestJS
- API

### 도구 및 기타
- Git
- Docker
- AWS
- Database

## 문의사항

계속해서 문제가 발생한다면 시스템 관리자에게 문의해주세요.

*기술적 문제로 인한 임시 콘텐츠입니다.*`;

      const errorPost: GeneratedPost = {
        id: postId,
        title: `${keyword} 관련 정보`,
        content: mockContent,
        timestamp: new Date(),
        status: "completed",
        sourceKeyword: keyword,
        sourcePosts: ["시스템 에러"],
      };
      setCurrentPost(errorPost);
      return errorPost;
    }
  };

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!inputValue.trim() || githubPosts.length === 0) return;

    const userMessage = {
      role: "user" as const,
      content: inputValue,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const keywords = inputValue
        .split(/\s+/)
        .filter(
          (word) =>
            ![
              "에",
              "대해",
              "관련",
              "포스트",
              "만들어",
              "생성",
              "해줘",
              "주세요",
              "정리",
            ].includes(word.toLowerCase()),
        );
      if (keywords.length === 0) throw new Error("키워드가 필요합니다");

      const keyword = keywords[0];
      await generatePost(keyword);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: `"${keyword}" 주제로 포스트를 생성했습니다. 우측에서 확인하세요!`,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: error instanceof Error ? error.message : "포스트 생성 실패",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 펼쳐보기: localStorage로 데이터 전달
  const handleExpandView = (post: GeneratedPost) => {
    localStorage.setItem("currentGeneratedPost", JSON.stringify(post));
  };

  // 마크다운에서 목차 추출
  const extractTableOfContents = (content: string) => {
    if (!content || content.trim() === "") {
      return [];
    }

    const lines = content.split("\n");
    const toc: { level: number; title: string; id: string }[] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // # ## ### 제목들 추출
      if (trimmedLine.startsWith("#")) {
        const match = trimmedLine.match(/^(#{1,3})\s+(.+)$/);
        if (match) {
          const level = match[1].length;
          const title = match[2].trim();
          const id = `heading-${index}`;

          toc.push({ level, title, id });
        }
      }
    });

    return toc;
  };

  // 목차 렌더링
  const renderTableOfContents = (content: string) => {
    const toc = extractTableOfContents(content);

    if (toc.length === 0) {
      return (
        <div className="text-gray-500 dark:text-gray-400 text-center py-8">
          <p>목차를 생성할 수 없습니다.</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📚 목차
        </h3>
        <div className="space-y-2">
          {toc.map((item, index) => (
            <div
              key={index}
              className={`flex items-start space-x-2 ${
                item.level === 1
                  ? "text-gray-900 dark:text-white font-medium"
                  : item.level === 2
                    ? "text-gray-700 dark:text-gray-300 ml-4"
                    : "text-gray-600 dark:text-gray-400 ml-8"
              }`}
            >
              <span className="text-blue-500 text-sm mt-1">
                {item.level === 1 ? "📖" : item.level === 2 ? "📄" : "📝"}
              </span>
              <span className="text-sm leading-relaxed">{item.title}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100vh-180px)]">
          {/* 채팅 영역 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Explore with AI
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatRef}>
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs opacity-70 mt-1 text-right">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2">
                    <span className="text-xs text-gray-500">
                      포스트 생성중...
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="주제를 입력하세요"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={
                    isLoading || isLoadingPosts || githubPosts.length === 0
                  }
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    !inputValue.trim() ||
                    isLoadingPosts ||
                    githubPosts.length === 0
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? "생성중..." : "생성"}
                </button>
              </form>
            </div>
          </div>

          {/* AI 생성 포스트 요약본 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                AI 생성 포스트
              </h2>
              {currentPost && (
                <div className="flex items-center gap-2">
                  {currentPost.status === "generating" && (
                    <span className="text-xs text-blue-600">생성중...</span>
                  )}
                  {currentPost.status === "completed" && (
                    <span className="text-xs text-green-600">완료</span>
                  )}
                  {currentPost.status === "error" && (
                    <span className="text-xs text-red-600">실패</span>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {!currentPost ? (
                <div className="h-full flex items-center justify-center text-center text-gray-500 dark:text-gray-400">
                  <p>생성된 포스트가 여기에 표시됩니다</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 포스트 제목 */}
                  <div className="mb-4">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {currentPost.title}
                    </h1>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      생성 시간: {currentPost.timestamp.toLocaleString()}
                    </div>
                  </div>

                  {/* 포스트 내용 - 목차만 표시 (포스트가 실제로 있을 때만) */}
                  {currentPost.status === "completed" &&
                    !currentPost.sourcePosts.includes(
                      "포스트 없음 - 요청 필요",
                    ) && (
                      <div className="space-y-4">
                        {/* 참고 정보 */}
                        <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
                          <p className="text-xs text-blue-700 dark:text-blue-300 mb-1">
                            <strong>📚 참고한 포스트:</strong>{" "}
                            {currentPost.sourcePosts.join(", ") || "없음"}
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            💡 {currentPost.sourceKeyword} 키워드로 생성됨 (
                            {currentPost.content.length}자)
                          </p>
                        </div>

                        {/* 목차 표시 */}
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                          {renderTableOfContents(currentPost.content)}
                        </div>

                        {/* 간단한 요약 */}
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            <strong>📄 내용 미리보기:</strong>
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {currentPost.content
                              .replace(/^#.+$/gm, "") // 제목 제거
                              .replace(/\*\*/g, "") // 볼드 제거
                              .replace(/`[^`]+`/g, "") // 코드 제거
                              .split("\n")
                              .filter((line) => line.trim().length > 10)
                              .slice(0, 2)
                              .join(" ")
                              .substring(0, 150)}
                            ...
                          </p>
                        </div>
                      </div>
                    )}

                  {/* 포스트가 없을 때 간단한 안내 */}
                  {currentPost.status === "completed" &&
                    currentPost.sourcePosts.includes(
                      "포스트 없음 - 요청 필요",
                    ) && (
                      <div className="text-center py-8">
                        <div className="mb-4">
                          <div className="text-4xl mb-3">📝</div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            관련 포스트가 없습니다
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>{currentPost.sourceKeyword}</strong> 주제의
                            포스트가 데이터베이스에 없어요
                          </p>
                        </div>
                      </div>
                    )}

                  {/* 로딩 상태 */}
                  {currentPost.status === "generating" && (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        포스트 생성중...
                      </span>
                    </div>
                  )}

                  {/* 에러 상태 */}
                  {currentPost.status === "error" && (
                    <div className="text-center py-8">
                      <div className="text-red-600 dark:text-red-400 mb-4">
                        {currentPost.content}
                      </div>
                      <button
                        onClick={() => generatePost(currentPost.sourceKeyword)}
                        className="px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
                      >
                        다시 시도
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 펼쳐보기 버튼 */}
            {currentPost && currentPost.status === "completed" && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                {/* 포스트 요청이 필요한 경우 - 요청 버튼만 */}
                {currentPost.sourcePosts.includes("포스트 없음 - 요청 필요") ? (
                  <button
                    onClick={() => {
                      alert(
                        `"${currentPost.sourceKeyword}" 주제의 포스트 작성 요청이 접수되었습니다!\n\n관리자가 검토 후 새로운 포스트를 작성해드리겠습니다.`,
                      );
                    }}
                    className="w-full block text-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                  >
                    📝 포스트 작성 요청하기
                  </button>
                ) : (
                  /* 일반적인 경우 - 펼쳐보기 버튼만 */
                  <Link
                    href={`/generated/${currentPost.id}`}
                    prefetch={false}
                    onClick={() => handleExpandView(currentPost)}
                    className="w-full block text-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    펼쳐보기
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
