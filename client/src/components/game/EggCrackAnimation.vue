<template>
    <div class="egg-crack-container" :style="{ width: size + 'px', height: size + 'px' }">
        <canvas
            ref="canvas"
            :width="size * 2"
            :height="size * 2"
            :style="{ width: size + 'px', height: size + 'px' }"
        ></canvas>
        <div v-if="showLetter" class="revealed-letter" :style="{ fontSize: fontSize + 'px' }">
            {{ letter }}
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';

const props = defineProps({
    letter: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        default: 40
    },
    fontSize: {
        type: Number,
        default: 18
    },
    autoStart: {
        type: Boolean,
        default: true
    },
    captureFrames: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['complete', 'frames-captured']);

const canvas = ref(null);
const showLetter = ref(false);
const frames = ref([]);

// 파편 클래스
class Fragment {
    constructor(x, y, width, height, angle, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.angle = angle;
        this.rotation = 0;
        this.color = color;

        // 중심점에서의 각도에 따라 속도 방향 결정
        const centerX = props.size;
        const centerY = props.size;
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const normalizedDx = dx / distance;
        const normalizedDy = dy / distance;

        // 랜덤 속도 (바깥쪽 방향)
        const speed = 2 + Math.random() * 4;
        this.vx = normalizedDx * speed;
        this.vy = normalizedDy * speed - (1 + Math.random() * 2); // 위쪽으로 약간 더 튀도록

        // 회전 속도
        this.rotationSpeed = (Math.random() - 0.5) * 0.3;

        // 중력
        this.gravity = 0.3;

        // 투명도
        this.opacity = 1;
        this.fadeStart = 20; // 20 프레임 후부터 페이드
    }

    update(frame) {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.rotation += this.rotationSpeed;

        // 페이드 아웃
        if (frame > this.fadeStart) {
            this.opacity = Math.max(0, 1 - (frame - this.fadeStart) / 10);
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // 파편 그리기
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#90caf9';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(-this.width / 2, -this.height / 2);
        ctx.lineTo(this.width / 2, -this.height / 2);
        ctx.lineTo(this.width / 2, this.height / 2);
        ctx.lineTo(-this.width / 2, this.height / 2);
        ctx.closePath();

        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }
}

// 균열 클래스
class Crack {
    constructor(startX, startY, angle, length) {
        this.startX = startX;
        this.startY = startY;
        this.angle = angle;
        this.maxLength = length;
        this.currentLength = 0;
        this.speed = 8;
    }

    update() {
        this.currentLength = Math.min(this.currentLength + this.speed, this.maxLength);
    }

    draw(ctx) {
        const endX = this.startX + Math.cos(this.angle) * this.currentLength;
        const endY = this.startY + Math.sin(this.angle) * this.currentLength;

        ctx.strokeStyle = '#1565c0';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(this.startX, this.startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // 가지 균열
        if (this.currentLength > this.maxLength * 0.5 && this.currentLength < this.maxLength * 0.6) {
            const branchX = this.startX + Math.cos(this.angle) * this.currentLength * 0.5;
            const branchY = this.startY + Math.sin(this.angle) * this.currentLength * 0.5;
            const branchAngle = this.angle + (Math.random() - 0.5) * Math.PI / 3;
            const branchEndX = branchX + Math.cos(branchAngle) * this.maxLength * 0.3;
            const branchEndY = branchY + Math.sin(branchAngle) * this.maxLength * 0.3;

            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(branchX, branchY);
            ctx.lineTo(branchEndX, branchEndY);
            ctx.stroke();
        }
    }

    isComplete() {
        return this.currentLength >= this.maxLength;
    }
}

let animationId = null;
let fragments = [];
let cracks = [];
let currentFrame = 0;
let phase = 'idle'; // idle, cracking, shattering, revealing

function createCracks() {
    const centerX = props.size;
    const centerY = props.size;
    const numCracks = 8;

    for (let i = 0; i < numCracks; i++) {
        const angle = (Math.PI * 2 * i) / numCracks + (Math.random() - 0.5) * 0.3;
        const length = props.size * 0.8 + Math.random() * props.size * 0.3;
        cracks.push(new Crack(centerX, centerY, angle, length));
    }
}

function createFragments() {
    const centerX = props.size;
    const centerY = props.size;
    const numFragments = 12;
    const radius = props.size * 0.7;

    for (let i = 0; i < numFragments; i++) {
        const angle = (Math.PI * 2 * i) / numFragments;
        const x = centerX + Math.cos(angle) * radius * (0.5 + Math.random() * 0.5);
        const y = centerY + Math.sin(angle) * radius * (0.5 + Math.random() * 0.5);
        const width = 10 + Math.random() * 15;
        const height = 10 + Math.random() * 15;
        const color = i % 2 === 0 ? '#e3f2fd' : '#bbdefb';

        fragments.push(new Fragment(x, y, width, height, angle, color));
    }
}

function drawEgg(ctx) {
    const centerX = props.size;
    const centerY = props.size;
    const radius = props.size * 0.8;

    // 알 모양 그리기
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(1, 1.2);

    // 그라디언트
    const gradient = ctx.createRadialGradient(0, -radius * 0.3, 0, 0, 0, radius);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.5, '#e3f2fd');
    gradient.addColorStop(1, '#90caf9');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    // 테두리
    ctx.strokeStyle = '#42a5f5';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
}

function animate() {
    const ctx = canvas.value.getContext('2d');
    const width = props.size * 2;
    const height = props.size * 2;

    // 배경 클리어
    ctx.clearRect(0, 0, width, height);

    if (phase === 'idle') {
        drawEgg(ctx);
    } else if (phase === 'cracking') {
        drawEgg(ctx);

        // 균열 업데이트 및 그리기
        let allComplete = true;
        for (const crack of cracks) {
            crack.update();
            crack.draw(ctx);
            if (!crack.isComplete()) {
                allComplete = false;
            }
        }

        currentFrame++;

        // 모든 균열이 완성되면 shattering 단계로
        if (allComplete && currentFrame > 8) {
            phase = 'shattering';
            currentFrame = 0;
        }
    } else if (phase === 'shattering') {
        // 파편 업데이트 및 그리기
        for (const fragment of fragments) {
            fragment.update(currentFrame);
            fragment.draw(ctx);
        }

        currentFrame++;

        // 파편이 모두 사라지면 revealing 단계로
        if (currentFrame > 35) {
            phase = 'revealing';
            currentFrame = 0;
            showLetter.value = true;
        }
    } else if (phase === 'revealing') {
        currentFrame++;

        // 애니메이션 완료
        if (currentFrame > 20) {
            phase = 'complete';
            cancelAnimationFrame(animationId);
            emit('complete');

            if (props.captureFrames) {
                emit('frames-captured', frames.value);
            }
            return;
        }
    }

    // 프레임 캡처
    if (props.captureFrames && phase !== 'idle' && phase !== 'complete') {
        const frameData = canvas.value.toDataURL('image/png');
        frames.value.push({
            frame: frames.value.length,
            data: frameData,
            phase: phase
        });
    }

    animationId = requestAnimationFrame(animate);
}

function start() {
    // 초기화
    fragments = [];
    cracks = [];
    currentFrame = 0;
    frames.value = [];
    showLetter.value = false;

    // 균열 및 파편 생성
    createCracks();
    createFragments();

    // 애니메이션 시작
    phase = 'cracking';

    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    animate();
}

onMounted(() => {
    if (props.autoStart) {
        nextTick(() => {
            start();
        });
    }
});

defineExpose({
    start,
    getFrames: () => frames.value
});
</script>

<style scoped>
.egg-crack-container {
    position: relative;
    display: inline-block;
}

canvas {
    display: block;
}

.revealed-letter {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-weight: 600;
    color: #1e293b;
    animation: letterReveal 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    pointer-events: none;
}

@keyframes letterReveal {
    0% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.3);
    }
    60% {
        transform: translate(-50%, -50%) scale(1.1);
    }
    100% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
    }
}
</style>
