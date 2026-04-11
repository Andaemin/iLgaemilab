# 한글 타자 게임

**최종 업데이트**: 2025-11-26

---

## 1. 게임 개요

### 1-1. 게임 설명
한글 타자 게임은 화면 위에서 떨어지는 한글 단어를 빠르게 입력하여 제거하는 실시간 타이핑 게임입니다. 3단계 난이도(초급/중급/고급)를 선택할 수 있으며, 단어의 낙하 속도와 길이가 달라집니다. 엔터 키로 단어를 제출하며, 생명이 모두 소진되기 전까지 최대한 많은 점수를 획득하는 것이 목표입니다.

### 1-2. 핵심 특징

#### 난이도 시스템
- 🌱 **초급**: 느린 속도(0.8), 짧은 단어(2-4글자)
- 🔥 **중급**: 보통 속도(1.3), 중간 단어(3-6글자)
- ⚡ **고급**: 빠른 속도(2.0), 긴 단어(4-8글자)
- 🎯 **난이도별 특성**:
  - 낙하 속도: 픽셀/프레임 단위로 조절
  - 단어 길이: 난이도에 따라 필터링
  - 생성 간격: 초급 2초, 중급 1.5초, 고급 1초

#### 생명 시스템
- ❤️ **기본 3개의 생명**: 게임 시작 시 3개의 하트
- 💔 **생명 감소**: 단어가 바닥에 닿을 때마다 1개씩 감소
- 💚 **생명 추가 가능**: 아이템 효과로 생명 추가 시 3개 이상 가능
- 🎮 **시각화**: ❤️❤️❤️ → ❤️❤️💔 → ❤️💔💔 → 💔💔💔 (게임 오버)
- ⚠️ **게임 오버**: 생명이 0이 되면 즉시 게임 종료

#### 입력 시스템
- ⌨️ **엔터 제출**: 단어를 입력하고 엔터 키를 눌러야 인정
- 🔵 **부분 일치 표시**: 입력 중인 글자는 파란색으로 강조
- 🎯 **정확한 매칭**: 완전히 일치하는 단어만 제거
- 🔄 **즉시 초기화**: 엔터 후 입력창 자동 초기화 및 포커스 유지

#### 점수 시스템
- 🏆 **글자 수 × 10점**: 단어 1개당 글자 수 × 10점
- 🔥 **콤보 보너스**: 5콤보 이상 시 콤보 × 2점 추가
- 📊 **최대 콤보**: 게임 중 최고 연속 성공 횟수 기록
- 💯 **최종 점수**: 획득한 점수만 표시 (생존 시간 보너스 없음)

#### 게임 진행
- 📺 **실시간 낙하**: requestAnimationFrame으로 부드러운 애니메이션
- ⏱️ **생존 시간**: 게임 시작부터 종료까지 경과 시간 측정
- 🎵 **배경음악**: TetrisTheme.mp3 자동 재생, 음소거 버튼 제공
- 💾 **음악 설정 저장**: localStorage에 음악 설정 저장

#### 아이템 시스템
- 🎁 **랜덤 아이템**: 10~15개 단어마다 빨간색 아이템 단어 출현
- 🔴 **아이템 단어**: 빨간색으로 표시되며, 입력 시 점수 없이 랜덤 효과 발동
- 🎯 **5가지 효과**:
  - ⏱️ **시간 느리기** (5초): 모든 단어의 낙하 속도 50% 감소
  - 💥 **전체 클리어**: 화면의 모든 단어 제거 및 점수 획득
  - 🙈 **단어 숨기기** (3초): 모든 단어가 검은색 블록으로 표시
  - ⚡ **시간 빠르기** (5초): 모든 단어의 낙하 속도 150% 증가 (디버프)
  - ❤️ **생명 추가**: 생명 1개 추가 (3개 이상 가능)
- 📊 **효과 표시**: 활성화된 효과는 상단바 중앙에 애니메이션으로 표시

#### 단어 관리 시스템
- 🔄 **중복 방지**: 한 게임 내에서 동일한 단어가 다시 출현하지 않음
- 📝 **단어 풀**: 게임 시작 시 모든 단어를 섞어서 순차적으로 사용
- ♻️ **풀 재생성**: 모든 단어를 사용하면 다시 섞어서 재사용

#### 튜토리얼 및 UX
- 📚 **5단계 튜토리얼**: 게임 규칙, 게임 방법, 아이템 시스템, 난이도 선택, 점수 계산을 상세하게 안내
- 🎮 **미리보기**: 튜토리얼에서 각 난이도의 특성 확인 가능
- 🔄 **다시 도전**: 결과 화면에서 바로 재시작 가능
- 📜 **자동 스크롤**: 게임 화면 전환 시 자동으로 페이지 상단으로 스크롤

---

## 2. 게임 접근 방법

### 2-1. 게임 센터 진입
1. 메인 페이지에서 "게임 센터" 버튼 클릭
2. 게임 목록에서 "한글 타자 게임" 카드 선택
3. 자동으로 튜토리얼 화면 시작

**URL**: `http://localhost:5288/game` → 한글 타자 게임 카드 클릭

### 2-2. 직접 접근
브라우저 주소창에 직접 URL 입력:

**URL**: `http://localhost:5288/game/typer`

직접 접근 시에도 튜토리얼부터 시작하며, "건너뛰기" 버튼으로 바로 난이도 선택으로 이동 가능.

---

## 3. 게임 진행 단계

### 3-1. 튜토리얼 (Tutorial)

**화면 구성**:
- 상단: 뒤로가기 버튼, 📚 아이콘, "게임 설명" 제목, 단계 표시 (1/5, 2/5, ...)
- 중앙: 튜토리얼 카드
  - 이모지 아이콘 (🎮, ⌨, 🎁, 📊, 💯)
  - 단계별 제목
  - 설명 텍스트
  - 상세 안내 박스 (4-5개 bullet points)
  - 진행 상황 표시 점 (Progress dots)
- 하단: "건너뛰기" / "이전" 버튼, "다음" / "시작" 버튼

**튜토리얼 단계**:

**1단계 - 한글 타자 게임이란?** (🎮)
- 떨어지는 단어를 빠르게 입력하는 게임입니다.
- 상세 안내:
  - 화면 위에서 단어들이 떨어집니다.
  - 단어가 바닥에 닿기 전에 입력해야 합니다.
  - 난이도에 따라 속도와 단어 길이가 달라집니다.
  - 시간 제한 없이 얼마나 오래 버티는지 측정합니다.

**2단계 - 게임 방법** (⌨)
- 키보드로 단어를 정확하게 입력하세요.
- 상세 안내:
  - 화면에 표시된 단어를 그대로 입력합니다.
  - 입력이 맞으면 단어가 사라지고 점수를 얻습니다.
  - 단어가 바닥에 닿으면 생명이 1개 줄어듭니다.
  - 생명이 모두 소진되면 게임이 종료됩니다.

**3단계 - 아이템 시스템** (🎁)
- 빨간색 단어를 입력하면 랜덤 효과가 발동!
- 상세 안내:
  - 10~15개 단어마다 빨간색 아이템 단어가 나타납니다.
  - 아이템 단어는 점수를 주지 않지만 랜덤 효과가 발동됩니다.
  - ⏱️ 시간 느리기(5초) - 속도가 50%로 감소합니다
  - 💥 전체 클리어 - 모든 단어를 제거하고 점수를 획득합니다
  - 🙈 단어 숨기기(3초) / ⚡ 시간 빠르기(5초) / ❤️ 생명 추가

**4단계 - 난이도 선택** (📊)
- 초급, 중급, 고급 중 선택하세요.
- 상세 안내:
  - 초급: 느린 속도, 짧은 단어 (2-4글자), 2초마다 생성
  - 중급: 보통 속도, 중간 단어 (3-6글자), 1.5초마다 생성
  - 고급: 빠른 속도, 긴 단어 (4-8글자), 1초마다 생성
  - 자신의 실력에 맞는 난이도를 선택하세요.

**5단계 - 점수 계산** (💯)
- 빠르고 정확하게 입력할수록 높은 점수!
- 상세 안내:
  - 단어 1개당 글자 수 × 10점이 부여됩니다.
  - 5콤보 이상 시 콤보 × 2점이 추가됩니다.
  - 연속으로 성공하면 콤보가 증가합니다.
  - 단어를 놓치거나 틀리면 콤보가 초기화됩니다.
  - 최고 기록에 도전해보세요!

**인터랙션**:
- "이전" 버튼: 이전 단계로 돌아가기
- "다음" 버튼: 다음 단계로 진행
- "건너뛰기" 버튼: 튜토리얼 스킵하고 바로 난이도 선택으로
- "시작" 버튼 (5단계): 난이도 선택 화면으로

---

### 3-2. 난이도 선택 (Difficulty Selection)

**화면 구성**:
- 상단: 뒤로가기 버튼, 📊 아이콘, "난이도 선택" 제목
- 중앙: 3개의 난이도 카드 (가로 배치)
  - 초급 (🌱): 초록색 (#4CAF50)
  - 중급 (🔥): 주황색 (#FF9800)
  - 고급 (⚡): 빨간색 (#F44336)
- 각 카드:
  - 난이도 아이콘 (큰 이모지)
  - 난이도 이름 (초급/중급/고급)
  - 단어 길이: N-M글자
  - 속도: 느림/보통/빠름

**선택 후 동작**:
- 카드 클릭 시 즉시 카운트다운 시작
- 선택된 난이도에 맞는 게임 설정 적용

---

### 3-3. 카운트다운 (Countdown)

난이도 선택 후 3초 카운트다운이 시작됩니다.

**화면 구성**:
- 화면 중앙에 큰 숫자 표시: "3" → "2" → "1" → "Game Start!"
- 각 숫자는 1초 간격으로 표시
- 숫자가 나타날 때마다 애니메이션 효과 (`countdown-pulse`)
- "Game Start!" 텍스트는 확대되며 사라지는 애니메이션 (`gameStartExpand`)

**애니메이션**:
```css
@keyframes countdown-pulse {
  0% { transform: scale(0.5); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes gameStartExpand {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(15); opacity: 0; }
}
```

카운트다운이 끝나면 600ms 후 실제 게임이 시작됩니다.

---

### 3-4. 게임 플레이 (Playing)

**화면 구성**:

**상단 헤더** (game-header):
- 좌측: 뒤로가기 버튼 (게임 센터로 복귀)
- 중앙: 난이도 정보 (🌱/🔥/⚡ 아이콘, 난이도 이름)
- 우측: 🔊/🔇 음악 토글 버튼

**게임 정보** (game-info):
- ⏱ **생존 시간**: MM:SS 형식
- ❤️ **생명**: ❤️❤️❤️ 형식으로 표시 (3개 이상 가능)
- 🏆 **점수**: N점
- 🔥 **콤보**: 2콤보 이상 시 표시 ("N 콤보!")
- ✨ **활성 효과**: 아이템 효과 발동 시 중앙에 애니메이션으로 표시

**게임 영역** (game-area):
- 떨어지는 단어들 표시
- 각 단어:
  - 일반 단어:
    - 입력된 부분: 파란색 (word-matched)
    - 남은 부분: 검은색 (word-remaining)
  - 아이템 단어:
    - 전체 단어: 빨간색 (#ff4757)으로 표시
    - 입력 시 점수 없이 랜덤 효과 발동
  - 숨김 효과 적용 시: 모든 단어가 검은색 블록으로 표시
- 위치: absolute, 좌표(x, y)로 제어
- 애니메이션: requestAnimationFrame으로 부드러운 낙하

**입력 영역** (input-area):
- 입력창: 플레이스홀더 "여기에 단어를 입력하세요..."
- Enter 키로 제출
- 자동 포커스 유지

**게임 로직**:

**1. 단어 생성** (`spawnFallingWord`)
```javascript
const spawnFallingWord = () => {
  const word = getRandomWord(); // 난이도에 맞는 랜덤 단어
  const maxX = gameArea.clientWidth - 120;

  fallingWords.value.push({
    id: ++wordIdCounter,
    word: word,
    x: Math.random() * Math.max(maxX, 100), // 랜덤 x 좌표
    y: 0, // 화면 최상단
    speed: currentConfig.value.speed, // 난이도별 속도
    matched: '' // 일치하는 부분
  });
};
```

**2. 애니메이션 루프** (`animate`)
```javascript
const animate = () => {
  if (gameState.value !== 'playing') return;

  fallingWords.value.forEach((word, index) => {
    word.y += word.speed; // 속도만큼 하강

    // 화면 하단 도달 시
    if (word.y > gameArea.clientHeight - 50) {
      life.value--; // 생명 감소
      comboCount.value = 0; // 콤보 초기화
      fallingWords.value.splice(index, 1); // 단어 제거

      // 게임 오버 체크
      if (life.value <= 0) {
        endGame();
        return;
      }
    }
  });

  animationFrame = requestAnimationFrame(animate);
};
```

**3. 입력 처리** (`handleInput`)
```javascript
const handleInput = (event) => {
  const input = event.target.value;

  // 부분 일치 표시
  for (let i = 0; i < fallingWords.value.length; i++) {
    const word = fallingWords.value[i];

    if (word.word.startsWith(input)) {
      word.matched = input; // 파란색으로 표시
    } else {
      word.matched = ''; // 매칭 해제
    }
  }
};
```

**4. 엔터 제출** (`handleSubmit`)
```javascript
const handleSubmit = async () => {
  const input = userInput.value.trim();

  // 완전히 일치하는 단어 찾기
  for (let i = 0; i < fallingWords.value.length; i++) {
    const word = fallingWords.value[i];

    if (word.word === input) {
      // 점수 추가
      score.value += word.word.length * 10;
      comboCount.value++;
      maxCombo.value = Math.max(maxCombo.value, comboCount.value);

      // 콤보 보너스 (5콤보 이상)
      if (comboCount.value >= 5) {
        score.value += comboCount.value * 2;
      }

      // 단어 제거
      fallingWords.value.splice(i, 1);
      userInput.value = ''; // 입력창 초기화

      // 포커스 유지
      await nextTick();
      if (gameInputRef.value) {
        gameInputRef.value.focus();
      }

      return;
    }
  }

  // 일치하는 단어 없으면 콤보 초기화
  comboCount.value = 0;
  userInput.value = '';
};
```

**5. 단어 생성 간격**
```javascript
// 난이도별 생성 간격
spawnInterval = setInterval(() => {
  spawnFallingWord();
}, currentConfig.value.spawnInterval);

// 초급: 2000ms (2초)
// 중급: 1500ms (1.5초)
// 고급: 1000ms (1초)
```

**6. 아이템 시스템**

**아이템 단어 생성**:
```javascript
// 10~15개 단어마다 랜덤하게 아이템 단어 생성
wordCounter++; // 단어 생성 시마다 카운터 증가

if (wordCounter >= nextItemWordCount) {
  // 아이템 단어 생성
  isItem: true,
  wordCounter = 0,
  nextItemWordCount = Math.floor(Math.random() * 6) + 10 // 10~15
}
```

**아이템 효과 발동**:
```javascript
const itemEffects = [
  { type: 'slowDown', name: '시간 느리기', icon: '⏱️' },
  { type: 'clearAll', name: '전체 클리어', icon: '💥' },
  { type: 'hideWords', name: '단어 숨기기', icon: '🙈' },
  { type: 'speedUp', name: '시간 빠르기', icon: '⚡' },
  { type: 'lifeAdd', name: '생명 추가', icon: '❤️' }
];

// 랜덤 효과 선택 및 발동
const randomEffect = itemEffects[Math.floor(Math.random() * itemEffects.length)];

// 1. 시간 느리기 (5초): 속도 50% 감소
activeEffects.value.slowDown = true;
setTimeout(() => { activeEffects.value.slowDown = false; }, 5000);

// 2. 전체 클리어: 모든 단어 제거 및 점수 획득
fallingWords.value.forEach(word => {
  score.value += word.word.length * 10;
});
fallingWords.value = [];

// 3. 단어 숨기기 (3초): 모든 단어를 검은색 블록으로 표시
activeEffects.value.hideWords = true;
setTimeout(() => { activeEffects.value.hideWords = false; }, 3000);

// 4. 시간 빠르기 (5초): 속도 150% 증가 (디버프)
activeEffects.value.speedUp = true;
setTimeout(() => { activeEffects.value.speedUp = false; }, 5000);

// 5. 생명 추가: 생명 +1 (3개 이상 가능)
life.value++;
```

**효과 적용 (애니메이션 루프)**:
```javascript
const animate = () => {
  fallingWords.value.forEach((word, index) => {
    let currentSpeed = word.speed;

    // 시간 느리기 효과 적용
    if (activeEffects.value.slowDown) {
      currentSpeed *= 0.5;
    }

    // 시간 빠르기 효과 적용
    if (activeEffects.value.speedUp) {
      currentSpeed *= 1.5;
    }

    word.y += currentSpeed;
  });

  animationFrame = requestAnimationFrame(animate);
};
```

**7. 단어 중복 방지 시스템**

**단어 풀 초기화**:
```javascript
const unusedWords = ref([]); // 아직 사용되지 않은 단어 풀

// 게임 시작 시 단어 풀 생성
const shuffleWords = () => {
  const filtered = allWords.value.filter(w =>
    w.length >= currentConfig.value.wordLengthMin &&
    w.length <= currentConfig.value.wordLengthMax
  );

  // Fisher-Yates 셔플 알고리즘으로 섞기
  for (let i = filtered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
  }

  unusedWords.value = filtered;
};
```

**단어 가져오기**:
```javascript
const getRandomWord = () => {
  // 풀이 비었으면 다시 생성
  if (unusedWords.value.length === 0) {
    shuffleWords();
  }

  // 풀에서 단어 하나 꺼내기 (중복 방지)
  return unusedWords.value.pop();
};
```

---

### 3-5. 결과 화면 (Result)

**화면 구성**:

**상단 헤더**:
- 🏆 아이콘, "게임 종료" 제목, "결과 확인" 부제목

**결과 카드**:
- **난이도**: 초급/중급/고급 표시
- **생존 시간**: MM:SS 형식
- **획득 점수**: N점
- **최대 콤보**: N연속

**점수 평가**:
- 1000점 이상: "타자 신!"
  - "완벽한 타자 실력!<br>당신은 타자의 신입니다."
- 700-999점: "타자 마스터!"
  - "훌륭한 타자 실력!<br>거의 완벽에 가깝습니다."
- 500-699점: "타자 고수!"
  - "좋은 타자 실력!<br>조금만 더 연습하면 마스터가 됩니다."
- 300-499점: "잘했어요!"
  - "괜찮은 타자 실력!<br>꾸준히 연습하면 더 좋아질 거예요."
- 0-299점: "더 연습해보세요!"
  - "타자 연습이 필요해요!<br>포기하지 말고 계속 도전하세요."

**액션 버튼** (result-buttons):
- "다시 도전" 버튼: 난이도 선택으로 돌아가기
- "게임 센터로" 버튼: 게임 센터 메인으로 복귀

---

## 4. 파일 구조

### 4-1. 클라이언트 (Client)

#### 컴포넌트
**`client/src/components/game/TyperGame.vue`** (1,500+ 줄)
- 게임의 메인 컴포넌트
- Vue 3.5 Composition API (`<script setup>`) 사용
- 게임 상태 관리: `gameState` ('tutorial', 'difficulty-select', 'countdown', 'playing', 'result')
- 난이도 설정:
  - `selectedDifficulty`: 선택된 난이도 ('beginner', 'intermediate', 'advanced')
  - `difficultyConfig`: 난이도별 설정 객체 (speed, spawnInterval, wordLengthMin/Max, icon, color)
- 게임 데이터:
  - `allWords`: 전체 단어 목록 (JSON 로딩)
  - `unusedWords`: 아직 사용되지 않은 단어 풀 (중복 방지)
  - `fallingWords`: 현재 떨어지고 있는 단어들 [{id, word, x, y, speed, matched, isItem}]
  - `userInput`: 사용자 입력값
  - `score`: 현재 점수
  - `life`: 남은 생명 (3개 이상 가능)
  - `survivalTime`: 생존 시간 (초)
  - `comboCount`: 현재 콤보
  - `maxCombo`: 최대 콤보
- 아이템 시스템:
  - `itemEffects`: 5가지 아이템 효과 목록
  - `activeEffects`: 현재 활성화된 효과 상태 (slowDown, speedUp, hideWords)
  - `activeEffectName`: 현재 활성화된 효과 이름 (상단바 표시용)
  - `wordCounter`: 생성된 단어 개수 카운터
  - `nextItemWordCount`: 다음 아이템이 나올 단어 개수 (10~15)
- 애니메이션:
  - `animationFrame`: requestAnimationFrame ID
  - `spawnInterval`: 단어 생성 인터벌 ID
  - `timerInterval`: 타이머 인터벌 ID
- 음악 재생: `bgMusic`, `isMusicMuted`
- 튜토리얼 관리: `tutorialSteps` (5단계), `currentTutorialStep`
- 주요 함수:
  - `loadWordData()`: JSON 파일에서 단어 로딩
  - `shuffleWords()`: 단어 풀 섞기 (중복 방지)
  - `getRandomWord()`: 난이도에 맞는 랜덤 단어 반환 (중복 방지)
  - `spawnFallingWord()`: 새로운 떨어지는 단어 생성 (아이템 단어 포함)
  - `animate()`: 애니메이션 루프 (requestAnimationFrame, 아이템 효과 적용)
  - `handleInput(event)`: 입력 중 부분 일치 표시
  - `handleSubmit()`: 엔터 키 제출 처리 (아이템 효과 발동)
  - `activateItemEffect(effect)`: 아이템 효과 발동
  - `startGameWithDifficulty(difficulty)`: 난이도 선택 후 게임 시작
  - `beginGame()`: 실제 게임 시작 (타이머, 애니메이션, 단어 생성 시작)
  - `endGame()`: 게임 종료 및 결과 화면 전환
- 화면 전환 시 자동 스크롤: `watch(gameState, () => window.scrollTo({ top: 0, behavior: 'smooth' }))`

#### 데이터
**`client/public/data/typerWords.json`** (JSON)
- 한글 타자 게임용 단어 데이터베이스
- JSON 구조:
  ```json
  {
    "words": [
      "가게", "가격", "가능", "가족", "각자", ...
    ]
  }
  ```
- 다양한 길이의 한글 단어 포함 (2글자~8글자)
- 게임 시작 시 `loadWordData()` 함수로 로딩
- 난이도별 단어 길이 필터링에 활용

#### 오디오
**`client/public/audio/TetrisTheme.mp3`** (바이너리)
- 배경음악 파일
- 게임 플레이 시작 시 자동 재생 (음소거 설정이 아닌 경우)
- loop: true, volume: 0.5 설정
- 게임 종료 시 자동 정지

---

### 4-2. 서버 (Server)

한글 타자 게임은 서버 API를 사용하지 않습니다. 모든 데이터는 클라이언트의 JSON 파일에서 로딩하며, 점수 계산 및 게임 로직도 클라이언트에서 처리합니다.

**이유**:
- 타이핑 게임의 특성상 실시간 응답이 중요
- 네트워크 지연 없이 부드러운 게임 진행
- 단어 검증이 필요 없는 단순 매칭 방식

---

## 5. 데이터 구조

### 5-1. 난이도 설정 (Difficulty Config)

```javascript
const difficultyConfig = {
  beginner: {
    label: '초급',
    speed: 0.8,              // 낙하 속도 (픽셀/프레임)
    spawnInterval: 2000,     // 생성 간격 (ms)
    wordLengthMin: 2,        // 최소 글자 수
    wordLengthMax: 4,        // 최대 글자 수
    icon: '🌱',
    color: '#4CAF50'
  },
  intermediate: {
    label: '중급',
    speed: 1.3,
    spawnInterval: 1500,
    wordLengthMin: 3,
    wordLengthMax: 6,
    icon: '🔥',
    color: '#FF9800'
  },
  advanced: {
    label: '고급',
    speed: 2.0,
    spawnInterval: 1000,
    wordLengthMin: 4,
    wordLengthMax: 8,
    icon: '⚡',
    color: '#F44336'
  }
};
```

---

### 5-2. 떨어지는 단어 객체 (Falling Word)

```javascript
{
  id: 1,                    // 고유 ID
  word: '사과',             // 단어
  x: 150,                   // x 좌표 (픽셀)
  y: 0,                     // y 좌표 (픽셀)
  speed: 0.8,               // 낙하 속도
  matched: '사',            // 입력 중 일치하는 부분 (파란색 표시)
  isItem: false             // 아이템 단어 여부 (true일 경우 빨간색)
}
```

**렌더링**:
```vue
<div
  class="falling-word"
  :class="{
    'item-word': word.isItem,
    'hidden-word': activeEffects.hideWords
  }"
  :style="{ left: word.x + 'px', top: word.y + 'px' }"
>
  <span class="word-matched">{{ word.matched }}</span>
  <span class="word-remaining">{{ word.word.slice(word.matched.length) }}</span>
</div>
```

**CSS**:
```css
/* 일반 단어 */
.word-matched { color: var(--toss-blue); }
.word-remaining { color: var(--gray-900); }

/* 아이템 단어 (빨간색) */
.falling-word.item-word .word-matched,
.falling-word.item-word .word-remaining {
  color: #ff4757;
  font-weight: 700;
}

/* 단어 숨기기 효과 (검은색 블록) */
.falling-word.hidden-word .word-matched,
.falling-word.hidden-word .word-remaining {
  color: transparent;
  background: #000;
  border-radius: 2px;
  padding: 2px 1px;
}
```

---

### 5-3. 점수 계산

```javascript
// 기본 점수
score.value += word.word.length * 10;

// 콤보 보너스 (5콤보 이상)
if (comboCount.value >= 5) {
  score.value += comboCount.value * 2;
}

// 최종 점수 (생존 시간 보너스 제거)
const finalScore = computed(() => {
  return score.value;
});
```

---

## 6. 기술 원리

### 6-1. requestAnimationFrame 애니메이션

부드러운 애니메이션을 위해 `requestAnimationFrame`을 사용합니다.

**원리**:
```javascript
const animate = () => {
  if (gameState.value !== 'playing') return;

  // 모든 단어를 속도만큼 하강
  fallingWords.value.forEach((word, index) => {
    word.y += word.speed; // 매 프레임마다 y 좌표 증가

    // 바닥 도달 체크
    if (word.y > gameArea.clientHeight - 50) {
      life.value--;
      comboCount.value = 0;
      fallingWords.value.splice(index, 1);

      if (life.value <= 0) {
        endGame();
        return;
      }
    }
  });

  // 다음 프레임 요청
  animationFrame = requestAnimationFrame(animate);
};
```

**장점**:
- 브라우저 렌더링 주기에 맞춰 실행 (60fps)
- CSS 애니메이션보다 정밀한 제어 가능
- 탭이 비활성화되면 자동으로 멈춤 (리소스 절약)

---

### 6-2. 부분 일치 표시 (Partial Matching)

사용자가 입력 중일 때 일치하는 부분을 파란색으로 표시합니다.

**알고리즘**:
```javascript
const handleInput = (event) => {
  const input = event.target.value;

  for (let i = 0; i < fallingWords.value.length; i++) {
    const word = fallingWords.value[i];

    // String.startsWith() 사용
    if (word.word.startsWith(input)) {
      word.matched = input; // 일치하는 부분 저장
    } else {
      word.matched = ''; // 매칭 해제
    }
  }
};
```

**렌더링**:
```vue
<!-- 파란색 부분 -->
<span class="word-matched">{{ word.matched }}</span>

<!-- 검은색 부분 -->
<span class="word-remaining">{{ word.word.slice(word.matched.length) }}</span>
```

**CSS**:
```css
.word-matched {
  color: #007AFF; /* 파란색 */
}

.word-remaining {
  color: #333; /* 검은색 */
}
```

---

### 6-3. 엔터 키 제출 시스템

단어 입력 후 엔터 키를 눌러야 제출되는 시스템입니다.

**구현**:
```vue
<input
  ref="gameInputRef"
  v-model="userInput"
  @input="handleInput"
  @keyup.enter="handleSubmit"
  autofocus
/>
```

**처리 흐름**:
```
1. 사용자가 "사과" 입력 중
   - handleInput() 호출
   - "사"만 입력: 일치하는 "사과" 단어가 파란색으로 변경
   - "사과" 완성: 전체가 파란색으로 변경

2. 엔터 키 입력
   - handleSubmit() 호출
   - 완전히 일치하는 단어 찾기
   - 점수 추가, 단어 제거, 콤보 증가
   - 입력창 초기화
   - 포커스 유지

3. 일치하는 단어 없으면
   - 콤보 초기화
   - 입력창 초기화
```

**장점**:
- 정확한 타이밍 제어 가능
- 실수로 잘못된 단어 제출 방지
- 사용자가 입력을 확인할 시간 제공

---

### 6-4. 생명 시스템 시각화

생명 개수만큼 하트를 표시하며, 아이템 효과로 3개 이상 가능합니다.

**알고리즘**:
```javascript
const lifeIcons = computed(() => {
  const hearts = [];
  // 현재 생명 개수만큼 하트 표시 (3개 이상도 가능)
  for (let i = 0; i < life.value; i++) {
    hearts.push('❤️');
  }
  return hearts.join('');
});
```

**예시**:
```
life = 5: ❤️❤️❤️❤️❤️ (아이템으로 추가)
life = 3: ❤️❤️❤️
life = 2: ❤️❤️
life = 1: ❤️
life = 0: (게임 오버)
```

---

### 6-5. 아이템 시스템

10~15개 단어마다 빨간색 아이템 단어가 나타나며, 5가지 랜덤 효과 중 하나가 발동됩니다.

**아이템 생성 로직**:
```javascript
let wordCounter = 0;
let nextItemWordCount = Math.floor(Math.random() * 6) + 10; // 10~15

const spawnFallingWord = () => {
  wordCounter++;
  let isItem = false;

  // 카운터가 목표치에 도달하면 아이템 생성
  if (wordCounter >= nextItemWordCount) {
    isItem = true;
    wordCounter = 0;
    nextItemWordCount = Math.floor(Math.random() * 6) + 10;
  }

  fallingWords.value.push({
    id: ++wordIdCounter,
    word: getRandomWord(),
    isItem: isItem,
    // ... 기타 속성
  });
};
```

**효과 발동**:
```javascript
const activateItemEffect = (effect) => {
  activeEffectName.value = `${effect.icon} ${effect.name}`;

  switch (effect.type) {
    case 'slowDown':
      activeEffects.value.slowDown = true;
      setTimeout(() => {
        activeEffects.value.slowDown = false;
        if (activeEffectName.value === `${effect.icon} ${effect.name}`) {
          activeEffectName.value = '';
        }
      }, 5000);
      break;

    case 'clearAll':
      fallingWords.value.forEach(w => {
        if (!w.isItem) score.value += w.word.length * 10;
      });
      fallingWords.value = [];
      setTimeout(() => { activeEffectName.value = ''; }, 2000);
      break;

    case 'hideWords':
      activeEffects.value.hideWords = true;
      setTimeout(() => {
        activeEffects.value.hideWords = false;
        if (activeEffectName.value === `${effect.icon} ${effect.name}`) {
          activeEffectName.value = '';
        }
      }, 3000);
      break;

    case 'speedUp':
      activeEffects.value.speedUp = true;
      setTimeout(() => {
        activeEffects.value.speedUp = false;
        if (activeEffectName.value === `${effect.icon} ${effect.name}`) {
          activeEffectName.value = '';
        }
      }, 5000);
      break;

    case 'lifeAdd':
      life.value++;
      setTimeout(() => { activeEffectName.value = ''; }, 2000);
      break;
  }
};
```

**효과 표시 (상단바 중앙)**:
```css
.effect-text-center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 18px;
  font-weight: 700;
  color: #667eea;
  animation: effectBounceRotate 1s ease-in-out infinite;
  text-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
  z-index: 10;
}

@keyframes effectBounceRotate {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
  }
  25% {
    transform: translate(-50%, -50%) scale(1.15) rotate(-3deg);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.3) rotate(0deg);
  }
  75% {
    transform: translate(-50%, -50%) scale(1.15) rotate(3deg);
  }
}
```

---

### 6-6. 단어 중복 방지 시스템

Fisher-Yates 셔플 알고리즘을 사용하여 모든 단어를 섞고, 순차적으로 사용합니다.

**단어 풀 생성**:
```javascript
const unusedWords = ref([]);

const shuffleWords = () => {
  // 난이도에 맞는 단어 필터링
  const filtered = allWords.value.filter(w =>
    w.length >= currentConfig.value.wordLengthMin &&
    w.length <= currentConfig.value.wordLengthMax
  );

  // Fisher-Yates 셔플
  for (let i = filtered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
  }

  unusedWords.value = filtered;
};
```

**단어 사용 및 재생성**:
```javascript
const getRandomWord = () => {
  // 풀이 비었으면 다시 생성
  if (unusedWords.value.length === 0) {
    shuffleWords();
  }

  // 풀에서 단어 하나 꺼내기 (중복 방지)
  return unusedWords.value.pop();
};
```

---

### 6-7. 자동 스크롤 시스템

게임 화면 전환 시 자동으로 페이지 상단으로 스크롤하여 UX를 개선합니다.

**구현**:
```javascript
// 게임 상태 변경 시 스크롤 맨 위로
watch(gameState, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
```

**적용 시점**:
- 튜토리얼 → 난이도 선택
- 난이도 선택 → 카운트다운
- 카운트다운 → 게임 플레이
- 게임 플레이 → 결과 화면
- 결과 화면 → 난이도 선택 (다시 도전)

---

## 7. 디자인 시스템

### 7-1. Toss 디자인 시스템

한글 타자 게임은 Toss Design System을 기반으로 한 깔끔하고 직관적인 UI를 제공합니다.

**컬러 팔레트**:
- `--toss-blue`: 메인 강조색 (#007AFF) - 버튼, 진행 상태
- `--gray-50`: 페이지 배경색 (#F9F9F9)
- `--gray-100`: 게임 영역 배경색 (#F5F5F5)
- `--gray-200`: 테두리 색상
- `--gray-600`: 부제목 및 보조 텍스트
- `--gray-900`: 주요 텍스트
- `#4CAF50`: 초급 난이도 색상 (초록색)
- `#FF9800`: 중급 난이도 색상 (주황색)
- `#F44336`: 고급 난이도 색상 (빨간색)

**타이포그래피**:
- `.toss-title2`: 24px, font-weight: 700 (헤더 제목)
- `.toss-title3`: 20px, font-weight: 700 (섹션 제목)
- `.toss-body1`: 16px, font-weight: 500 (본문)
- 떨어지는 단어: 20px, font-weight: 600

**게임 영역 스타일**:
```css
.game-area {
  position: relative;
  background: linear-gradient(to bottom, #E3F2FD, #FFFFFF);
  border: 2px solid #90CAF9;
  border-radius: 12px;
  height: 400px;
  overflow: hidden;
}

.falling-word {
  position: absolute;
  font-size: 20px;
  font-weight: 600;
  white-space: nowrap;
  cursor: default;
  user-select: none;
}
```

---

### 7-2. 애니메이션

**단어 낙하 애니메이션**:
- requestAnimationFrame으로 부드러운 60fps 애니메이션
- 속도에 따라 픽셀 단위로 y 좌표 증가

**난이도 카드 호버** (`difficulty-card:hover`):
```css
.difficulty-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```
- 카드에 마우스 올리면 위로 올라감
- 그림자 강화

**입력창 포커스**:
```css
.game-input:focus {
  border: 2px solid #007AFF;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}
```

---

### 7-3. 반응형 디자인

**브레이크포인트**:
- Desktop: 1200px 이상 (기본)
- Tablet: 768px 이하
- Mobile: 480px 이하

**Mobile (480px 이하)**:
```css
@media (max-width: 480px) {
  .game-area {
    height: 300px; /* 게임 영역 높이 축소 */
  }

  .falling-word {
    font-size: 16px; /* 단어 크기 축소 */
  }

  .difficulty-cards {
    flex-direction: column; /* 난이도 카드 세로 배치 */
  }

  .game-input {
    font-size: 14px; /* 입력창 크기 축소 */
  }
}
```

---

## 8. 환경 설정

### 8-1. 환경 변수

한글 타자 게임은 서버 API를 사용하지 않으므로 환경 변수가 필요하지 않습니다.

**클라이언트만 필요**:
```bash
# .env 파일 불필요
# JSON 파일과 오디오 파일만 public 폴더에 위치
```

---

### 8-2. 실행 방법

**클라이언트 실행** (포트 5288):
```bash
cd client
npm install
npm run dev
```

**전체 실행** (루트 디렉토리):
```bash
npm run dev  # 클라이언트만 실행 (서버 불필요)
```

---

### 8-3. 접속 URL

- **게임 센터**: `http://localhost:5288/game`
- **직접 접속**: `http://localhost:5288/game/typer`

---

## 9. 주요 기능 요약

| 기능 | 설명 | 기술 |
|------|------|------|
| 난이도 시스템 | 3단계 난이도 (속도, 단어 길이) | difficultyConfig 객체 |
| 부드러운 애니메이션 | 60fps 실시간 낙하 | requestAnimationFrame |
| 부분 일치 표시 | 입력 중 파란색 강조 | String.startsWith() |
| 엔터 제출 | 정확한 타이밍 제어 | @keyup.enter |
| 생명 시스템 | 기본 3개 하트, 아이템으로 추가 가능 | Computed lifeIcons |
| 콤보 시스템 | 연속 성공 보너스 | comboCount, 5콤보 이상 |
| 점수 계산 | 글자 수 × 10점 + 콤보 | score.value |
| 아이템 시스템 | 5가지 랜덤 효과 (10~15개마다) | 빨간색 단어, activeEffects |
| 단어 중복 방지 | 한 게임 내 동일 단어 미출현 | Fisher-Yates 셔플, unusedWords |
| 자동 스크롤 | 화면 전환 시 페이지 상단으로 | watch(gameState), window.scrollTo |
| 튜토리얼 | 5단계 인터랙티브 가이드 | Vue Composition API |
| 배경음악 | TetrisTheme.mp3 자동 재생 | Audio API, localStorage |
| 반응형 디자인 | Desktop/Tablet/Mobile 지원 | CSS Media Queries |

---

## 10. 개선 가능한 부분

- ~~**파워업 아이템**: 시간 느리기, 생명 추가, 점수 2배 등~~ ✅ **구현 완료** (2025-11-26)
- **레벨 시스템**: 점수에 따라 자동으로 난이도 증가
- **리더보드**: 최고 점수 기록 및 랭킹 시스템
- **소셜 공유**: 결과 화면에서 SNS 공유 기능
- **다양한 모드**: 타임어택, 무한 모드, 단어 테마별 모드
- **멀티플레이**: 2인 대결 모드
- **통계 분석**: 평균 타수, 정확도, 최고 콤보 등
- **단어장**: 틀린 단어 복습 기능
- **업적 시스템**: 특정 조건 달성 시 뱃지 획득
- **아이템 효과 개선**: 점수 2배, 콤보 보호 등 추가 효과
