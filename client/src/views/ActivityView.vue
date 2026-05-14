<script setup lang="ts">
import { useUserStore } from '../stores/users'
import UserActivity from '../components/UserActivity.vue'

const userStore = useUserStore()

</script>

<template>
  <main class="section">

    <div v-if="userStore.currentUser">
      <h2 class="title is-2">{{ userStore.currentUser.displayName }}</h2>

      <hr>
      <nav class="level">
        <div v-if="userStore.statistics(userStore.currentUser.id).favoriteWorkout" class="level-item has-text-centered">
          <div>
            <p class="heading">Top Workout</p>
            <p class="title">{{ userStore.statistics(userStore.currentUser.id).favoriteWorkout }}</p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">Total Workout Time</p>
            <p class="title">{{ userStore.statistics(userStore.currentUser.id).totalTimeFormatted }}</p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">Total Number of Workouts</p>
            <p class="title">{{ userStore.currentUser.activity.length }}</p>
          </div>
        </div>
        <div v-if="userStore.statistics(userStore.currentUser.id).totalDistance !== 0" class="level-item has-text-centered">
          <div>
            <p class="heading">Total Distance</p>
            <p class="title">{{ userStore.statistics(userStore.currentUser.id).totalDistance.toFixed(1) }} miles</p>
          </div>
        </div>
        <div v-if="userStore.statistics(userStore.currentUser.id).maxWeight !== 0" class="level-item has-text-centered">
          <div>
            <p class="heading">Maximum Weight</p>
            <p class="title">{{ userStore.statistics(userStore.currentUser.id).maxWeight }} lbs</p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">Total Reactions</p>
            <p class="title">{{ userStore.currentUser.reactions || 0 }}</p>
          </div>
        </div>
      </nav>
      <hr>
      <h3 class="title is-5 mt-5">Your Activity</h3>
      <UserActivity />
    </div>

    <div v-else class="notification is-warning is-light">
      Please log in to view your activity.
    </div>
  </main>
</template>

<style scoped></style>