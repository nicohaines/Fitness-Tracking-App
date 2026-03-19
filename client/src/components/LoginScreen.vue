<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/users'

const userStore = useUserStore()
const router = useRouter()

const username = ref('')
const error = ref('')

function handleLogin() {
  if (!username.value) {
    error.value = 'Please select a username.'
    return
  }

  error.value = ''
  const success = userStore.login(username.value.trim())
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
      <h1 class="title is-2">Login</h1>
      <form @submit.prevent="handleLogin">
        <div class="field">
          <label class="label">Username</label>
          <div class="control">
            <div class="select">
              <select v-model="username">
                <option disabled value="">Select a user</option>
                <option v-for="user in userStore.users" :key="user.id" :value="user.username">
                  {{ user.username }}
                </option>
              </select>
            </div>
          </div>
          <p v-if="error" class="help is-danger">{{ error }}</p>
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
