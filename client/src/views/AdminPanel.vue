<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUserStore } from '../stores/users'
import { useExerciseStatStore } from '../stores/exerciseStats'

const userStore = useUserStore()
const exerciseStatStore = useExerciseStatStore()

const currentUser = computed(() => userStore.currentUser)
const canManageAdmin = computed(() => !!currentUser.value?.isAdmin)

const editableDates = ref<Record<number, string>>({})

const nonAdminUsers = computed(() => userStore.users.filter((u) => !u.isAdmin))

const allExerciseStats = computed(() => exerciseStatStore.exerciseStats)

function dateForStat(statId: number, fallback: string) {
  return editableDates.value[statId] ?? fallback
}

function deleteUser(userId: number) {
  const didDelete = userStore.deleteNonAdminUser(userId)
  if (!didDelete) {
    return
  }

  exerciseStatStore.deleteExerciseStatsByUserId(userId)
}

function saveDate(statId: number, currentDate: string) {
  const nextDate = dateForStat(statId, currentDate)
  exerciseStatStore.updateExerciseStat(statId, { dateRecorded: nextDate })
}

function deleteStat(statId: number) {
  const didDelete = exerciseStatStore.deleteExerciseStat(statId)
  if (!didDelete) {
    return
  }

  userStore.removeExerciseStatIdFromUsers(statId)
}
</script>

<template>
  <main class="section">
    <h1 class="title is-2">Admin Panel</h1>

    <div v-if="!currentUser" class="notification is-warning is-light">
      Please log in to use admin controls.
    </div>

    <div v-else-if="!canManageAdmin" class="notification is-danger is-light">
      Admin access is required to view this page.
    </div>

    <div v-else>
      <section class="mb-6">
        <h2 class="title is-4">Users (Non-admin)</h2>

        <div v-if="nonAdminUsers.length" class="table-container">
          <table class="table is-fullwidth is-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Display Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in nonAdminUsers" :key="user.id">
                <td>{{ user.id }}</td>
                <td>{{ user.username }}</td>
                <td>{{ user.displayName }}</td>
                <td>
                  <button class="button is-small is-danger" @click="deleteUser(user.id)">
                    Delete User
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else>No non-admin users left to manage.</p>
      </section>

      <section>
        <h2 class="title is-4">Exercise Stats</h2>

        <div v-if="allExerciseStats.length" class="table-container">
          <table class="table is-fullwidth is-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>User ID</th>
                <th>Type</th>
                <th>Time</th>
                <th>Intensity</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="stat in allExerciseStats" :key="stat.id">
                <td>{{ stat.id }}</td>
                <td>{{ stat.userId }}</td>
                <td>{{ stat.type }}</td>
                <td>{{ stat.timeElapsed }} min</td>
                <td>{{ stat.intensity }}</td>
                <td style="min-width: 180px">
                  <input
                    class="input is-small"
                    type="date"
                    :value="dateForStat(stat.id, stat.dateRecorded)"
                    @input="editableDates[stat.id] = ($event.target as HTMLInputElement).value"
                  />
                </td>
                <td>
                  <div class="buttons are-small">
                    <button class="button is-primary" @click="saveDate(stat.id, stat.dateRecorded)">
                      Save Date
                    </button>
                    <button class="button is-danger" @click="deleteStat(stat.id)">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else>No exercise stats found.</p>
      </section>
    </div>
  </main>
</template>
