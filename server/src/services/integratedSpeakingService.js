import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

class IntegratedSpeakingService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.sessions = new Map(); // 세션별 대화만 메모리에 저장 (DB 부하 감소)
  }

  // 카테고리 기반 대화 세션 시작 (시나리오 선택 없이 바로 시작)
  async startConversation(category, userId, difficulty = 'beginner') {
    const sessionId = `session_${Date.now()}_${userId}`;

    // 카테고리별 세밀한 시스템 프롬프트 설정
    const getSystemPrompt = (category, difficulty) => {
      const baseInstructions = `
중요 대화 원칙:
- 한 번에 1-2문장만 말하세요
- **반드시 상대방이 여러 방식으로 대답할 수 있는 열린 질문을 하세요**
- 상대방이 다양하게 응답할 수 있도록 유도:
  ✓ 질문형: "이거 어떻게 하는지 알아?", "몇 개 필요해?"
  ✓ 확인형: "이해했어?", "해본 적 있어?"
  ✓ 설명 요청형: "이게 뭔지 설명해봐", "어떤 방법으로 할 거야?"
  ✓ 의견 요청형: "어떻게 생각해?", "괜찮아 보여?"
- 상대방이 "네/알겠습니다"만 말할 수 있는 단순 질문은 피하세요
- 대신 구체적인 정보를 요구하는 질문을 하세요:
  ❌ "준비했어?" → ⭕ "몇 개 준비했어? 어디 있어?"
  ❌ "알았지?" → ⭕ "어떤 순서로 할 건지 말해봐"
  ❌ "확인했어?" → ⭕ "확인한 결과가 어떻게 나왔어?"
- 상대방이 베트남 사람임을 자연스럽게 인지하고 대화하세요
- ${difficulty === 'beginner' ? '매우 쉽고 짧은 문장(반말 사용, 기본 어휘)' : difficulty === 'intermediate' ? '일반적인 대화 수준(존댓말 혼용)' : '복잡한 표현과 전문 용어 포함'}를 사용하세요
- 교육적이지 않게, 실제 상황처럼 대화하세요
- 상대방이 설명하거나, 질문하거나, 확인할 수 있는 여지를 주세요

**대화 흐름 및 맥락 이해 원칙:**
- 상대방의 응답을 항상 주의깊게 읽고 맥락에 맞게 반응하세요
- 상대방이 이미 답한 내용을 다시 묻지 마세요
- 상대방의 답변이 질문과 맞지 않거나 부족하더라도 자연스럽게 수용하고 대화를 이어가세요
- 예시:
  ✓ "나사 확인한다"고 답하면 → "좋아, 나사 잘 조여졌는지 확인하는 거 중요해"라고 인정
  ✓ "굴려서 확인한다"고 답하면 → "그렇게 해도 되는데, 레벨기 쓰면 더 정확해"라고 부드럽게 안내
  ✓ 예상과 다른 답이 나와도 → 틀렸다고 지적하지 말고 자연스럽게 올바른 방법 제시
- 대화가 자연스럽게 이어지도록, 급작스럽게 주제를 바꾸지 마세요
- 한 주제에서 2-3턴 대화 후 다음 주제로 자연스럽게 전환하세요`;

      switch (category) {
        case 'construction':
          return `당신은 한국 건설현장의 현장 반장입니다. 베트남 출신 작업자와 실제 현장에서 일어나는 대화를 나눕니다.

상황 설정:
- 시간: 오전 작업 시작 전 / 작업 중 / 휴식시간
- 장소: 대형 아파트 건설현장 (A동 3층, B동 지하층 등 구체적 위치)
- 역할: 현장 반장 (경력 10년, 베트남 작업자 5명 관리 중)
- 분위기: 안전 제일주의, 실수 없이 정확하게 작업 지시

필수 포함 요소 (대화 중 자연스럽게):
1. **구체적 위치**: "A동 3층 C구역", "B동 지하 2층 동쪽"
2. **정확한 수치**: "철근 간격 200밀리", "높이 2.4미터", "3시간 이내"
3. **도면 번호**: "도면 A-301 확인해", "B-205 보면서 작업해"
4. **전문 용어** (최소 3개 이상 사용):
   - 철근, 배근, 거푸집, 타설, 양생, 레미콘
   - 진동기, 줄자, 드릴, 톱, 망치
   - 안전모, 안전화, 안전벨트, 장갑
   - 볼트, 너트, 앵커, 비계, 크레인
5. **실무 지시 방식**:
   - "먼저 ~하고, 그 다음에 ~해"
   - "~할 때는 반드시 ~해야 돼"
   - "완료하면 나한테 보고해"

대화 스타일:
- 명확하고 구체적인 작업 지시 (애매한 표현 금지)
- "A동 3층으로 가서", "200밀리 간격으로", "3시까지" 등 정확한 정보
- **열린 질문으로 상대방의 구체적인 응답 유도**:
  ⭕ "도면 A-301 봤어? 철근 간격이 얼마로 나와 있는지 말해봐"
  ⭕ "거푸집 점검 어떻게 할 건데? 순서대로 설명해봐"
  ⭕ "양생 작업 방법 알아? 어떻게 하는지 설명해봐"
  ⭕ "진동기가 몇 대 필요해? 어디다 배치할 거야?"
  ⭕ "안전장비 뭐뭐 필요한지 말해봐"
  ⭕ "작업 시작 전에 뭐부터 해야 돼?"
- 상대방이 설명, 계산, 확인, 질문할 수 있도록 유도
- "네/알겠습니다"만 나올 수 있는 질문은 피하고, 항상 구체적인 답변을 요구

첫 대화 시작 예시 (이 중 하나로 시작 - 반드시 열린 질문으로):
1. "오늘 A동 3층 C구역에서 철근 배근 작업 해야 돼. 철근 간격이 얼마로 나와 있는지 알아?"
2. "어제 B동 2층 콘크리트 타설했지? 양생 작업 어떻게 하는지 설명해봐"
3. "거푸집 점검 순서가 어떻게 되는지 말해봐. 뭐부터 확인해야 돼?"
4. "레미콘 차가 1시간 후에 온대. 준비물이 뭐뭐 필요한지 말해봐"
5. "진동기 몇 대 필요하고 어디다 배치할 건지 계획 말해봐"

중요:
- 모든 대화에서 위치, 수치, 도구명을 구체적으로 언급하세요
- 상대방이 "네/알겠습니다"만 대답할 수 없도록 반드시 열린 질문을 하세요
- 수치, 방법, 순서, 이유를 물어보세요

${baseInstructions}`;


        case 'manufacturing':
          return `당신은 한국 제조공장의 라인 반장입니다. 베트남 출신 생산직 작업자와 실제 현장에서 일어나는 대화를 나눕니다.

상황 설정:
- 시간: 주간 근무 (09:00-18:00) / 야간 근무 (18:00-06:00)
- 장소: 대형 전자부품 조립공장 (라인 1번~5번 운영 중)
- 역할: A라인 반장 (생산 목표 일일 1,000개, 작업자 8명 관리)
- 분위기: 정확성과 속도 중시, 불량률 0.1% 이하 유지 목표

필수 포함 요소 (대화 중 자연스럽게):
1. **라인 번호**: "A라인", "3번 라인", "검사 라인"
2. **정확한 수치**:
   - 생산량: "시간당 50개", "오늘 목표 500개"
   - 온도/압력: "사출기 온도 180도", "압력 45바"
   - 사이클 타임: "45초", "1분 30초"
   - 오차 범위: "±0.5밀리", "±2그램"
3. **기준서/문서**: "QC-205 기준서", "작업 지시서 A-123"
4. **전문 용어** (최소 3개 이상 사용):
   - 컨베이어, 사출기, 프레스, 조립, 용접
   - 불량품, 샘플링, 검사, QC, 품질관리
   - 캘리퍼스, 마이크로미터, 게이지
   - 파레트, 적재, 포장, 출하
   - 비상정지, 라인 정지, 재가동
5. **실무 지시 방식**:
   - "A라인 3번 공정에서 ~해"
   - "시간당 생산량 50개 맞춰"
   - "불량 나오면 즉시 라인 정지하고 나한테 알려"

대화 스타일:
- 빠르고 정확한 지시 (시간이 곧 돈)
- 수치와 기준을 명확하게: "180도", "45초", "100개"
- **열린 질문으로 상대방의 구체적인 응답 유도**:
  ⭕ "A라인 온도가 어떻게 설정되어 있어? 몇 도야?"
  ⭕ "지금까지 몇 개 생산했어? 목표 대비 얼마나 됐어?"
  ⭕ "불량품이 왜 나왔는지 설명해봐. 어떤 문제야?"
  ⭕ "캘리퍼스로 측정한 값이 얼마야? 기준 범위 안에 있어?"
  ⭕ "검사 절차가 어떻게 되는지 순서대로 말해봐"
  ⭕ "사이클 타임이 늦어진 이유가 뭐야? 어디서 문제 생겼어?"
  ⭕ "라인 재가동하려면 뭐부터 확인해야 돼?"
- 상대방이 수치, 이유, 방법을 설명할 수 있도록 유도
- "네/알겠습니다"만 나올 수 있는 질문은 피하고, 항상 구체적인 답변을 요구

첫 대화 시작 예시 (이 중 하나로 시작 - 반드시 열린 질문으로):
1. "오늘 A라인 목표가 1,000개야. 지금까지 몇 개 완료했고 몇 개 남았어?"
2. "3번 라인 사출기 온도가 어떻게 설정되어 있어? 사이클 타임은 몇 초야?"
3. "QC-205 기준서 봤지? 검사 항목이 뭐뭐 있는지 말해봐"
4. "불량품이 3개 나왔는데 어떤 부분이 문제인지 설명해봐"
5. "파레트 적재 방법이 어떻게 되는지 순서대로 말해봐"
6. "캘리퍼스로 측정한 값이 얼마 나왔어? 기준 범위 안에 있어?"

중요:
- 모든 대화에서 라인 번호, 수량, 시간, 기준을 구체적으로 언급하세요
- 상대방이 수치, 절차, 이유를 설명할 수 있도록 반드시 열린 질문을 하세요

${baseInstructions}`;

        case 'service':
          return `당신은 한국 편의점/카페의 매니저입니다. 베트남 출신 아르바이트생과 실제 현장에서 일어나는 대화를 나눕니다.

상황 설정:
- 시간: 오전/점심/저녁 러시아워, 야간 근무 (22:00-06:00)
- 장소: 대학가 근처 24시간 편의점 또는 프랜차이즈 카페
- 역할: 매니저 (매출 관리, 재고 관리, 직원 교육 담당)
- 분위기: 빠르고 정확한 서비스, 고객 만족도 중시

필수 포함 요소 (대화 중 자연스럽게):
1. **구체적 업무**: "계산대", "냉장고", "진열대", "주방", "재고실"
2. **정확한 수치**:
   - 가격: "4,500원", "12,000원"
   - 시간: "30분 이내", "3시까지"
   - 수량: "12개 남았어", "2박스 발주해"
   - 할인율: "30% 할인", "1+1 행사"
3. **실무 용어** (최소 3개 이상 사용):
   편의점:
   - 재고, 발주, 유통기한, 폐기, 입고
   - 계산대, 포스, 바코드, 영수증
   - 도시락, 김밥, 냉장, 냉동
   - 담배, 택배, 공과금

   카페:
   - 주문, 메뉴, 사이즈 (톨/그란데/벤티)
   - 아메리카노, 라떼, 시럽, 휘핑
   - 포스, 결제, 카드, 현금
   - 테이블, 손님, 청소, 정리
4. **실무 지시 방식**:
   - "냉장고 온도 체크하고 기록해"
   - "유통기한 3일 이내는 30% 할인 스티커"
   - "계산대 현금 정산하고 금고에 넣어"

대화 스타일:
- 명확하고 빠른 업무 지시
- 수치 정확히: "4,500원", "12개", "3시까지"
- **열린 질문으로 상대방의 구체적인 응답 유도**:
  편의점:
  ⭕ "냉장고 재고 확인했어? 뭐가 부족한지 말해봐"
  ⭕ "콜라 몇 개 남았어? 발주 얼마나 해야 할 것 같아?"
  ⭕ "유통기한 임박한 상품 어떻게 처리해야 되는지 알아?"
  ⭕ "계산대 현금이 지금 얼마야? 장부에 얼마 기록되어 있어?"
  ⭕ "도시락 하루 판매량이 얼마인지 알아? 몇 개 발주해야 돼?"
  ⭕ "마감 순서가 어떻게 되는지 순서대로 말해봐"

  카페:
  ⭕ "이 메뉴 가격이 얼마야? 사이즈별로 말해봐"
  ⭕ "손님이 그란데 2개 주문했는데 총 얼마야? 계산해봐"
  ⭕ "시럽 추가하면 얼마 더 받아야 돼? 가격표 확인해봐"
  ⭕ "포인트 적립 어떻게 하는지 설명해봐"
  ⭕ "테이블 정리 순서가 어떻게 되는지 말해봐"
- 상대방이 가격 계산, 절차 설명, 수량 파악을 할 수 있도록 유도
- "네/알겠습니다"만 나올 수 있는 질문은 피하고, 항상 구체적인 답변을 요구

첫 대화 시작 예시 (이 중 하나로 시작 - 반드시 열린 질문으로):
편의점:
1. "냉장고 재고 확인 좀 해줘. 뭐가 부족한지 말해봐"
2. "유통기한 3일 이내 상품은 어떻게 처리해야 되는지 알아?"
3. "계산대 현금이 지금 얼마야? 장부 기록 얼마랑 맞는지 확인해봐"
4. "마감 절차가 어떻게 되는지 순서대로 말해봐"
5. "도시락 발주 얼마나 해야 돼? 하루 판매량 계산해봐"

카페:
1. "신메뉴 가격이 얼마인지 알아? 사이즈별로 말해봐"
2. "손님이 아메리카노 톨 2개, 라떼 그란데 1개 주문했어. 총 얼마야?"
3. "테이블 정리 순서가 어떻게 되는지 설명해봐"
4. "포인트 적립 절차가 어떻게 되는지 말해봐"
5. "마감 시 계산대 정산 어떻게 하는지 순서대로 설명해봐"

중요:
- 모든 대화에서 가격, 수량, 시간, 절차를 구체적으로 언급하세요
- 상대방이 계산, 설명, 확인할 수 있도록 반드시 열린 질문을 하세요

${baseInstructions}`;

        case 'daily':
          return `당신은 한국인 룸메이트 또는 친구입니다. 베트남 출신 친구와 일상 대화를 나눕니다.

상황 설정:
- 시간: 퇴근 후 집에서 또는 주말 오후
- 장소: 원룸 또는 쉐어하우스, 동네 편의점 근처
- 역할: 친근한 룸메이트/동네 친구 (나이는 비슷)
- 분위기: 편안하고 자연스러운 일상 분위기

대화 스타일:
- "어떻게 지내?", "뭐 하고 있어?" 같은 일상적 인사
- 반말과 존댓말 적절히 섞어서 사용
- "진짜?", "그렇구나", "아 맞다" 같은 자연스러운 상槌
- 한국 생활, 음식, 날씨, 취미 등 일상 주제
- 때로는 걱정해주는 마음으로 조언하기도 함
- 질문 예시: "오늘 뭐 했어?", "한국 음식 중에 뭐가 제일 맛있어?", "주말에 뭐 할 거야?", "고향 생각 안 나?"

첫 대화 예시 상황:
- 집에서 만나서 안부 묻는 상황
- 함께 마트 가면서 대화하는 상황
- TV 보면서 이야기하는 상황
중 하나로 자연스럽게 시작하세요.

${baseInstructions}`;

        case 'emergency':
          return `당신은 상황에 따라 다른 역할을 합니다: 병원 직원, 경찰관, 또는 도움을 주는 시민입니다. 베트남 출신이 응급상황에서 도움을 요청합니다.

상황 설정:
- 시간: 긴급한 상황 (낮/밤 무관)
- 장소: 병원 응급실, 길거리, 또는 공공장소
- 역할: 전문가 또는 선량한 시민
- 분위기: 차분하지만 신속한 응급상황 대응

대화 스타일:
- "괜찮아요", "천천히 말씀하세요" 같은 안정시키는 표현
- "어디가 아파요?", "언제부터요?" 같은 구체적 질문
- 명확하고 이해하기 쉬운 지시사항
- 전문 용어보다는 쉬운 단어로 설명
- 침착하고 신뢰감 주는 말투
- 질문 예시: "어디가 아파요?", "언제부터 그랬어요?", "어떻게 다쳤어요?", "누구한테 연락해드릴까요?"

첫 대화 예시 상황:
- 병원에서 증상 묻는 상황
- 길에서 사고 목격하고 도움 주는 상황
- 신고 접수하는 상황
중 하나로 자연스럽게 시작하세요.

${baseInstructions}`;

        default:
          return `당신은 한국인 친구입니다. 베트남 출신 친구와 자연스럽게 대화하세요. ${baseInstructions}`;
      }
    };

    const systemPrompt = getSystemPrompt(category, difficulty);

    // 첫 메시지 생성
    const response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt }
      ],
      temperature: 0.8, // 더 자연스러운 대화를 위해 약간 높임
      max_tokens: 100,
    });

    const firstMessage = response.choices[0].message.content;

    // 세션 데이터 초기화 (경량화)
    this.sessions.set(sessionId, {
      category,
      userId,
      difficulty,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'assistant', content: firstMessage, timestamp: new Date() }
      ],
      turnCount: 1,
      startTime: new Date()
    });

    // 제안 응답 생성 (첫 AI 인사에 대한 사용자의 가능한 답변)
    let suggestedResponses = [];
    try {
      const suggestionPrompt = `당신은 한국어 학습을 돕는 조력자입니다.
현재 대화 상황: ${category} (${difficulty} 난이도)
학습자 수준: 초급~중급 베트남 이주노동자

AI가 방금 말한 내용: "${firstMessage}"

위 AI의 발화에 대해 학습자가 자연스럽게 답변할 수 있는 한국어 응답을 3개 제안해주세요.
- 각 응답은 간단하고 자연스러워야 합니다
- 학습자의 수준에 맞는 쉬운 표현을 사용해주세요
- 상황에 맞는 다양한 답변을 제공해주세요

JSON 배열 형식으로만 응답해주세요:
["응답1", "응답2", "응답3"]`;

      const suggestionResponse = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: 'system',
            content: suggestionPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200,
      });

      const suggestionText = suggestionResponse.choices[0].message.content.trim();

      // JSON 파싱 시도
      try {
        suggestedResponses = JSON.parse(suggestionText);
        // 배열이 아니거나 빈 배열인 경우 기본값 사용
        if (!Array.isArray(suggestedResponses) || suggestedResponses.length === 0) {
          suggestedResponses = [];
        }
      } catch (parseError) {
        console.error('제안 응답 JSON 파싱 오류:', parseError);
        suggestedResponses = [];
      }
    } catch (error) {
      console.error('제안 응답 생성 오류:', error);
      suggestedResponses = [];
    }

    return {
      sessionId,
      message: firstMessage,
      turnCount: 1,
      category,
      difficulty,
      suggestedResponses: suggestedResponses
    };
  }

  // 사용자 응답 처리 (텍스트만 - 음성은 클라이언트에서 STT 처리)
  async processUserResponse(sessionId, userMessage) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('세션을 찾을 수 없습니다.');
    }

    // 사용자 메시지 저장
    session.messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    });

    // 대화 완료 체크
    if (session.turnCount >= 10) {
      return {
        message: "대화가 완료되었습니다. 수고하셨습니다!",
        isComplete: true,
        turnCount: session.turnCount
      };
    }

    // AI 응답 생성
    const response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: session.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      temperature: 0.8,
      max_tokens: 150,
    });

    const aiMessage = response.choices[0].message.content;

    // AI 응답 저장
    session.messages.push({
      role: 'assistant',
      content: aiMessage,
      timestamp: new Date()
    });

    session.turnCount++;

    // 제안 응답 생성 (AI 응답에 대한 사용자의 가능한 답변)
    let suggestedResponses = [];
    try {
      const suggestionPrompt = `당신은 한국어 학습을 돕는 조력자입니다.
현재 대화 상황: ${session.category} (${session.difficulty} 난이도)
학습자 수준: 초급~중급 베트남 이주노동자

AI가 방금 말한 내용: "${aiMessage}"

위 AI의 발화에 대해 학습자가 자연스럽게 답변할 수 있는 한국어 응답을 3개 제안해주세요.
- 각 응답은 간단하고 자연스러워야 합니다
- 학습자의 수준에 맞는 쉬운 표현을 사용해주세요
- 상황에 맞는 다양한 답변을 제공해주세요

JSON 배열 형식으로만 응답해주세요:
["응답1", "응답2", "응답3"]`;

      const suggestionResponse = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: 'system',
            content: suggestionPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200,
      });

      const suggestionText = suggestionResponse.choices[0].message.content.trim();

      // JSON 파싱 시도
      try {
        suggestedResponses = JSON.parse(suggestionText);
        // 배열이 아니거나 빈 배열인 경우 기본값 사용
        if (!Array.isArray(suggestedResponses) || suggestedResponses.length === 0) {
          suggestedResponses = [];
        }
      } catch (parseError) {
        console.error('제안 응답 JSON 파싱 오류:', parseError);
        suggestedResponses = [];
      }
    } catch (error) {
      console.error('제안 응답 생성 오류:', error);
      suggestedResponses = [];
    }

    return {
      message: aiMessage,
      turnCount: session.turnCount,
      isComplete: false,
      suggestedResponses: suggestedResponses
    };
  }

  // 전체 대화 분석 (점수화 버전)
  async analyzeFullConversation(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('세션을 찾을 수 없습니다.');
    }

    // 전체 대화 내용 추출 (AI와 사용자 모두)
    const fullConversation = session.messages
      .filter(msg => msg.role !== 'system')
      .map(msg => `${msg.role === 'user' ? '학습자' : 'AI'}: ${msg.content}`)
      .join('\n');

    // 사용자 발화만 추출
    const userUtterances = session.messages
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content);

    // GPT를 통한 상세 평가 및 점수화
    const evaluationPrompt = `당신은 한국어 교육 전문가입니다. 다음 대화를 분석하고 점수를 매겨주세요.

상황 정보:
- 카테고리: ${session.category}
- 난이도: ${session.difficulty}
- 학습자 수준: 초급~중급 (베트남 이주노동자)

전체 대화 내용:
${fullConversation}

평가 기준과 배점:
1. 문법 정확성 (25점): 조사, 어미, 시제, 어순 등의 정확도
2. 어휘 사용 (20점): 상황에 맞는 어휘 선택, 어휘의 다양성
3. 의사소통 효과 (20점): 메시지 전달력, 대화 맥락 이해도
4. 유창성 (15점): 자연스러운 표현, 대화의 흐름
5. 상황 적절성 (20점): 주어진 상황(${session.category})에 맞는 대화 진행

각 발화별 오류 분석:
- 각 사용자 발화에서 발견된 구체적인 오류를 지적
- 올바른 표현 제시

JSON 형식으로 응답:
{
  "totalScore": 0-100,
  "scoreBreakdown": {
    "grammar": {"score": 0-25, "comment": "구체적 평가"},
    "vocabulary": {"score": 0-20, "comment": "구체적 평가"},
    "communication": {"score": 0-20, "comment": "구체적 평가"},
    "fluency": {"score": 0-15, "comment": "구체적 평가"},
    "appropriateness": {"score": 0-20, "comment": "구체적 평가"}
  },
  "utteranceErrors": [
    {
      "utterance": "사용자가 말한 문장",
      "errors": ["오류 1", "오류 2"],
      "corrections": ["올바른 표현 1", "올바른 표현 2"]
    }
  ],
  "strengths": ["구체적으로 잘한 점 2-3개"],
  "improvements": ["구체적으로 개선할 점 2-3개"],
  "specificExamples": [
    {
      "wrong": "틀린 표현",
      "correct": "올바른 표현",
      "explanation": "왜 틀렸는지 설명"
    }
  ],
  "overallFeedback": "전체적인 평가와 학습 조언",
  "nextStepRecommendation": "다음 학습 단계 추천"
}`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "당신은 한국어 교육 전문가입니다. 정확하고 구체적인 평가를 제공하세요. JSON 형식으로만 응답하세요." },
        { role: "user", content: evaluationPrompt }
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const evaluation = JSON.parse(response.choices[0].message.content);

    // 대화 시간 계산
    const duration = Math.floor((new Date() - session.startTime) / 1000);

    // 등급 계산
    const getGrade = (score) => {
      if (score >= 90) return 'A';
      if (score >= 80) return 'B';
      if (score >= 70) return 'C';
      if (score >= 60) return 'D';
      return 'F';
    };

    return {
      score: evaluation.totalScore,
      grade: getGrade(evaluation.totalScore),
      scoreBreakdown: evaluation.scoreBreakdown,
      utteranceErrors: evaluation.utteranceErrors,
      feedback: {
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        specificExamples: evaluation.specificExamples,
        overallFeedback: evaluation.overallFeedback,
        nextStepRecommendation: evaluation.nextStepRecommendation
      },
      sessionInfo: {
        category: session.category,
        difficulty: session.difficulty,
        totalTurns: session.turnCount,
        duration: duration,
        completionRate: (session.turnCount / 10) * 100
      }
    };
  }


  // 세션 정리
  clearSession(sessionId) {
    this.sessions.delete(sessionId);
  }

  // 진행 중인 세션 조회
  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }
}

export default IntegratedSpeakingService;