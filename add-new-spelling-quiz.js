const fs = require('fs');
const path = require('path');

// JSON 파일 읽기
const jsonPath = path.join(__dirname, 'client', 'public', 'data', 'spellingQuiz.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

console.log('추가 전 문제 수:', data.quizzes.length);

// 새로운 문제들
const newQuizzes = [
  // 1. 이었다/이였다
  {
    question: "어제는 날씨가 좋{blank}.",
    options: ["이었어요", "이였어요"],
    correctAnswer: 0,
    explanation: "'-였'은 '-이었'의 줄임말입니다. '이었어요'가 맞습니다.",
    category: "축약형",
    difficulty: "medium"
  },
  // 2. -데/-대 (직접 경험)
  {
    question: "영화가 정말 재미있{blank}.",
    options: ["더라고요", "대요"],
    correctAnswer: 0,
    explanation: "직접 경험한 것을 말할 때는 '-더라고요'를 사용합니다.",
    category: "어미",
    difficulty: "hard"
  },
  // 3. -데/-대 (간접 전문)
  {
    question: "친구 말로는 그 식당이 맛있{blank}.",
    options: ["대요", "데요"],
    correctAnswer: 0,
    explanation: "남에게 들은 내용을 전할 때는 '-대요'를 사용합니다.",
    category: "어미",
    difficulty: "hard"
  },
  // 4. 결제/결재
  {
    question: "카드로 {blank}를 했습니다.",
    options: ["결제", "결재"],
    correctAnswer: 0,
    explanation: "'결제'는 대금을 지불하는 것이고, '결재'는 상사의 승인을 받는 것입니다.",
    category: "의미구별",
    difficulty: "medium"
  },
  // 5. 결재/결제
  {
    question: "상사의 {blank}를 받아야 합니다.",
    options: ["결재", "결제"],
    correctAnswer: 0,
    explanation: "'결재'는 상사의 승인을 받는 것이고, '결제'는 대금을 지불하는 것입니다.",
    category: "의미구별",
    difficulty: "medium"
  },
  // 6. 오랜만에/오랫만에
  {
    question: "{blank} 친구를 만났어요.",
    options: ["오랜만에", "오랫만에"],
    correctAnswer: 0,
    explanation: "'오래간만'의 줄임말이므로 '오랜만에'가 맞습니다.",
    category: "맞춤법",
    difficulty: "medium"
  },
  // 7. 띠다/띄다
  {
    question: "허리에 띠를 {blank}어요.",
    options: ["띠", "띄"],
    correctAnswer: 0,
    explanation: "'두르다, 지니다'의 의미는 '띠다'입니다.",
    category: "의미구별",
    difficulty: "hard"
  },
  // 8. 띠다/띄다
  {
    question: "눈에 {blank}는 행동을 했어요.",
    options: ["띄", "띠"],
    correctAnswer: 0,
    explanation: "'보이다'의 의미는 '띄다(뜨이다)'입니다.",
    category: "의미구별",
    difficulty: "hard"
  },
  // 9. 매뉴얼/메뉴얼
  {
    question: "사용 {blank}을 읽어보세요.",
    options: ["매뉴얼", "메뉴얼"],
    correctAnswer: 0,
    explanation: "외래어 표기법에 따라 '매뉴얼(manual)'이 맞습니다.",
    category: "맞춤법",
    difficulty: "easy"
  },
  // 10. 십시오/십시요
  {
    question: "여기에 앉으{blank}.",
    options: ["십시오", "십시요"],
    correctAnswer: 0,
    explanation: "합쇼체 명령형은 '-십시오'입니다. '-요'를 붙이지 않습니다.",
    category: "어미",
    difficulty: "medium"
  },
  // 11. 메시지/메세지
  {
    question: "{blank}를 확인해주세요.",
    options: ["메시지", "메세지"],
    correctAnswer: 0,
    explanation: "외래어 표기법에 따라 '메시지(message)'가 맞습니다.",
    category: "맞춤법",
    difficulty: "easy"
  },
  // 12. -음/-슴
  {
    question: "책 읽{blank}이 중요합니다.",
    options: ["음", "슴"],
    correctAnswer: 0,
    explanation: "명사형 어미는 항상 '-음'을 사용합니다.",
    category: "어미",
    difficulty: "easy"
  },
  // 13. 콘텐츠/컨텐츠
  {
    question: "디지털 {blank}를 제작합니다.",
    options: ["콘텐츠", "컨텐츠"],
    correctAnswer: 0,
    explanation: "외래어 표기법에 따라 '콘텐츠(contents)'가 맞습니다.",
    category: "맞춤법",
    difficulty: "medium"
  },
  // 14. 부조금/부주금
  {
    question: "경조사 {blank}을 냈습니다.",
    options: ["부조금", "부주금"],
    correctAnswer: 0,
    explanation: "'부조금(扶助金)'이 맞는 표기입니다.",
    category: "맞춤법",
    difficulty: "medium"
  },
  // 15. 계발/개발
  {
    question: "인성 {blank}이 중요합니다.",
    options: ["계발", "개발"],
    correctAnswer: 0,
    explanation: "'계발'은 인간의 정신이나 능력을 개선하는 것이고, '개발'은 사물이나 기술을 발전시키는 것입니다.",
    category: "의미구별",
    difficulty: "hard"
  },
  // 16. 개발/계발
  {
    question: "신기술 {blank}에 성공했습니다.",
    options: ["개발", "계발"],
    correctAnswer: 0,
    explanation: "'개발'은 사물이나 기술을 발전시키는 것이고, '계발'은 인간의 정신이나 능력을 개선하는 것입니다.",
    category: "의미구별",
    difficulty: "hard"
  },
  // 17. 뺐다/뺏다
  {
    question: "지갑을 {blank}어요.",
    options: ["뺐", "뺏"],
    correctAnswer: 0,
    explanation: "'빼다(pull out)'의 과거형은 '뺐다'입니다.",
    category: "의미구별",
    difficulty: "medium"
  },
  // 18. 뺏다/뺐다
  {
    question: "장난감을 동생에게 {blank}어요.",
    options: ["뺏", "뺐"],
    correctAnswer: 0,
    explanation: "'빼앗다(snatch)'의 과거형은 '뺏다'입니다.",
    category: "의미구별",
    difficulty: "medium"
  },
  // 19. 수 밖에/수밖에
  {
    question: "그럴 {blank} 없었어요.",
    options: ["수밖에", "수 밖에"],
    correctAnswer: 0,
    explanation: "의존명사 '수'와 보조사 '밖에'는 붙여 씁니다.",
    category: "띄어쓰기",
    difficulty: "medium"
  },
  // 20. 염두에 두다/염두하다
  {
    question: "이 점을 {blank} 주세요.",
    options: ["염두에 두", "염두하"],
    correctAnswer: 0,
    explanation: "'염두(念頭)'는 명사이므로 '염두에 두다'가 맞습니다.",
    category: "띄어쓰기",
    difficulty: "hard"
  },
  // 21. 눈곱/눈꼽
  {
    question: "{blank}을 떼었어요.",
    options: ["눈곱", "눈꼽"],
    correctAnswer: 0,
    explanation: "'곱'은 기름이나 기름진 것을 의미하므로 '눈곱'이 맞습니다.",
    category: "맞춤법",
    difficulty: "easy"
  },
  // 22. 숱/숯 (모발)
  {
    question: "머리카락 {blank}이 많아요.",
    options: ["숱", "숯"],
    correctAnswer: 0,
    explanation: "모발의 양은 '숱'이고, 연료는 '숯'입니다.",
    category: "의미구별",
    difficulty: "easy"
  },
  // 23. 숯/숱
  {
    question: "고기를 {blank}불에 구웠어요.",
    options: ["숯", "숱"],
    correctAnswer: 0,
    explanation: "연료는 '숯'이고, 모발의 양은 '숱'입니다.",
    category: "의미구별",
    difficulty: "easy"
  },
  // 24. -는커녕/-는 커녕
  {
    question: "공부{blank} 놀기만 해요.",
    options: ["는커녕", "는 커녕"],
    correctAnswer: 0,
    explanation: "'-는커녕'은 조사이므로 붙여 씁니다.",
    category: "띄어쓰기",
    difficulty: "medium"
  },
  // 25. 것뿐/것 뿐
  {
    question: "할 수 있는 {blank}이에요.",
    options: ["것뿐", "것 뿐"],
    correctAnswer: 0,
    explanation: "의존명사 '것'과 보조사 '뿐'은 붙여 씁니다.",
    category: "띄어쓰기",
    difficulty: "medium"
  },
  // 26. 강낭콩/강남콩
  {
    question: "{blank}을 삶았어요.",
    options: ["강낭콩", "강남콩"],
    correctAnswer: 0,
    explanation: "'강낭콩'이 표준어입니다.",
    category: "어휘",
    difficulty: "easy"
  },
  // 27. 대개/대게 (대부분)
  {
    question: "{blank} 사람들이 그렇게 생각해요.",
    options: ["대개", "대게"],
    correctAnswer: 0,
    explanation: "'대부분'의 의미는 '대개'이고, '대게'는 동물(킹크랩)입니다.",
    category: "의미구별",
    difficulty: "medium"
  },
  // 28. 대게/대개 (동물)
  {
    question: "{blank}를 먹었어요.",
    options: ["대게", "대개"],
    correctAnswer: 0,
    explanation: "동물(킹크랩)은 '대게'이고, '대개'는 '대부분'의 의미입니다.",
    category: "의미구별",
    difficulty: "medium"
  },
  // 29. 거예요/거에요
  {
    question: "이게 제 {blank}.",
    options: ["거예요", "거에요"],
    correctAnswer: 0,
    explanation: "받침 없는 체언 뒤에는 '-예요'를 사용합니다.",
    category: "어미",
    difficulty: "easy"
  },
  // 30. 곯다/곪다 (배고픔)
  {
    question: "배를 {blank}았어요.",
    options: ["곯", "곪"],
    correctAnswer: 0,
    explanation: "배고픔은 '곯다'이고, 상처가 염증나는 것은 '곪다'입니다.",
    category: "의미구별",
    difficulty: "medium"
  },
  // 31. 곪다/곯다 (염증)
  {
    question: "상처가 {blank}았어요.",
    options: ["곪", "곯"],
    correctAnswer: 0,
    explanation: "상처가 염증나는 것은 '곪다'이고, 배고픔은 '곯다'입니다.",
    category: "의미구별",
    difficulty: "medium"
  },
  // 32. 다리다/달이다
  {
    question: "옷을 {blank}었어요.",
    options: ["다렸", "달였"],
    correctAnswer: 0,
    explanation: "주름을 펴는 것은 '다리다'입니다.",
    category: "맞춤법",
    difficulty: "medium"
  },
  // 33. 사흘/나흘
  {
    question: "{blank} 동안 여행했어요.",
    options: ["사흘", "나흘"],
    correctAnswer: 0,
    explanation: "'3일'은 '사흘', '4일'은 '나흘'입니다.",
    category: "어휘",
    difficulty: "easy"
  },
  // 34. 웬일/왠일
  {
    question: "{blank}로 여기 왔어요?",
    options: ["웬일", "왠일"],
    correctAnswer: 0,
    explanation: "'어떠한 일'을 뜻할 때는 관형사 '웬'을 사용합니다.",
    category: "맞춤법",
    difficulty: "hard"
  },
  // 35. 안쓰럽다/안스럽다
  {
    question: "정말 {blank}네요.",
    options: ["안쓰럽", "안스럽"],
    correctAnswer: 0,
    explanation: "'안쓰럽다'가 표준어입니다.",
    category: "어휘",
    difficulty: "easy"
  },
  // 36. 돼지/되지
  {
    question: "안 {blank}?",
    options: ["되", "돼"],
    correctAnswer: 0,
    explanation: "'되다'의 어간 뒤에 '-지'가 올 때는 '되지'입니다. '돼'는 '되어'의 줄임말입니다.",
    category: "축약형",
    difficulty: "medium"
  },
  // 37. 뭐래/뭐라해
  {
    question: "선생님이 {blank}?",
    options: ["뭐래", "뭐라해"],
    correctAnswer: 0,
    explanation: "'뭐라고 해'의 줄임말은 '뭐래'입니다.",
    category: "구어/축약",
    difficulty: "medium"
  },
  // 38. 무난히/무난이
  {
    question: "{blank} 시험을 마쳤어요.",
    options: ["무난히", "무난이"],
    correctAnswer: 0,
    explanation: "'-하다' 형용사의 부사형은 '-히'를 사용하므로 '무난히'가 맞습니다.",
    category: "어미",
    difficulty: "medium"
  },
  // 39. 되게/되도록
  {
    question: "{blank} 빨리 오세요.",
    options: ["되도록", "되게"],
    correctAnswer: 0,
    explanation: "'가능한 한'의 의미로는 '되도록'을 사용합니다. '되게'는 '매우'의 구어체입니다.",
    category: "맞춤법",
    difficulty: "hard"
  },
  // 40. 웬만하면/왠만하면
  {
    question: "{blank} 참으세요.",
    options: ["웬만하면", "왠만하면"],
    correctAnswer: 0,
    explanation: "'대강, 어지간히'의 의미는 '웬만하면'입니다.",
    category: "맞춤법",
    difficulty: "hard"
  },
  // 41. 있으므로/있음으로
  {
    question: "자료가 {blank} 발표하겠습니다.",
    options: ["있으므로", "있음으로"],
    correctAnswer: 0,
    explanation: "'그러므로'의 의미는 '-으므로'입니다. '-음으로'는 '수단'을 나타냅니다.",
    category: "어미",
    difficulty: "hard"
  },
  // 42. 비율/비율
  {
    question: "합격 {blank}이 높아요.",
    options: ["비율", "비률"],
    correctAnswer: 0,
    explanation: "'비율(比率)'이 맞는 표기입니다.",
    category: "맞춤법",
    difficulty: "easy"
  },
  // 43. 휴게실/휴계실
  {
    question: "{blank}에서 쉬세요.",
    options: ["휴게실", "휴계실"],
    correctAnswer: 0,
    explanation: "'휴게실(休憩室)'이 맞는 표기입니다.",
    category: "맞춤법",
    difficulty: "medium"
  },
  // 44. 쓰레기/쓰레기
  {
    question: "{blank}를 버려주세요.",
    options: ["쓰레기", "쓰래기"],
    correctAnswer: 0,
    explanation: "'쓰레기'가 표준어입니다.",
    category: "맞춤법",
    difficulty: "easy"
  },
  // 45. 여쭙다/여쭙다
  {
    question: "선생님께 {blank}겠습니다.",
    options: ["여쭙", "여쭈"],
    correctAnswer: 0,
    explanation: "'묻다'의 높임말은 '여쭙다'입니다.",
    category: "높임법",
    difficulty: "medium"
  },
  // 46. 반갑습니다/반가워요
  {
    question: "처음 뵙겠습니다. {blank}.",
    options: ["반갑습니다", "반가워요"],
    correctAnswer: 0,
    explanation: "격식체에서는 '반갑습니다'를 사용합니다.",
    category: "높임법",
    difficulty: "easy"
  },
  // 47. 이따가/이따
  {
    question: "{blank} 봐요.",
    options: ["이따가", "이따"],
    correctAnswer: 0,
    explanation: "'조금 뒤에'라는 의미의 부사는 '이따가'입니다.",
    category: "맞춤법",
    difficulty: "easy"
  },
  // 48. 아니에요/아니예요
  {
    question: "그건 {blank}.",
    options: ["아니에요", "아니예요"],
    correctAnswer: 0,
    explanation: "'아니다'에 '-에요'가 붙어 '아니에요'가 됩니다.",
    category: "어미",
    difficulty: "medium"
  },
  // 49. 돌아가셨다/돌아가시었다
  {
    question: "할아버지께서 {blank}.",
    options: ["돌아가셨어요", "돌아가시었어요"],
    correctAnswer: 0,
    explanation: "'-시었-'은 '-셨-'으로 줄여 씁니다.",
    category: "높임법",
    difficulty: "medium"
  },
  // 50. 됐다/됬다
  {
    question: "이제 {blank}어요.",
    options: ["됐", "됬"],
    correctAnswer: 0,
    explanation: "'되었다'의 줄임말은 '됐다'입니다.",
    category: "축약형",
    difficulty: "medium"
  }
];

// 새로운 문제 추가
const startId = data.quizzes.length + 1;
newQuizzes.forEach((quiz, index) => {
  data.quizzes.push({
    id: startId + index,
    question: quiz.question,
    options: quiz.options,
    correctAnswer: quiz.correctAnswer,
    highlightWord: [...quiz.options],
    explanation: quiz.explanation,
    category: quiz.category,
    difficulty: quiz.difficulty
  });
});

console.log('추가된 문제 수:', newQuizzes.length);
console.log('추가 후 문제 수:', data.quizzes.length);

// 파일 저장
fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
console.log('\n✅ 새로운 문제 추가 완료!');
