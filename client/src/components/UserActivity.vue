<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '../stores/users'
import { useExerciseStatStore } from '../stores/exerciseStats'

const userStore = useUserStore()
const exerciseStatStore = useExerciseStatStore()
const currentUser = computed(() => userStore.currentUser)

const userStats = computed(() => {
  if (!currentUser.value) return []
  return exerciseStatStore.exerciseStats.filter((s) => s.userId === currentUser.value!.id)
})
</script>

<template>
    <div v-if="currentUser">
      <h2 class="title is-4">{{ currentUser.displayName }}</h2>
      
      <div v-if="userStats.length" class="table-container">
        <table class="table is-fullwidth is-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Time</th>
              <th>Date</th>
              <th>Intensity</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="stat in userStats" :key="stat.id">
              <td>{{ stat.id }}</td>
              <td>{{ stat.type }}</td>
              <td>{{ stat.timeElapsed }} min</td>
              <td>{{ stat.dateRecorded }}</td>
              <td>{{ stat.intensity }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else>You haven't recorded any activity yet.</p>
    </div>

</template>

<style scoped>

</style>