// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";

interface ChatRequest {
  message: string;
  posts: Array<{
    title: string;
    content: string;
    excerpt: string;
    tags: string[];
    wordCount: number;
  }>;
}

interface OllamaResponse {
  response: string;
  done: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { message, posts } = (await request.json()) as ChatRequest;

    // 포스트 데이터를 AI가 이해할 수 있도록 컨텍스트 생성
    const postsContext = posts
      .slice(0, 10)
      .map(
        (post) =>
          `제목: ${post.title}\n내용: ${post.excerpt}\n태그: ${post.tags.join(", ")}\n단어수: ${post.wordCount}`,
      )
      .join("\n\n---\n\n");

    // AI 프롬프트 생성
    const prompt = `당신은 블로그 포스트 분석 및 생성 전문 AI입니다. 사용자의 질문에 대해 주어진 블로그 포스트들을 분석하여 답변해주세요.

블로그 포스트 데이터:
${postsContext}

사용자 질문: ${message}

다음 중 하나의 방식으로 답변해주세요:

1. 포스트 목록 요청시: 간단하게 포스트들을 나열해주세요.
2. 특정 주제 검색시: 관련 포스트를 찾아서 설명해주세요.
3. 포스트 생성 요청시: "POST_GENERATE:" 로 시작하여 새로운 포스트를 마크다운 형식으로 생성해주세요.

답변은 한국어로 친근하게 해주세요.`;

    // Ollama API 호출
    const ollamaResponse = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen2.5:3b",
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 1000,
        },
      }),
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama API error: ${ollamaResponse.statusText}`);
    }

    const data = (await ollamaResponse.json()) as OllamaResponse;

    // 포스트 생성 요청인지 확인
    let generatedPost = null;
    let aiResponse = data.response;

    if (data.response.includes("POST_GENERATE:")) {
      const postContent = data.response.split("POST_GENERATE:")[1].trim();

      // 제목 추출 (첫 번째 # 라인)
      const titleMatch = postContent.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : "생성된 포스트";

      generatedPost = {
        title,
        content: postContent,
        id: Date.now().toString(),
      };

      aiResponse = `✨ 새로운 포스트를 생성했습니다! 우측에서 확인해보세요.`;
    }

    return NextResponse.json({
      response: aiResponse,
      generatedPost,
      success: true,
    });
  } catch (error) {
    console.error("Chat API Error:", error);

    return NextResponse.json(
      {
        response:
          "죄송합니다. AI 응답 생성 중 오류가 발생했습니다. Ollama 서버가 실행 중인지 확인해주세요.",
        generatedPost: null,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
