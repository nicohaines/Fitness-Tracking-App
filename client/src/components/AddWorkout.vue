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
  <main class="section is-center login-screen" v-if="userStore.newWorkoutActive">
    <div class="box">
        <div class="has-text-right">
            <button class="delete" @click="userStore.newWorkoutActive = !userStore.newWorkoutActive"></button>
          </div>
      <h1 class="title is-2">Add Workout</h1>
      
      <form @submit.prevent="handleLogin">
        <div class="field">
          <label class="label">Workout Type</label>
          <div class="control">
            <div class="select">
              <select>
                <option value="strength">Strength</option>
                <option value="walking">Walk</option>
                <option value="running">Run</option>
                <option value="cycling">Cycle</option>
                <option value="swimming">Swim</option>
                <option value="yoga">Yoga</option>
              </select>
            </div>
          </div>
          <p v-if="error" class="help is-danger">{{ error }}</p>
        </div>

        <div class="field">
          <label class="label">Intensity</label>
          <div class="control">
            <div class="select">
              <select>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <p v-if="error" class="help is-danger">{{ error }}</p>
        </div>
        <label class="label block-label">Total Time Elapsed</label>
        <div class="field has-addons time-input">
          <div class="control">
            <input class="input" type="number" placeholder="Hours" min="0" max="23" />
          </div>
          <div class="control">
            <a class="button is-static">h</a>
          </div>
          <div class="control">
            <input class="input" type="number" placeholder="Minutes" min="0" max="59" />
          </div>
          <div class="control">
            <a class="button is-static">m</a>
          </div>
          <div class="control">
            <input class="input" type="number" placeholder="Seconds" min="0" max="59" />
          </div>
          <div class="control">
            <a class="button is-static">s</a>
          </div>
        </div>

        <div class="field">
          <label class="label">Distance</label>
          <div class="control">
            <input class="input" type="number" placeholder="Total Distance (Miles)" min="0" />
          </div>
        </div>

        <div class="field">
          <label class="label">Weight</label>
          <div class="control">
            <input class="input" type="number" placeholder="Maximum Weight Lifted (lbs)" min="0" />
          </div>
        </div>

        <div class="field">
          <label class="label">Comments</label>
          <div class="control">
            <textarea class="textarea" placeholder="Enter notes about your workout..."></textarea>
          </div>
        </div>

        <div class="field">
          <div class="control">
            <button class="button is-link is-fullwidth" type="submit">Add Workout</button>
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
  max-width: 40rem;
  height: 50rem;
}
.block-label {
display: block;
}
</style>
