<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '../stores/users'
import { RouterLink } from 'vue-router'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const friendUsers = computed(() => {
  if (!userStore.currentUser) return []
  return userStore.users.filter((user) => userStore.currentUser!.friends.includes(user.id))
})
</script>

<template>
  <main class="section">
    <h1 class="title is-2">Friends</h1>

    <div v-if="userStore.currentUser">
      <div v-if="friendUsers.length" class="content">
        <div class="grid is-col-min-11">
          <RouterLink to="/profile" v-for="friend in friendUsers" :key="friend.id" class="cell box button" @click="userStore.updateProfile(friend.id)">
            <figure class="image is-128x128 img">
              <img
                class="is-rounded"
                :src="
                  friend.profilePicture || 'https://bulma.io/assets/images/placeholders/128x128.png'
                "
              />
            </figure>
            <h3 class="title is-5">{{ friend.displayName }}</h3>
            <p>{{ friend.friends.length }} Friends | {{ friend.activity.length }} Workouts</p>
          </RouterLink>
        </div>
      </div>
      <p v-else>No friends listed for this user.</p>
    </div>

    <div v-else class="notification is-warning is-light">Please log in to view your friends.</div>
  </main>
</template>

<style scoped>
.box {
  height: 300px;
}
.img {
  margin: auto;
  justify-content: center;
}

</style>
