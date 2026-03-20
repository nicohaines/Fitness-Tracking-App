<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useUserStore } from '../stores/users'

const userStore = useUserStore()

const username = ref('')
const displayName = ref('')
const bio = ref('')
const administrator = ref(false)
const error = ref('')

const isEditMode = computed(
  () => userStore.modifyUserMode === 'edit' && userStore.modifyUserTargetId !== null,
)

const selectedUser = computed(() => {
  if (!isEditMode.value) return null
  return userStore.users.find((u) => u.id === userStore.modifyUserTargetId) ?? null
})

function resetToCreateDefaults() {
  username.value = ''
  displayName.value = ''
  bio.value = ''
  administrator.value = false
}

function populateFromSelectedUser() {
  if (!selectedUser.value) {
    resetToCreateDefaults()
    return
  }

  username.value = selectedUser.value.username
  displayName.value = selectedUser.value.displayName
  bio.value = selectedUser.value.bio ?? ''
  administrator.value = selectedUser.value.administrator
}

watch(
  [
    () => userStore.modifyUserActive,
    () => userStore.modifyUserMode,
    () => userStore.modifyUserTargetId,
    () => userStore.users.length,
  ],
  () => {
    if (!userStore.modifyUserActive) return

    if (isEditMode.value) {
      populateFromSelectedUser()
      return
    }

    resetToCreateDefaults()
  },
  { immediate: true },
)

function handleSaveUser() {
  if (!username.value.trim() || !displayName.value.trim()) {
    error.value = 'Username and display name are required.'
    return
  }

  error.value = ''

  const success = isEditMode.value
    ? userStore.updateUser(
        userStore.modifyUserTargetId as number,
        username.value,
        displayName.value,
        administrator.value,
        bio.value,
      )
    : userStore.createUser(username.value, displayName.value, administrator.value, bio.value)

  if (success) {
    resetToCreateDefaults()
  } else {
    error.value = 'Unable to save user. Ensure username is unique and values are valid.'
  }
}

function handleClose() {
  error.value = ''
  userStore.closeModifyUserForm()
}
</script>

<template>
  <main
    class="section is-center workout-screen"
    v-if="userStore.modifyUserActive && userStore.currentUser?.administrator"
  >
    <div class="box">
      <div class="has-text-right">
        <button class="delete" @click="handleClose"></button>
      </div>
      <h1 class="title is-2">
        <i class="fa-solid" :class="isEditMode ? 'fa-pen-to-square' : 'fa-user-plus'"></i>
        {{ isEditMode ? 'Update User' : 'Add User' }}
      </h1>

      <form @submit.prevent="handleSaveUser">
        <div class="field">
          <label class="label">Username (Required)</label>
          <div class="control">
            <input v-model="username" class="input" type="text" placeholder="Username" />
          </div>
        </div>

        <div class="field">
          <label class="label">Display Name (Required)</label>
          <div class="control">
            <input v-model="displayName" class="input" type="text" placeholder="Display Name" />
          </div>
        </div>

        <div class="field">
          <label class="label">Bio</label>
          <div class="control">
            <textarea v-model="bio" class="textarea" placeholder="User Bio..."></textarea>
          </div>
        </div>

        <div class="field">
          <label class="checkbox">
            <input v-model="administrator" type="checkbox" />
            <strong> Administrator Privileges</strong>
          </label>
        </div>

        <div class="field">
          <div class="control">
            <button class="button is-link is-fullwidth" type="submit">
              {{ isEditMode ? 'Update User' : 'Create User' }}
            </button>
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
