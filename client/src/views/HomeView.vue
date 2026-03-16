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

const numberOfWorkouts = computed(() => userStats.value.length)

const totalTimeElapsed = computed(() => {
  return userStats.value.reduce((sum, stat) => sum + stat.timeElapsed, 0)
})

const totalTimePastMonth = computed(() => {
  const today = new Date()
  const oneMonthAgo = new Date(today)
  oneMonthAgo.setMonth(today.getMonth() - 1)

  return userStats.value
    .filter((stat) => new Date(stat.dateRecorded) >= oneMonthAgo)
    .reduce((sum, stat) => sum + stat.timeElapsed, 0)
})

const favoriteWorkoutType = computed(() => {
  if (!userStats.value.length) return 'N/A'

  const counts = userStats.value.reduce<Record<string, number>>((acc, stat) => {
    acc[stat.type] = (acc[stat.type] ?? 0) + 1
    return acc
  }, {})

  const topEntry = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  return topEntry ? topEntry[0] : 'N/A'
})
</script>

<template>
  <main class="section">
    <h1 class="title is-2">Statistics</h1>

    <div v-if="currentUser">
      <h2 class="title is-4">Welcome {{ currentUser.displayName }}</h2>

      <div class="columns is-multiline">
        <div class="column is-half">
          <article class="message is-info">
            <div class="message-header">
              <p>Favorite workout type</p>
            </div>
            <div class="message-body">{{ favoriteWorkoutType }}</div>
          </article>
        </div>

        <div class="column is-half">
          <article class="message is-link">
            <div class="message-header">
              <p>Number of workouts</p>
            </div>
            <div class="message-body">{{ numberOfWorkouts }}</div>
          </article>
        </div>

        <div class="column is-half">
          <article class="message is-success">
            <div class="message-header">
              <p>Total time elapsed</p>
            </div>
            <div class="message-body">{{ totalTimeElapsed }} minutes</div>
          </article>
        </div>

        <div class="column is-half">
          <article class="message is-warning">
            <div class="message-header">
              <p>Total time in past month</p>
            </div>
            <div class="message-body">{{ totalTimePastMonth }} minutes</div>
          </article>
        </div>
      </div>

      <h3 class="title is-5 mt-5">Your Workouts</h3>
      <div v-if="userStats.length" class="table-container">
        <table class="table is-fullwidth is-striped">
          <thead>
            <tr>
              <th>Type</th>
              <th>Time</th>
              <th>Date</th>
              <th>Intensity</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="stat in userStats" :key="stat.id">
              <td>{{ stat.type }}</td>
              <td>{{ stat.timeElapsed }} min</td>
              <td>{{ stat.dateRecorded }}</td>
              <td>{{ stat.intensity }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else>No workouts yet.</p>
    </div>

    <div v-else class="notification is-warning is-light">
      Please log in to view your statistics.
    </div>
  </main>
</template>
