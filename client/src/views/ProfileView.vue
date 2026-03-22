<script setup lang="ts">
import { useUserStore } from '../stores/users'
import UserActivity from '../components/UserActivity.vue'

const userStore = useUserStore()
</script>

<template>
  <main class="section">
    <div v-if="userStore.currentUser && userStore.displayProfileUser">
      <article class="media">
        <figure class="media-left">
          <p class="image is-128x128">
            <img
              class="is-rounded"
              :src="
                userStore.displayProfileUser.profilePicture ||
                'https://bulma.io/assets/images/placeholders/128x128.png'
              "
            />
          </p>
        </figure>
        <div class="media-content">
          <div class="content">
            <h1 class="title is-2">{{ userStore.displayProfileUser.displayName }}</h1>

            <p><strong>{{ userStore.displayProfileUser.activity.length }} Workouts | {{ userStore.displayProfileUser.friends.length }} Friends</strong></p>
            <p><strong>Bio: </strong>
              {{ userStore.displayProfileUser.bio || '' }}
            </p>
          </div>
        </div>
      </article>
      
      <h2 class="title is-3">Activity</h2>
      <UserActivity />
    </div>

    <div v-else class="notification is-warning is-light">Please log in to view your profile.</div>
  </main>
</template>

<style scoped>
img {
  max-height: 100%;
}
</style>
