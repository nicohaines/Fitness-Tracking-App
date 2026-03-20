import data from '../../data/users.json'
import { defineStore } from 'pinia'
import type { Activity, User } from '../../types'
import { ref } from 'vue'
import { computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>(data as User[])
  const currentUser = ref<User | null>(null)
  const loginActive = ref(false)
  const newWorkoutActive = ref(false)
  const modifyUserActive = ref(false)
  const modifyUserMode = ref<'create' | 'edit'>('create')
  const modifyUserTargetId = ref<number | null>(null)

  function login(username: string): boolean {
    const match = users.value.find((u) => u.username === username)
    if (match) {
      currentUser.value = match
      loginActive.value = false
      return true
    }
    return false
  }

  function logout() {
    currentUser.value = null
  }

  function addActivity(
    type: string,
    intensity: string,
    timeElapsed: number,
    distance?: number,
    weight?: number,
    notes?: string,
  ): boolean {
    if (!currentUser.value) return false
    if (!type || !intensity || !timeElapsed) return false
    newWorkoutActive.value = false
    const id = currentUser.value.activity.length
      ? Math.max(...currentUser.value.activity.map((a) => a.id)) + 1
      : 1
    currentUser.value?.activity.unshift({
      id,
      type,
      intensity,
      timeElapsed,
      distance,
      weight,
      notes,
      date: new Date().toISOString().slice(0, 10),
    })
    return true
  }

  function deleteActivity(activity: Activity) {
    const index = currentUser.value?.activity.findIndex((a) => a.id === activity.id)
    if (index !== undefined && index !== -1) {
      currentUser.value?.activity.splice(index, 1)
    }
  }

  function openCreateUserForm() {
    if (!currentUser.value || !currentUser.value.administrator) return
    modifyUserMode.value = 'create'
    modifyUserTargetId.value = null
    modifyUserActive.value = true
  }

  function openEditUserForm(user: User) {
    if (!currentUser.value || !currentUser.value.administrator) return
    modifyUserMode.value = 'edit'
    modifyUserTargetId.value = user.id
    modifyUserActive.value = true
  }

  function closeModifyUserForm() {
    modifyUserActive.value = false
    modifyUserMode.value = 'create'
    modifyUserTargetId.value = null
  }

  function createUser(username: string, displayName: string, administrator: boolean, bio?: string) {
    //Administrator only
    if (!currentUser.value || !currentUser.value.administrator) return false
    const trimmedUsername = username.trim()
    const trimmedDisplayName = displayName.trim()
    const trimmedBio = bio?.trim()

    if (!trimmedUsername || !trimmedDisplayName) return false
    const usernameTaken = users.value.some(
      (u) => u.username.toLowerCase() === trimmedUsername.toLowerCase(),
    )
    if (usernameTaken) return false

    const id = users.value.length ? Math.max(...users.value.map((u) => u.id)) + 1 : 1
    users.value.push({
      id,
      username: trimmedUsername,
      displayName: trimmedDisplayName,
      administrator,
      friends: [],
      reactions: 0,
      activity: [],
      bio: trimmedBio || undefined,
    })
    closeModifyUserForm()
    return true
  }

  function updateUser(
    userId: number,
    username: string,
    displayName: string,
    administrator: boolean,
    bio?: string,
  ) {
    //Administrator only
    if (!currentUser.value || !currentUser.value.administrator) return false
    const trimmedUsername = username.trim()
    const trimmedDisplayName = displayName.trim()
    const trimmedBio = bio?.trim()

    if (!trimmedUsername || !trimmedDisplayName) return false

    const user = users.value.find((u) => u.id === userId)
    if (!user) return false

    const usernameTaken = users.value.some(
      (u) => u.id !== userId && u.username.toLowerCase() === trimmedUsername.toLowerCase(),
    )
    if (usernameTaken) return false

    user.username = trimmedUsername
    user.displayName = trimmedDisplayName
    user.administrator = administrator
    user.bio = trimmedBio || undefined

    closeModifyUserForm()
    return true
  }

  function deleteUser(user: User) {
    //Administrator only
    if (!currentUser.value || !currentUser.value.administrator) return false
    const index = users.value.findIndex((u) => u.id === user.id)
    if (index !== undefined && index !== -1 && user.id !== currentUser.value.id) {
      users.value.splice(index, 1)
    }
  }

  function statistics() {
    const totalTime = computed(() =>
      currentUser.value?.activity.reduce((total, activity) => total + activity.timeElapsed, 0),
    )
    const totalDistance = computed(() =>
      currentUser.value?.activity.reduce((total, activity) => total + (activity.distance || 0), 0),
    )
    const totalTimeFormatted = computed(() =>
      new Date((totalTime.value ?? 0) * 1000).toISOString().slice(11, 19),
    )
    return { totalTimeFormatted, totalDistance }
  }

  return {
    users,
    currentUser,
    loginActive,
    newWorkoutActive,
    modifyUserActive,
    modifyUserMode,
    modifyUserTargetId,
    login,
    logout,
    addActivity,
    deleteActivity,
    openCreateUserForm,
    openEditUserForm,
    closeModifyUserForm,
    createUser,
    updateUser,
    deleteUser,
    statistics,
  }
})
