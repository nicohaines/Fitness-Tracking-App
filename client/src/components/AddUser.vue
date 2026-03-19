<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/users'

const userStore = useUserStore()
const router = useRouter()

// Form fields with defaults
const defaultSeconds = 30
const defaultWorkoutType = 'Strength'
const defaultIntensity = 'Medium'

const workoutType = ref(defaultWorkoutType)
const intensity = ref(defaultIntensity)
const hours = ref(0)
const minutes = ref(0)
const seconds = ref(defaultSeconds)
const distance = ref<number | null>(null)
const weight = ref<number | null>(null)
const comments = ref('')
const error = ref('')

function handleAddWorkout() {
  // Validate required fields
  if (!workoutType.value) {
    error.value = 'Please select a workout type.'
    return
  }

  if (!intensity.value) {
    error.value = 'Please select an intensity level.'
    return
  }

  // Calculate total time elapsed in seconds
  const totalSeconds = (hours.value || 0) * 3600 + (minutes.value || 0) * 60 + (seconds.value || defaultSeconds)

  error.value = ''

  const success = userStore.addActivity(
    workoutType.value,
    intensity.value,
    totalSeconds,
    distance.value ?? undefined,
    weight.value ?? undefined,
    comments.value.trim() || undefined,
  )
  if (success) {
    // Reset form
    workoutType.value = defaultWorkoutType
    intensity.value = defaultIntensity
    hours.value = 0
    minutes.value = 0
    seconds.value = defaultSeconds
    distance.value = null
    weight.value = null
    comments.value = ''
    router.push({ name: 'home' })
  } else {
    error.value = 'Failed to add workout. Please try again.'
  }
}
</script>

<template>
  <main class="section is-center workout-screen" v-if="userStore.newWorkoutActive">
    <div class="box">
      <div class="has-text-right">
        <button
          class="delete"
          @click="userStore.newWorkoutActive = !userStore.newWorkoutActive"
        ></button>
      </div>
      <h1 class="title is-2"><i class="fa-solid fa-circle-plus"></i> New Workout</h1>

      <form @submit.prevent="handleAddWorkout">
        <div class="field">
          <label class="label">Workout Type</label>
          <div class="control">
            <div class="select">
              <select v-model="workoutType">
                <option value="Strength">Strength</option>
                <option value="Walking">Walk</option>
                <option value="Running">Run</option>
                <option value="Cycling">Cycle</option>
                <option value="Swimming">Swim</option>
                <option value="Yoga">Yoga</option>
              </select>
            </div>
          </div>
        </div>

        <div class="field">
          <label class="label">Intensity</label>
          <div class="control">
            <div class="select">
              <select v-model="intensity">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
        </div>
        <label class="label block-label">Total Time Elapsed</label>
        <div class="field has-addons time-input">
          <div class="control">
            <input
              v-model.number="hours"
              class="input"
              type="number"
              placeholder="Hours"
              min="0"
              max="23"
            />
          </div>
          <div class="control">
            <a class="button is-static">h</a>
          </div>
          <div class="control">
            <input
              v-model.number="minutes"
              class="input"
              type="number"
              placeholder="Minutes"
              min="0"
              max="59"
            />
          </div>
          <div class="control">
            <a class="button is-static">m</a>
          </div>
          <div class="control">
            <input
              v-model.number="seconds"
              class="input"
              type="number"
              placeholder="Seconds"
              min="0"
              max="59"
            />
          </div>
          <div class="control">
            <a class="button is-static">s</a>
          </div>
        </div>

        <div class="field">
          <label class="label">Distance</label>
          <div class="control">
            <input
              v-model.number="distance"
              class="input"
              type="number"
              step=".01"
              placeholder="Total Distance (Miles)"
              min="0"
            />
          </div>
        </div>

        <div class="field">
          <label class="label">Weight</label>
          <div class="control">
            <input
              v-model.number="weight"
              class="input"
              type="number"
              step=".01"
              placeholder="Maximum Weight Lifted (lbs)"
              min="0"
            />
          </div>
        </div>

        <div class="field">
          <label class="label">Comments</label>
          <div class="control">
            <textarea
              v-model="comments"
              class="textarea"
              placeholder="Enter notes about your workout..."
            ></textarea>
          </div>
        </div>

        <div class="field">
          <div class="control">
            <button class="button is-link is-fullwidth" type="submit">Add Workout</button>
          </div>
        </div>

        <p v-if="error" class="help is-danger">{{ error }}</p>
      </form>
    </div>
  </main>
</template>

<style scoped>
.workout-screen {
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
