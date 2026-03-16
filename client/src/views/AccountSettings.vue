<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/users'

const userStore = useUserStore()
const router = useRouter()

const currentUser = computed(() => userStore.currentUser)
const displayName = ref('')
const successMessage = ref('')
const errorMessage = ref('')

watch(
  currentUser,
  (user) => {
    displayName.value = user?.displayName ?? ''
  },
  { immediate: true },
)

function handleSave() {
  successMessage.value = ''
  errorMessage.value = ''

  if (!currentUser.value) {
    errorMessage.value = 'You must be logged in to update settings.'
    return
  }

  const updated = userStore.updateDisplayName(displayName.value)
  if (updated) {
    successMessage.value = 'Display name updated for this session.'
  } else {
    errorMessage.value = 'Please enter a valid display name.'
  }
}

function handleLogout() {
  userStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <main class="section">
    <h1 class="title is-2">Account Settings</h1>

    <div v-if="currentUser" class="box" style="max-width: 520px">
      <div class="field">
        <label class="label">Username</label>
        <div class="control">
          <input class="input" :value="currentUser.username" type="text" readonly />
        </div>
      </div>

      <div class="field">
        <label class="label">Display Name</label>
        <div class="control">
          <input v-model="displayName" class="input" type="text" placeholder="Enter display name" />
        </div>
      </div>

      <p v-if="successMessage" class="help is-success">{{ successMessage }}</p>
      <p v-if="errorMessage" class="help is-danger">{{ errorMessage }}</p>

      <div class="buttons mt-4">
        <button class="button is-primary" @click="handleSave">Save Changes</button>
        <button class="button is-danger" @click="handleLogout">Log out</button>
      </div>
    </div>

    <div v-else class="notification is-warning is-light">
      Please log in to manage account settings.
    </div>
  </main>
</template>
