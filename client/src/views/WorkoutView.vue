<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '../stores/users'
import UserActivity from '../components/UserActivity.vue'

const userStore = useUserStore()

</script>

<template>
  <main class="section">
    <h1 class="title is-2">Add a Workout</h1>

    <div v-if="userStore.currentUser">

      <table class="table is-fullwidth is-striped">
        <thead>
          <tr>
            <th>Exercise</th>
            <th>Total Time</th>
            <th>Intensity</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="select">
                <select>
                  <option>Biking</option>
                  <option>Cardio</option>
                  <option>Lifting</option>
                  <option>Running</option>
                  <option>Strength</option>
                  <option>Swimming</option>
                  <option>Yoga</option>
                </select>
              </div>
            </td>
            <td></td>
            <td><div class="select">
                <select>
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                  <option>Recovery</option>
                  <option>Taper</option>
                </select>
              </div></td>
          </tr>
        </tbody>
      </table>

    </div>

    <div v-else class="notification is-warning is-light">Please log in to record a workout.</div>
  </main>
</template>

<style scoped></style>