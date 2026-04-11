<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import RecordButton from "./RecordButton.vue";
import SttResults from "./SttResults.vue";
import EvaluationSection from "./EvaluationSection.vue";

const targetText = ref("");
const partialText = ref("");
const finalText = ref("");
const isRecording = ref(false);
const audioLevel = ref(0);
const errorMessage = ref("");
const selectedDeviceId = ref("");
const audioDevices = ref([]);
const language = ref("ko");

// WebSocket & Media
let ws = null;
let mediaRecorder = null;
let audioStream = null;
let audioContext = null;
let analyser = null;

// Methods
const refreshDevices = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());

        const devices = await navigator.mediaDevices.enumerateDevices();
        audioDevices.value = devices.filter((device) => device.kind === "audioinput");

        const builtinMic = audioDevices.value.find(
            (device) => device.label.toLowerCase().includes("built-in") || device.label.toLowerCase().includes("internal")
        );

        if (builtinMic) {
            selectedDeviceId.value = builtinMic.deviceId;
        }
    } catch (error) {
        console.error("Device enumeration error:", error);
        errorMessage.value = "마이크 목록을 가져올 수 없습니다.";
    }
};

const toggleRecording = () => {
    if (isRecording.value) {
        stopRecording();
    } else {
        startRecording();
    }
};

const startRecording = async () => {
    try {
        errorMessage.value = "";
        partialText.value = "";
        finalText.value = "";

        // Get audio stream
        const constraints = {
            audio: {
                deviceId: selectedDeviceId.value ? { exact: selectedDeviceId.value } : undefined,
                channelCount: 1,
                sampleRate: 16000,
                echoCancellation: true,
                noiseSuppression: true,
            },
        };

        audioStream = await navigator.mediaDevices.getUserMedia(constraints);

        // Setup audio analyser
        setupAudioAnalyser();

        // Setup WebSocket
        const wsBaseUrl = import.meta.env.VITE_WS_URL ||
                         (window.location.protocol === "https:" ? "wss:" : "ws:") + "//" + window.location.host;
        const wsUrl =
            `${wsBaseUrl}/ws/rtzr?` +
            `encoding=OGG_OPUS&` +
            `model_name=${language.value === "ko" ? "sommers_ko" : "sommers_en"}&` +
            `use_punctuation=true&` +
            `domain=CALL&` +
            `sample_rate=16000`;

        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log("WebSocket connected");
            setupMediaRecorder();
        };

        ws.onmessage = async (event) => {
            let messageData;
            if (event.data instanceof Blob) {
                messageData = await event.data.text();
            } else {
                messageData = event.data;
            }

            if (messageData === "EOS") {
                console.log("Stream ended");
                return;
            }

            try {
                const data = JSON.parse(messageData);

                if (data.alternatives && data.alternatives.length > 0) {
                    const text = data.alternatives[0].text || "";

                    if (data.final === false) {
                        partialText.value = text;
                    } else if (data.final === true) {
                        finalText.value = (finalText.value ? finalText.value + " " : "") + text;
                        partialText.value = "";
                    }
                }
            } catch (e) {
                console.error("Parse error:", e);
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            errorMessage.value = "WebSocket 연결 오류가 발생했습니다.";
            stopRecording();
        };

        ws.onclose = () => {
            console.log("WebSocket closed");
            if (isRecording.value) {
                stopRecording();
            }
        };
    } catch (error) {
        console.error("Recording start error:", error);
        errorMessage.value = "녹음 시작 실패: " + error.message;
    }
};

const setupAudioAnalyser = () => {
    // @ts-ignore - webkitAudioContext is for Safari compatibility
    // @ts-ignore
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(audioStream);
    source.connect(analyser);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateLevel = () => {
        if (!isRecording.value) return;

        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        audioLevel.value = Math.min(100, (average / 255) * 200);

        requestAnimationFrame(updateLevel);
    };

    updateLevel();
};

const setupMediaRecorder = () => {
    const options = {
        mimeType: "audio/webm;codecs=opus",
        audioBitsPerSecond: 16000,
    };

    const mimeTypes = ["audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/webm", "audio/ogg"];

    for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
            options.mimeType = mimeType;
            break;
        }
    }

    mediaRecorder = new MediaRecorder(audioStream, options);

    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && ws && ws.readyState === WebSocket.OPEN) {
            ws.send(event.data);
        }
    };

    mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        errorMessage.value = "dev서버 접속 확인해봐. localhost가 맞는지.";
        stopRecording();
    };

    mediaRecorder.start(250);
    isRecording.value = true;
};

const stopRecording = () => {
    isRecording.value = false;
    audioLevel.value = 0;

    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
    }
    mediaRecorder = null;

    if (audioContext) {
        audioContext.close();
        audioContext = null;
        analyser = null;
    }

    if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
        audioStream = null;
    }

    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
    }
    ws = null;
};

// Lifecycle
onMounted(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        errorMessage.value = "dev 서버 localhost로 접속했나 확인 해줘. 그래도 안되면 연락줘";
        return;
    }

    if (!window.MediaRecorder) {
        errorMessage.value = "디바이스 마이크 연결된거 확인해봐. 인식 못하면 연락줘";
        return;
    }

    await refreshDevices();
});

onBeforeUnmount(() => {
    stopRecording();
});
</script>

<template>
    <v-container fluid class="pa-4">
        <v-row>
            <v-col cols="12">
                <v-alert v-if="errorMessage" type="error" closable @click:close="errorMessage = ''">
                    {{ errorMessage }}
                </v-alert>
            </v-col>
        </v-row>

        <!-- Control Section -->
        <v-row>
            <v-col cols="12">
                <v-card elevation="4" rounded="lg" color="primary">
                    <v-card-text class="pa-6">
                        <!-- Device Selector -->
                        <v-row align="center" class="mb-4">
                            <v-col cols="12" sm="8">
                                <v-select
                                    v-model="selectedDeviceId"
                                    :items="audioDevices"
                                    item-title="label"
                                    item-value="deviceId"
                                    label="마이크 선택"
                                    variant="solo"
                                    density="comfortable"
                                    prepend-inner-icon="mdi-microphone"
                                />
                            </v-col>
                            <v-col cols="12" sm="4">
                                <v-btn @click="refreshDevices" variant="tonal" color="white" block>
                                    <v-icon start>mdi-refresh</v-icon>
                                    새로고침
                                </v-btn>
                            </v-col>
                        </v-row>

                        <!-- Language Selector -->
                        <v-row class="mb-4">
                            <v-col cols="12" sm="6">
                                <v-select
                                    v-model="language"
                                    :items="[
                                        { title: '한국어', value: 'ko' },
                                        { title: 'English', value: 'en' },
                                    ]"
                                    label="언어 선택"
                                    variant="solo"
                                    density="comfortable"
                                    prepend-inner-icon="mdi-translate"
                                />
                            </v-col>
                        </v-row>

                        <!-- Target Text -->
                        <v-row class="mb-4">
                            <v-col cols="12">
                                <v-textarea
                                    v-model="targetText"
                                    label="목표 문장"
                                    placeholder="따라 읽을 문장을 입력하세요"
                                    variant="solo"
                                    rows="2"
                                    auto-grow
                                />
                            </v-col>
                        </v-row>

                        <!-- Record Button -->
                        <v-row justify="center">
                            <v-col cols="auto">
                                <RecordButton :is-recording="isRecording" :disabled="!selectedDeviceId" @toggle="toggleRecording" />
                            </v-col>
                        </v-row>

                        <!-- Audio Level -->
                        <v-row v-if="isRecording" class="mt-4">
                            <v-col cols="12">
                                <v-progress-linear :model-value="audioLevel" height="20" rounded color="success" striped>
                                    <template v-slot:default>
                                        <strong>{{ Math.round(audioLevel) }}%</strong>
                                    </template>
                                </v-progress-linear>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Results Section -->
        <v-row class="mt-4">
            <v-col cols="12">
                <SttResults :partial-text="partialText" :final-text="finalText" />
            </v-col>
        </v-row>

        <!-- Evaluation Section -->
        <v-row class="mt-4">
            <v-col cols="12">
                <EvaluationSection :target-text="targetText" :final-text="finalText" />
            </v-col>
        </v-row>
    </v-container>
</template>
