<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUserStore } from '../stores/users'

const userStore = useUserStore()
</script>

<template>
  <main class="section">
    <h1 class="title is-2">Admin Panel</h1>
    <p
      v-if="!userStore.currentUser || !userStore.currentUser.administrator"
      class="has-text-danger"
    >
      Access denied. You do not have administrator privileges.
    </p>
    <div v-else>
      <div class="grid is-col-min-11">
        <div class="cell box button has-text-center"><i class="fa-solid fa-user-plus"></i></div>
        <div v-if="userStore.users.length" class="content">
          <template v-for="user in userStore.users" :key="user.id">
            <div v-if="user.id !== userStore.currentUser?.id" class="cell box button">
              <p class="buttons has-text-right">
                <button class="button">
                  <span class="icon is-small">
                    <i class="fa-solid fa-pen-to-square"></i>
                  </span>
                </button>
                <button class="button">
                  <span class="icon is-small">
                    <i class="fa-solid fa-delete-left"></i>
                  </span>
                </button>
              </p>
              <figure class="image is-128x128 img">
                <img
                  class="is-rounded"
                  :src="
                    user.profilePicture || 'https://bulma.io/assets/images/placeholders/128x128.png'
                  "
                />
              </figure>
              <h2 class="title is-4">{{ user.username }} | {{ user.displayName }}</h2>
              <p v-if="user.administrator" class="has-text-primary-100">Administrator</p>
              <p v-else class="has-text-primary-100">Standard User</p>
            </div>
          </template>
        </div>
      </div>
    </div>
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
