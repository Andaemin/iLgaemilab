<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'line',
    validator: (value) => ['line', 'bar', 'doughnut', 'progress'].includes(value)
  },
  data: {
    type: Array,
    required: true
  },
  labels: {
    type: Array,
    required: true
  },
  color: {
    type: String,
    default: 'primary'
  },
  height: {
    type: Number,
    default: 200
  },
  percentage: {
    type: Number,
    default: 0
  },
  animated: {
    type: Boolean,
    default: true
  }
})

const chartRef = ref(null)
const animationProgress = ref(0)

const getColorValue = (colorName) => {
  const colorMap = {
    primary: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4',
    secondary: '#6B7280'
  }
  return colorMap[colorName] || colorMap.primary
}

// 라인 차트 데이터 생성
const lineChartData = computed(() => {
  if (props.type !== 'line') return null
  
  const maxValue = Math.max(...props.data)
  const normalizedData = props.data.map(value => (value / maxValue) * 100)
  
  let path = ''
  const width = 300
  const height = props.height - 40
  const stepX = width / (props.data.length - 1)
  
  normalizedData.forEach((value, index) => {
    const x = index * stepX
    const y = height - (value / 100) * height
    
    if (index === 0) {
      path += `M ${x} ${y}`
    } else {
      path += ` L ${x} ${y}`
    }
  })
  
  return path
})

// 바 차트 바 생성
const barChartBars = computed(() => {
  if (props.type !== 'bar') return []
  
  const maxValue = Math.max(...props.data)
  const barWidth = 300 / props.data.length * 0.8
  const spacing = 300 / props.data.length * 0.2
  
  return props.data.map((value, index) => {
    const height = (value / maxValue) * (props.height - 60)
    const x = index * (barWidth + spacing) + spacing / 2
    const y = props.height - 40 - height
    
    return {
      x,
      y,
      width: barWidth,
      height,
      value
    }
  })
})

// 도넛 차트 경로 생성
const doughnutPath = computed(() => {
  if (props.type !== 'doughnut') return null
  
  const radius = 60
  const innerRadius = 40
  const centerX = 80
  const centerY = 80
  const percentage = props.percentage / 100
  const angle = percentage * 2 * Math.PI
  
  const x1 = centerX + radius * Math.cos(-Math.PI / 2)
  const y1 = centerY + radius * Math.sin(-Math.PI / 2)
  const x2 = centerX + radius * Math.cos(-Math.PI / 2 + angle)
  const y2 = centerY + radius * Math.sin(-Math.PI / 2 + angle)
  
  const largeArc = angle > Math.PI ? 1 : 0
  
  return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`
})

// 애니메이션 시작
const startAnimation = () => {
  if (!props.animated) {
    animationProgress.value = 100
    return
  }
  
  let progress = 0
  const animate = () => {
    progress += 2
    animationProgress.value = Math.min(progress, 100)
    
    if (progress < 100) {
      requestAnimationFrame(animate)
    }
  }
  
  requestAnimationFrame(animate)
}

onMounted(() => {
  nextTick(() => {
    startAnimation()
  })
})
</script>

<template>
  <div class="common-chart" :style="{ height: `${height}px` }">
    <!-- 라인 차트 -->
    <svg v-if="type === 'line'" :width="300" :height="height" class="line-chart">
      <defs>
        <linearGradient :id="`gradient-${color}`" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" :stop-color="getColorValue(color)" stop-opacity="0.3"/>
          <stop offset="100%" :stop-color="getColorValue(color)" stop-opacity="0"/>
        </linearGradient>
      </defs>
      
      <!-- 그리드 라인 -->
      <g class="grid">
        <line v-for="i in 5" :key="`h-${i}`"
          :x1="0" :y1="(height - 40) / 4 * (i - 1) + 20"
          :x2="300" :y2="(height - 40) / 4 * (i - 1) + 20"
          stroke="rgb(var(--v-theme-grey-200))" 
          stroke-width="1"
          stroke-dasharray="2,2"
        />
      </g>
      
      <!-- 영역 채우기 -->
      <path
        v-if="lineChartData"
        :d="`${lineChartData} L 300 ${height - 20} L 0 ${height - 20} Z`"
        :fill="`url(#gradient-${color})`"
        opacity="0.6"
        :style="{ 
          strokeDasharray: animationProgress < 100 ? '1000' : 'none',
          strokeDashoffset: animationProgress < 100 ? 1000 - (animationProgress * 10) : 0
        }"
      />
      
      <!-- 라인 -->
      <path
        v-if="lineChartData"
        :d="lineChartData"
        :stroke="getColorValue(color)"
        stroke-width="3"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
        :style="{ 
          strokeDasharray: animationProgress < 100 ? '1000' : 'none',
          strokeDashoffset: animationProgress < 100 ? 1000 - (animationProgress * 10) : 0
        }"
      />
      
      <!-- 데이터 포인트 -->
      <g v-if="animationProgress > 80">
        <circle
          v-for="(value, index) in data"
          :key="index"
          :cx="index * (300 / (data.length - 1))"
          :cy="(height - 40) - ((value / Math.max(...data)) * (height - 40)) + 20"
          r="4"
          :fill="getColorValue(color)"
          class="data-point"
        />
      </g>
      
      <!-- X축 라벨 -->
      <g class="x-labels">
        <text
          v-for="(label, index) in labels"
          :key="index"
          :x="index * (300 / (labels.length - 1))"
          :y="height - 5"
          text-anchor="middle"
          class="chart-label"
        >
          {{ label }}
        </text>
      </g>
    </svg>

    <!-- 바 차트 -->
    <svg v-else-if="type === 'bar'" :width="320" :height="height" class="bar-chart">
      <!-- 그리드 라인 -->
      <g class="grid">
        <line v-for="i in 5" :key="`h-${i}`"
          :x1="0" :y1="(height - 60) / 4 * (i - 1) + 20"
          :x2="320" :y2="(height - 60) / 4 * (i - 1) + 20"
          stroke="rgb(var(--v-theme-grey-200))" 
          stroke-width="1"
          stroke-dasharray="2,2"
        />
      </g>
      
      <!-- 바 -->
      <g class="bars">
        <rect
          v-for="(bar, index) in barChartBars"
          :key="index"
          :x="bar.x"
          :y="bar.y + (bar.height * (1 - animationProgress / 100))"
          :width="bar.width"
          :height="bar.height * (animationProgress / 100)"
          :fill="getColorValue(color)"
          rx="4"
          class="bar"
        />
      </g>
      
      <!-- 값 라벨 -->
      <g v-if="animationProgress > 80" class="value-labels">
        <text
          v-for="(bar, index) in barChartBars"
          :key="index"
          :x="bar.x + bar.width / 2"
          :y="bar.y - 8"
          text-anchor="middle"
          class="value-label"
        >
          {{ bar.value }}
        </text>
      </g>
      
      <!-- X축 라벨 -->
      <g class="x-labels">
        <text
          v-for="(label, index) in labels"
          :key="index"
          :x="barChartBars[index]?.x + (barChartBars[index]?.width || 0) / 2"
          :y="height - 5"
          text-anchor="middle"
          class="chart-label"
        >
          {{ label }}
        </text>
      </g>
    </svg>

    <!-- 도넛 차트 -->
    <svg v-else-if="type === 'doughnut'" width="160" height="160" class="doughnut-chart">
      <!-- 배경 원 -->
      <circle
        cx="80" cy="80" r="60"
        fill="none"
        stroke="rgb(var(--v-theme-grey-200))"
        stroke-width="20"
      />
      
      <!-- 진행 원 -->
      <circle
        cx="80" cy="80" r="60"
        fill="none"
        :stroke="getColorValue(color)"
        stroke-width="20"
        stroke-linecap="round"
        :stroke-dasharray="`${2 * Math.PI * 60}`"
        :stroke-dashoffset="`${2 * Math.PI * 60 * (1 - (percentage * animationProgress / 10000))}`"
        transform="rotate(-90 80 80)"
        class="progress-circle"
      />
      
      <!-- 중앙 텍스트 -->
      <text
        x="80" y="75"
        text-anchor="middle"
        class="percentage-text"
      >
        {{ Math.round(percentage * animationProgress / 100) }}%
      </text>
      <text
        x="80" y="95"
        text-anchor="middle"
        class="percentage-label"
      >
        완료율
      </text>
    </svg>

    <!-- 프로그레스 바 -->
    <div v-else-if="type === 'progress'" class="progress-bar-wrapper">
      <div class="progress-track">
        <div 
          class="progress-fill"
          :style="{ 
            width: `${percentage * animationProgress / 100}%`,
            backgroundColor: getColorValue(color)
          }"
        />
      </div>
      <div class="progress-text">
        <span class="progress-percentage">{{ Math.round(percentage * animationProgress / 100) }}%</span>
        <span class="progress-label">진행률</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.common-chart {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
}

.line-chart, .bar-chart, .doughnut-chart {
  overflow: visible;
}

.chart-label {
  font-size: 12px;
  fill: rgb(var(--v-theme-grey-600));
  font-weight: 500;
}

.value-label {
  font-size: 11px;
  fill: rgb(var(--v-theme-grey-700));
  font-weight: 600;
}

.data-point {
  transition: all 0.2s ease;
  cursor: pointer;
}

.data-point:hover {
  r: 6;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.bar {
  transition: all 0.2s ease;
  cursor: pointer;
}

.bar:hover {
  opacity: 0.8;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.progress-circle {
  transition: stroke-dashoffset 1s ease;
}

.percentage-text {
  font-size: 20px;
  font-weight: bold;
  fill: rgb(var(--v-theme-grey-900));
}

.percentage-label {
  font-size: 12px;
  fill: rgb(var(--v-theme-grey-600));
  font-weight: 500;
}

.progress-bar-wrapper {
  width: 100%;
  max-width: 300px;
}

.progress-track {
  width: 100%;
  height: 12px;
  background-color: rgb(var(--v-theme-grey-200));
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 1s ease;
  background: linear-gradient(90deg, 
    rgba(59, 130, 246, 0.8) 0%, 
    rgba(59, 130, 246, 1) 100%
  );
}

.progress-text {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-percentage {
  font-size: 16px;
  font-weight: bold;
  color: rgb(var(--v-theme-grey-900));
}

.progress-label {
  font-size: 12px;
  color: rgb(var(--v-theme-grey-600));
  font-weight: 500;
}

/* 애니메이션 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.common-chart {
  animation: fadeIn 0.5s ease;
}
</style>