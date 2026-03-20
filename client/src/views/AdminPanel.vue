<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUserStore } from '../stores/users'

const userStore = useUserStore()
function handleAddUser() {}
function handleEditUser(user: any) {}
function handleDeleteUser(user: any) {
  userStore.deleteUser(user)
}
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
      <div class="grid">
        <div class="cell box button" @click="userStore.modifyUserActive = !userStore.modifyUserActive">
          <i class="fa-solid fa-user-plus add-user"></i>
        </div>
      </div>
      <div class="grid">
        <div v-if="userStore.users.length" class="content">
          <template v-for="user in userStore.users" :key="user.id">
            <div v-if="user.id !== userStore.currentUser?.id" class="cell box button ">
              <div class="columns">
                <div class="column">
                  <figure class="image is-128x128 img">
                    <img
                      class="is-rounded"
                      :src="
                        user.profilePicture ||
                        'https://bulma.io/assets/images/placeholders/128x128.png'
                      "
                    />
                  </figure>
                </div>
                <div class="column">{{ user.username }}</div>
                <div class="column">{{ user.displayName }}</div>
                <div class="column">
                  <p v-if="user.administrator">Administrator</p>
                  <p v-else>Standard User</p>
                </div>
                <div class="column">
                  <p class="buttons has-text-right is-right">
                    <button class="button" @click="userStore.modifyUserActive = !userStore.modifyUserActive">
                      <span class="icon is-small">
                        <i class="fa-solid fa-pen-to-square"></i>
                      </span>
                    </button>
                    <button class="button" @click="handleDeleteUser(user)">
                      <span class="icon is-small">
                        <i class="fa-solid fa-delete-left"></i>
                      </span>
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.box {
  height: 100px;
}
img {
  max-height: 85px;
  max-width: 85px;
}
.add-user {
  font-size: 4rem;
  margin: auto;
  justify-content: center;
  padding: 0.8rem;
}
</style>
