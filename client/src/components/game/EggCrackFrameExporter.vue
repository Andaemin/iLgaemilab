<template>
    <div class="frame-exporter">
        <div class="controls">
            <h2>알껍데기 애니메이션 프레임 추출기</h2>
            <div class="input-group">
                <label>글자:</label>
                <input v-model="letter" type="text" maxlength="1" placeholder="가" />
            </div>
            <div class="input-group">
                <label>크기:</label>
                <input v-model.number="size" type="number" min="20" max="200" />
            </div>
            <div class="button-group">
                <button @click="startCapture" :disabled="capturing">프레임 캡처 시작</button>
                <button @click="downloadAll" :disabled="frames.length === 0">모든 프레임 다운로드</button>
                <button @click="downloadZip" :disabled="frames.length === 0">ZIP으로 다운로드</button>
                <button @click="clearFrames" :disabled="frames.length === 0">초기화</button>
            </div>
            <div v-if="capturing" class="status">
                캡처 중... ({{ frames.length }} 프레임)
            </div>
            <div v-if="frames.length > 0 && !capturing" class="status success">
                총 {{ frames.length }} 프레임 캡처 완료!
            </div>
        </div>

        <div class="preview-section">
            <h3>애니메이션 미리보기</h3>
            <div class="animation-container">
                <EggCrackAnimation
                    v-if="showAnimation"
                    ref="animationRef"
                    :letter="letter"
                    :size="size"
                    :fontSize="Math.floor(size * 0.45)"
                    :autoStart="false"
                    :captureFrames="true"
                    @complete="handleCaptureComplete"
                    @frames-captured="handleFramesCaptured"
                />
            </div>
        </div>

        <div v-if="frames.length > 0" class="frames-grid">
            <h3>캡처된 프레임 ({{ frames.length }}장)</h3>
            <div class="grid">
                <div v-for="frame in frames" :key="frame.frame" class="frame-item">
                    <div class="frame-number">Frame {{ frame.frame + 1 }}</div>
                    <div class="frame-phase">{{ getPhaseLabel(frame.phase) }}</div>
                    <img :src="frame.data" :alt="`Frame ${frame.frame + 1}`" />
                    <button @click="downloadFrame(frame)" class="download-btn">다운로드</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import EggCrackAnimation from './EggCrackAnimation.vue';
import JSZip from 'jszip';

const letter = ref('가');
const size = ref(40);
const capturing = ref(false);
const showAnimation = ref(false);
const frames = ref([]);
const animationRef = ref(null);

const getPhaseLabel = (phase) => {
    const labels = {
        'cracking': '균열',
        'shattering': '깨짐',
        'revealing': '등장'
    };
    return labels[phase] || phase;
};

const startCapture = async () => {
    frames.value = [];
    capturing.value = true;
    showAnimation.value = false;

    await nextTick();
    showAnimation.value = true;

    await nextTick();
    if (animationRef.value) {
        animationRef.value.start();
    }
};

const handleCaptureComplete = () => {
    capturing.value = false;
};

const handleFramesCaptured = (capturedFrames) => {
    frames.value = capturedFrames;
};

const downloadFrame = (frame) => {
    const link = document.createElement('a');
    link.download = `egg-crack-${letter.value}-frame-${String(frame.frame + 1).padStart(3, '0')}.png`;
    link.href = frame.data;
    link.click();
};

const downloadAll = () => {
    frames.value.forEach((frame, index) => {
        setTimeout(() => {
            downloadFrame(frame);
        }, index * 100);
    });
};

const downloadZip = async () => {
    const zip = new JSZip();
    const folder = zip.folder(`egg-crack-${letter.value}-frames`);

    frames.value.forEach((frame) => {
        const base64Data = frame.data.split(',')[1];
        const filename = `frame-${String(frame.frame + 1).padStart(3, '0')}-${getPhaseLabel(frame.phase)}.png`;
        folder.file(filename, base64Data, { base64: true });
    });

    // README 파일 추가
    const readme = `알껍데기 애니메이션 프레임
글자: ${letter.value}
총 프레임 수: ${frames.value.length}
크기: ${size.value}x${size.value}px

프레임 구성:
- 균열 단계: 중심에서 균열이 퍼짐
- 깨짐 단계: 조각들이 회전하며 바깥으로 튀어나감
- 등장 단계: 글자가 부드럽게 나타남

생성 일시: ${new Date().toLocaleString('ko-KR')}
`;
    folder.file('README.txt', readme);

    const blob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.download = `egg-crack-${letter.value}-frames.zip`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
};

const clearFrames = () => {
    frames.value = [];
    showAnimation.value = false;
};
</script>

<style scoped>
.frame-exporter {
    padding: 40px;
    max-width: 1400px;
    margin: 0 auto;
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
}

.controls {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 24px;
}

h2 {
    margin: 0 0 20px 0;
    color: #1e293b;
    font-size: 24px;
}

h3 {
    margin: 0 0 16px 0;
    color: #1e293b;
    font-size: 18px;
}

.input-group {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
}

.input-group label {
    font-weight: 600;
    color: #475569;
    min-width: 60px;
}

.input-group input {
    padding: 8px 12px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 16px;
    width: 200px;
}

.input-group input:focus {
    outline: none;
    border-color: #3b82f6;
}

.button-group {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

button {
    padding: 10px 20px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

button:hover:not(:disabled) {
    background: #2563eb;
    transform: translateY(-1px);
}

button:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
    transform: none;
}

.status {
    margin-top: 16px;
    padding: 12px;
    background: #f1f5f9;
    border-radius: 8px;
    color: #475569;
    font-weight: 500;
}

.status.success {
    background: #dcfce7;
    color: #166534;
}

.preview-section {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 24px;
}

.animation-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100px;
    padding: 20px;
    background:
        repeating-conic-gradient(#f1f5f9 0% 25%, white 0% 50%)
        50% / 20px 20px;
    border-radius: 8px;
}

.frames-grid {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
}

.frame-item {
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
}

.frame-item:hover {
    border-color: #3b82f6;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.frame-number {
    font-size: 12px;
    font-weight: 700;
    color: #1e293b;
}

.frame-phase {
    font-size: 11px;
    color: #64748b;
    background: white;
    padding: 2px 8px;
    border-radius: 4px;
}

.frame-item img {
    width: 100%;
    height: auto;
    background:
        repeating-conic-gradient(#f1f5f9 0% 25%, white 0% 50%)
        50% / 10px 10px;
    border-radius: 4px;
}

.download-btn {
    padding: 6px 12px;
    font-size: 12px;
    background: #10b981;
    width: 100%;
}

.download-btn:hover:not(:disabled) {
    background: #059669;
}
</style>
