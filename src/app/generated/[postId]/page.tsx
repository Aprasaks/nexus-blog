// app/generated/[postId]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Tag,
  Clock,
  Share2,
  BookOpen,
} from "lucide-react";

// GeneratedPost 타입 (explore 페이지와 동일)
interface GeneratedPost {
  id: string;
  title: string;
  content: string;
  timestamp: Date;
  status: "generating" | "completed" | "error";
  sourceKeyword: string;
  sourcePosts: string[];
}

// 마크다운을 HTML로 변환하는 함수 (개선된 버전)
const renderMarkdown = (content: string) => {
  if (!content || content.trim() === "") {
    return <p className="text-gray-500">내용이 없습니다.</p>;
  }

  const lines = content.split("\n");
  const elements: JSX.Element[] = [];
  let isInCodeBlock = false;
  let codeLanguage = "";
  let codeContent: string[] = [];
  let isInList = false;
  let listItems: JSX.Element[] = [];

  const processInlineFormatting = (text: string) => {
    // 인라인 코드 처리
    text = text.replace(
      /`([^`]+)`/g,
      '<code class="bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400 px-2 py-1 rounded text-sm font-mono">$1</code>',
    );

    // 볼드 텍스트 처리
    text = text.replace(
      /\*\*([^*]+)\*\*/g,
      '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>',
    );

    // 이탤릭 텍스트 처리
    text = text.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');

    return text;
  };

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul
          key={`list-${elements.length}`}
          className="list-disc list-inside space-y-2 mb-4 ml-4"
        >
          {listItems}
        </ul>,
      );
      listItems = [];
      isInList = false;
    }
  };

  const flushCodeBlock = (index: number) => {
    if (codeContent.length > 0) {
      elements.push(
        <div
          key={`code-${index}`}
          className="my-6 rounded-lg overflow-hidden shadow-sm"
        >
          {codeLanguage && (
            <div className="bg-gray-800 text-gray-300 px-4 py-2 text-sm font-mono border-b border-gray-700">
              {codeLanguage}
            </div>
          )}
          <pre
            className={`bg-gray-900 text-gray-100 p-4 overflow-x-auto ${!codeLanguage ? "rounded-lg" : "rounded-b-lg"}`}
          >
            <code className="font-mono text-sm leading-relaxed">
              {codeContent.join("\n")}
            </code>
          </pre>
        </div>,
      );
      codeContent = [];
      codeLanguage = "";
    }
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // 코드 블록 처리
    if (trimmedLine.startsWith("```")) {
      if (!isInCodeBlock) {
        flushList(); // 리스트가 진행 중이면 마무리
        isInCodeBlock = true;
        codeLanguage = trimmedLine.slice(3).trim();
      } else {
        isInCodeBlock = false;
        flushCodeBlock(index);
      }
      return;
    }

    if (isInCodeBlock) {
      codeContent.push(line);
      return;
    }

    // 제목 처리
    if (trimmedLine.startsWith("# ")) {
      flushList();
      elements.push(
        <h1
          key={`h1-${index}`}
          className="text-4xl font-bold text-gray-900 dark:text-white mb-6 mt-8 border-b border-gray-200 dark:border-gray-700 pb-4"
        >
          {trimmedLine.slice(2).trim()}
        </h1>,
      );
    } else if (trimmedLine.startsWith("## ")) {
      flushList();
      elements.push(
        <h2
          key={`h2-${index}`}
          className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 mt-8"
        >
          {trimmedLine.slice(3).trim()}
        </h2>,
      );
    } else if (trimmedLine.startsWith("### ")) {
      flushList();
      elements.push(
        <h3
          key={`h3-${index}`}
          className="text-xl font-medium text-gray-900 dark:text-white mb-3 mt-6"
        >
          {trimmedLine.slice(4).trim()}
        </h3>,
      );
    }
    // 리스트 처리
    else if (trimmedLine.startsWith("- ") || trimmedLine.match(/^\d+\.\s/)) {
      isInList = true;
      const listText = trimmedLine.startsWith("- ")
        ? trimmedLine.slice(2).trim()
        : trimmedLine.replace(/^\d+\.\s/, "").trim();

      listItems.push(
        <li
          key={`li-${index}`}
          className="text-gray-700 dark:text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: processInlineFormatting(listText),
          }}
        />,
      );
    }
    // 인용문 처리
    else if (trimmedLine.startsWith("> ")) {
      flushList();
      elements.push(
        <blockquote
          key={`quote-${index}`}
          className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 dark:bg-blue-900/20 italic text-gray-700 dark:text-gray-300"
        >
          {trimmedLine.slice(2).trim()}
        </blockquote>,
      );
    }
    // 구분선 처리
    else if (trimmedLine === "---" || trimmedLine === "***") {
      flushList();
      elements.push(
        <hr
          key={`hr-${index}`}
          className="my-8 border-gray-300 dark:border-gray-600"
        />,
      );
    }
    // 일반 텍스트
    else if (trimmedLine.length > 0) {
      if (isInList) {
        flushList();
      }
      elements.push(
        <p
          key={`p-${index}`}
          className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed text-base"
          dangerouslySetInnerHTML={{
            __html: processInlineFormatting(trimmedLine),
          }}
        />,
      );
    }
    // 빈 줄 처리 (리스트가 아닐 때만)
    else if (!isInList && elements.length > 0) {
      elements.push(<div key={`space-${index}`} className="mb-2"></div>);
    }
  });

  // 마지막에 남은 리스트나 코드블록 처리
  flushList();
  if (isInCodeBlock) {
    flushCodeBlock(lines.length);
  }

  return <div className="prose prose-lg max-w-none">{elements}</div>;
};

// 읽기 시간 계산 (대략 분당 200단어)
const calculateReadingTime = (content: string): number => {
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / 200);
};

export default function GeneratedPostPage({
  params,
}: {
  params: { postId: string };
}) {
  const router = useRouter();
  const [post, setPost] = useState<GeneratedPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // localStorage에서 포스트 데이터 가져오기
    const savedPost = localStorage.getItem("currentGeneratedPost");
    if (savedPost) {
      try {
        const parsedPost = JSON.parse(savedPost);
        // timestamp를 Date 객체로 변환
        parsedPost.timestamp = new Date(parsedPost.timestamp);
        setPost(parsedPost);
      } catch (error) {
        console.error("포스트 데이터 파싱 오류:", error);
      }
    }
    setIsLoading(false);
  }, [params.postId]);

  const handleShare = async () => {
    if (post) {
      try {
        await navigator.share({
          title: post.title,
          text: `${post.title} - AI가 생성한 블로그 포스트`,
          url: window.location.href,
        });
      } catch (error) {
        // Web Share API가 지원되지 않는 경우 클립보드에 복사
        navigator.clipboard.writeText(window.location.href);
        alert("링크가 클립보드에 복사되었습니다!");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            포스트를 찾을 수 없습니다
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            요청하신 포스트가 존재하지 않거나 삭제되었습니다.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            탐색으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const readingTime = calculateReadingTime(post.content);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/explore"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              탐색으로 돌아가기
            </Link>

            <button
              onClick={handleShare}
              className="inline-flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Share2 className="w-4 h-4 mr-2" />
              공유하기
            </button>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 포스트 메타 정보 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {post.timestamp.toLocaleDateString("ko-KR")}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />약 {readingTime}분 읽기
            </div>
            <div className="flex items-center">
              <BookOpen className="w-4 h-4 mr-1" />
              {post.content.length.toLocaleString()}자
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center">
              <Tag className="w-4 h-4 mr-1 text-blue-600" />
              <span className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                {post.sourceKeyword}
              </span>
            </div>

            {post.sourcePosts.length > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                참고: {post.sourcePosts.join(", ")}
              </div>
            )}
          </div>
        </div>

        {/* 포스트 내용 */}
        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
          <div className="markdown-content">{renderMarkdown(post.content)}</div>
        </article>

        {/* AI 생성 안내 */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="text-blue-600 dark:text-blue-400 text-lg">🤖</div>
            <div>
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                AI 생성 콘텐츠 안내
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                이 포스트는 기존 블로그 글들을 참고하여 AI가 생성한
                콘텐츠입니다. 정확성을 위해 참고 자료와 함께 검토해보시기
                바랍니다.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
