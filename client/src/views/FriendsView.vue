<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '../stores/users'

const userStore = useUserStore()

const currentUser = computed(() => userStore.currentUser)

const friendUsers = computed(() => {
  if (!currentUser.value) return []
  return userStore.users.filter((user) => currentUser.value!.friends.includes(user.id))
})
</script>

<template>
  <main class="section">
    <h1 class="title is-2">Friends</h1>

    <div v-if="currentUser">
      <h2 class="title is-4">{{ currentUser.displayName }}</h2>

      <div v-if="friendUsers.length" class="content">
        <ul>
          <li v-for="friend in friendUsers" :key="friend.id">
            {{ friend.displayName }} (@{{ friend.username }})
          </li>
        </ul>
      </div>
      <p v-else>No friends listed for this user.</p>
    </div>

    <div v-else class="notification is-warning is-light">
      Please log in to view friends.
    </div>
  </main>
</template>
