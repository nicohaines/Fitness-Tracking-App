<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '../stores/users'
import { useExerciseStatStore } from '../stores/exerciseStats'
import UserActivity from '../components/UserActivity.vue'

const userStore = useUserStore()
const exerciseStatStore = useExerciseStatStore()

const currentUser = computed(() => userStore.currentUser)

const userStats = computed(() => {
  if (!currentUser.value) return []
  return exerciseStatStore.exerciseStats.filter((s) => s.userId === currentUser.value!.id)
})
</script>

<template>
  <main class="section">
    <h1 class="title is-2">Activity</h1>

    <div v-if="currentUser">
      <h2 class="title is-4">{{ currentUser.displayName }}</h2>

      <h2 class="title is-3">Add Exercise</h2>
      

      <UserActivity />
    </div>

    <div v-else class="notification is-warning is-light">
      Please log in to view activity.
    </div>
  </main>
</template>
