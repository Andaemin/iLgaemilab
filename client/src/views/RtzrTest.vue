<script setup>
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import RtzrMic from "@/components/RtzrMic.vue";
</script>

<template>
    <DefaultLayout>
        <v-container>
            <h1 class="text-center mb-6">한국어 발음 교정 시스템</h1>
            <h1>tester</h1>
            <h3>❗️임시라서 오류 많음</h3>
            <h3>1. 입력 장치 선택 후 녹음하기 누르기</h3>
            <h3>2. 녹음하기 누르고 '목표문장' 작성 후 말하기</h3>
            <h3>3. 말하고 무조건 '녹음 중지' 누르고 '발음 평가하기' 누르기</h3>
            <RtzrMic />
        </v-container>
    </DefaultLayout>
</template>

<style scoped></style>
