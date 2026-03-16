<script setup lang="ts">
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
  <main class="section is-center">
    <h1 class="title is-2">Login</h1>

    <div class="box" style="max-width: 400px">
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
            <button class="button is-danger is-fullwidth" type="submit">Log In</button>
          </div>
        </div>
      </form>
    </div>
  </main>
</template>
