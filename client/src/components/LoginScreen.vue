<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/users'

const userStore = useUserStore()
const router = useRouter()

const username = ref('')
const error = ref('')
const loadingUsers = ref(false)

async function ensureUsersLoaded() {
  if (loadingUsers.value || userStore.users.length > 0) return

  loadingUsers.value = true
  try {
    await userStore.loadUsers()
  } catch {
    error.value = 'Unable to load users. Please make sure the backend server is running.'
  } finally {
    loadingUsers.value = false
  }
}

onMounted(() => {
  void ensureUsersLoaded()
})

watch(
  () => userStore.loginActive,
  (isOpen) => {
    if (isOpen) {
      void ensureUsersLoaded()
    }
  },
)

async function handleLogin() {
  if (!username.value) {
    error.value = 'Please select a username.'
    return
  }

  error.value = ''
  const success = await userStore.login(username.value.trim())
  if (success) {
    router.push({ name: 'home' })
  } else {
    error.value = 'Username not found. Please try again.'
  }
}
</script>

<template>
  <main class="section is-center login-screen" v-if="userStore.loginActive">
    <div class="box">
      <h1 class="title is-2"><i class="fa-solid fa-user"></i> Login</h1>
      <form @submit.prevent="handleLogin">
        <div class="field">
          <label class="label">Username</label>
          <div class="control is-expanded">
            <div class="select is-fullwidth">
              <select v-model="username" :disabled="loadingUsers">
                <option disabled value="">Select a user</option>
                <option v-for="user in userStore.users" :key="user.id" :value="user.username">
                  {{ user.displayName }} ({{ user.username }})
                </option>
              </select>
            </div>
          </div>
          <p v-if="loadingUsers" class="help">Loading users...</p>
          <p v-if="error" class="help is-danger">{{ error }}</p>
        </div>
        <div class="field">
          <label class="label">Password</label>
          <div class="control">
            <input class="input" type="text" placeholder="Password" disabled />
          </div>
        </div>

        <div class="field">
          <div class="control">
            <button class="button is-link is-fullwidth" type="submit">Log In</button>
          </div>
        </div>
      </form>
    </div>
  </main>
</template>

<style scoped>
.login-screen {
  position: absolute;
  z-index: 1;
  margin: auto;
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  transition: opacity 1s ease;
  background-color: rgba(0, 0, 0, 0.8);
}
.box {
  padding: 2rem;
  width: 100%;
  max-width: 30rem;
  height: 30rem;
}
</style>
