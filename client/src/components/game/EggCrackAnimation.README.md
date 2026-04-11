# 알껍데기 애니메이션 사용 가이드

## 개요

크로스워드 퍼즐 게임에서 사용되는 알껍데기 깨지는 애니메이션 컴포넌트입니다.

### 주요 기능

- ✨ 중심에서 시작되는 자연스러운 균열 효과
- 💥 조각들이 회전하며 바깥으로 튀어나가는 애니메이션
- 🎯 중력과 관성을 고려한 물리 효과
- 📝 파편이 사라진 후 글자가 바운스 효과와 함께 부드럽게 등장
- 🎨 깔끔하고 UI에 적합한 디자인
- 📸 PNG 프레임 캡처 기능

## 파일 구조

```
client/src/components/game/
├── EggCrackAnimation.vue        # 메인 애니메이션 컴포넌트
├── EggCrackFrameExporter.vue    # PNG 프레임 추출 도구
├── CrosswordPuzzleGame.vue      # 게임에 통합됨
└── EggCrackAnimation.README.md  # 이 문서
```

## 1. 게임에서 사용하기

알껍데기 애니메이션은 이미 **CrosswordPuzzleGame.vue**에 통합되어 있습니다.

### 동작 방식

1. 포기 버튼을 클릭하면 정답 공개가 시작됩니다
2. 각 셀에 알껍데기 애니메이션이 표시됩니다
3. 애니메이션 진행:
   - **균열 단계**: 중심에서 균열이 퍼짐 (약 0.2초)
   - **깨짐 단계**: 조각들이 회전하며 바깥으로 튀어나감 (약 0.6초)
   - **등장 단계**: 정답 글자가 바운스 효과와 함께 나타남 (약 0.4초)

### 커스터마이징

`CrosswordPuzzleGame.vue`의 1595-1602 라인에서 설정을 변경할 수 있습니다:

```vue
<EggCrackAnimation
    :letter="userAnswers[`${rowIndex}-${colIndex}`] || ''"
    :size="40"          <!-- 애니메이션 크기 (픽셀) -->
    :fontSize="18"      <!-- 글자 크기 (픽셀) -->
    :autoStart="true"   <!-- 자동 시작 여부 -->
    @complete="handleEggCrackComplete(rowIndex, colIndex)"
/>
```

## 2. PNG 프레임 추출하기

### 2-1. 프레임 추출 페이지 접속

Vue Router에 다음 라우트를 추가하세요:

```javascript
// router/index.js
{
  path: '/egg-crack-exporter',
  name: 'EggCrackExporter',
  component: () => import('@/components/game/EggCrackFrameExporter.vue')
}
```

그 다음 브라우저에서 `/egg-crack-exporter` 경로로 이동합니다.

### 2-2. 프레임 캡처

1. **글자 입력**: 애니메이션에 표시할 글자를 입력 (예: 가, 나, A, 1 등)
2. **크기 설정**: 애니메이션 크기를 픽셀 단위로 설정 (기본값: 40px)
3. **프레임 캡처 시작** 버튼 클릭
4. 애니메이션이 자동으로 실행되며 모든 프레임이 캡처됩니다

### 2-3. 프레임 다운로드

캡처가 완료되면 다음 옵션 중 하나를 선택:

- **모든 프레임 다운로드**: 각 프레임을 개별 PNG 파일로 다운로드
- **ZIP으로 다운로드**: 모든 프레임을 하나의 ZIP 파일로 다운로드 (권장)

### 2-4. 프레임 파일명 규칙

```
frame-001-균열.png
frame-002-균열.png
...
frame-015-깨짐.png
...
frame-050-등장.png
```

## 3. 독립 컴포넌트로 사용하기

다른 Vue 컴포넌트에서 직접 사용할 수 있습니다:

```vue
<template>
    <div>
        <EggCrackAnimation
            letter="가"
            :size="60"
            :fontSize="24"
            :autoStart="false"
            :captureFrames="false"
            @complete="onAnimationComplete"
        />
    </div>
</template>

<script setup>
import { ref } from 'vue';
import EggCrackAnimation from '@/components/game/EggCrackAnimation.vue';

const animationRef = ref(null);

const onAnimationComplete = () => {
    console.log('애니메이션 완료!');
};

// 수동으로 애니메이션 시작
const startAnimation = () => {
    animationRef.value?.start();
};
</script>
```

### Props

| 속성 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `letter` | String | 필수 | 애니메이션 후 표시할 글자 |
| `size` | Number | 40 | 애니메이션 크기 (픽셀) |
| `fontSize` | Number | 18 | 글자 크기 (픽셀) |
| `autoStart` | Boolean | true | 자동 시작 여부 |
| `captureFrames` | Boolean | false | 프레임 캡처 활성화 |

### Events

| 이벤트 | 설명 |
|--------|------|
| `@complete` | 애니메이션 완료 시 발생 |
| `@frames-captured` | 프레임 캡처 완료 시 발생 (captureFrames=true일 때만) |

### Methods

| 메서드 | 설명 |
|--------|------|
| `start()` | 애니메이션 시작 (autoStart=false일 때 사용) |
| `getFrames()` | 캡처된 프레임 배열 반환 |

## 4. 애니메이션 커스터마이징

### 4-1. 색상 변경

`EggCrackAnimation.vue`의 141-156 라인에서 색상을 변경할 수 있습니다:

```javascript
// 알 배경 색상
const gradient = ctx.createRadialGradient(0, -radius * 0.3, 0, 0, 0, radius);
gradient.addColorStop(0, '#ffffff');  // 중앙 색상
gradient.addColorStop(0.5, '#e3f2fd'); // 중간 색상
gradient.addColorStop(1, '#90caf9');   // 외곽 색상

// 테두리 색상
ctx.strokeStyle = '#42a5f5';
```

### 4-2. 파편 개수 및 동작 변경

`EggCrackAnimation.vue`의 127-143 라인:

```javascript
function createFragments() {
    const centerX = props.size;
    const centerY = props.size;
    const numFragments = 12;  // 파편 개수 조절
    const radius = props.size * 0.7;

    // ... 파편 생성 로직
}
```

### 4-3. 애니메이션 속도 조절

각 단계의 duration을 조절:

```javascript
// 균열 단계: 8 프레임 후 깨짐 단계로 전환
if (allComplete && currentFrame > 8) {
    phase = 'shattering';
}

// 깨짐 단계: 35 프레임 후 등장 단계로 전환
if (currentFrame > 35) {
    phase = 'revealing';
}

// 등장 단계: 20 프레임 후 완료
if (currentFrame > 20) {
    phase = 'complete';
}
```

## 5. 성능 최적화

- Canvas는 retina 디스플레이를 위해 2배 해상도로 렌더링됩니다
- 애니메이션은 requestAnimationFrame을 사용하여 60fps로 실행됩니다
- 컴포넌트가 unmount되면 애니메이션이 자동으로 정리됩니다

## 6. 브라우저 호환성

- Chrome/Edge: ✅ 완벽 지원
- Firefox: ✅ 완벽 지원
- Safari: ✅ 완벽 지원
- IE11: ❌ 미지원 (Canvas 2D API 필요)

## 7. 문제 해결

### 애니메이션이 보이지 않아요

1. `autoStart` prop이 `true`인지 확인
2. `letter` prop이 올바르게 전달되었는지 확인
3. 브라우저 콘솔에서 에러 메시지 확인

### 프레임이 캡처되지 않아요

1. `captureFrames` prop이 `true`인지 확인
2. JSZip 라이브러리가 설치되어 있는지 확인: `npm install jszip`

### 애니메이션이 너무 빨라요/느려요

`EggCrackAnimation.vue`의 각 단계별 duration을 조절하세요 (위의 4-3 참조)

## 8. 라이선스 및 크레딧

이 컴포넌트는 명지일개미LAB 프로젝트의 일부입니다.

---

**문의사항이 있으시면 개발팀에 연락해주세요!**
