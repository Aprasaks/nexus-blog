// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    // 요청 데이터 파싱
    const { message, postTitle, postContent } = await request.json()

    // 입력 검증
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: '메시지가 필요합니다.' },
        { status: 400 }
      )
    }

    // 시스템 프롬프트 구성
    const systemPrompt = createSystemPrompt(postTitle, postContent)

    // OpenAI API 호출
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      max_tokens: 500, // 1000 → 500으로 줄임 (비용 50% 절약)
      temperature: 0.7,
      presence_penalty: 0.1, // 반복 줄이기
      frequency_penalty: 0.1, // 다양성 증가
    })

    // 응답 추출
    const aiResponse = completion.choices[0]?.message?.content

    if (!aiResponse) {
      throw new Error('AI 응답을 받을 수 없습니다.')
    }

    // 성공 응답
    return NextResponse.json({
      response: aiResponse,
      usage: completion.usage,
    })
  } catch (error: any) {
    console.error('OpenAI API 오류:', error)

    // OpenAI API 에러 처리
    if (error?.error?.type === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'API 할당량이 부족합니다. 잠시 후 다시 시도해주세요.' },
        { status: 429 }
      )
    }

    if (error?.error?.type === 'invalid_api_key') {
      return NextResponse.json(
        { error: 'API 키가 유효하지 않습니다.' },
        { status: 401 }
      )
    }

    // 일반적인 에러
    return NextResponse.json(
      { error: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}

// 시스템 프롬프트 생성 함수
function createSystemPrompt(postTitle?: string, postContent?: string): string {
  let prompt = `당신은 E.D.I.T.H AI입니다. 개발자들을 위한 친근하고 도움이 되는 AI 어시스턴트입니다.

주요 역할:
- 기술적 질문에 대한 명확하고 실용적인 답변 제공
- 코드 예제와 실무 경험 공유
- 복잡한 개념을 이해하기 쉽게 설명
- 한국어로 친근하게 대화

답변 스타일:
- 친근하고 전문적인 톤
- 구체적인 예시 포함
- 단계별 설명 제공
- 필요시 코드 블록 사용`

  // 포스트 컨텍스트 추가
  if (postTitle && postContent) {
    // 포스트 내용을 1000자로 제한 (토큰 절약)
    const truncatedContent = postContent.slice(0, 1000)

    prompt += `

현재 사용자가 읽고 있는 포스트:
제목: "${postTitle}"

핵심 내용: ${truncatedContent}${postContent.length > 1000 ? '...' : ''}

위 포스트를 참고하여 관련 질문에 간결하고 명확하게 답변해주세요.`
  }

  return prompt
}

// GET 요청 처리 (헬스 체크)
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'E.D.I.T.H AI Chat API is running',
  })
}
