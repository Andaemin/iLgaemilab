<script setup>
import { ref } from 'vue'
import TeamMemberCard from './TeamMemberCard.vue'

const teamMembers = ref([
  { name: '개발팀', role: '시스템 개발' },
  { name: '디자인팀', role: 'UI/UX 디자인' },
  { name: '기획팀', role: '프로젝트 기획' }
])
</script>

<template>
  <v-row class="mt-8">
    <v-col cols="12">
      <v-card class="pa-6" elevation="2">
        <h2 class="text-h4 mb-6 text-center">팀 소개</h2>
        <v-row>
          <v-col 
            v-for="member in teamMembers" 
            :key="member.name" 
            cols="12" 
            md="4"
          >
            <TeamMemberCard 
              :name="member.name"
              :role="member.role"
            />
          </v-col>
        </v-row>
      </v-card>
    </v-col>
  </v-row>
</template>

<style scoped>
</style>