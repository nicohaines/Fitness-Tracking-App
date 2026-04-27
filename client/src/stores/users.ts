import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../services/myFetch'
import { useActivitiesStore } from './activities'
import { useReactionsStore } from './reactions'
import type { DataEnvelope, DataListEnvelope, Reaction, User } from '../../../server/types'

type UserStats = {
  favoriteWorkout: string | null
  totalTimeFormatted: string
  totalDistance: number
  maxWeight: number
}

type CreateUserInput = {
  username: string
  displayName: string
  administrator?: boolean
  bio?: string
  profilePicture?: string
}

type UpdateUserInput = Partial<CreateUserInput>

type CreateActivityInput = {
  type: string
  intensity: string
  timeElapsed: number
  date?: string
  distance?: number
  weight?: number
  notes?: string
}

export const useUserStore = defineStore('user', () => {
  const activitiesStore = useActivitiesStore()
  const reactionsStore = useReactionsStore()

  const users = ref<User[]>([])
  const currentUser = ref<User | null>(null)
  const loginActive = ref(false)
  const newWorkoutActive = ref(false)
  const modifyUserActive = ref(false)
  const modifyUserMode = ref<'create' | 'edit'>('create')
  const modifyUserTargetId = ref<number | null>(null)
  const displayProfileUser = ref<User | null>(null)

  function syncUserReferences() {
    if (currentUser.value) {
      currentUser.value = users.value.find((u) => u.id === currentUser.value?.id) ?? null
    }
    if (displayProfileUser.value) {
      displayProfileUser.value = users.value.find((u) => u.id === displayProfileUser.value?.id) ?? null
    }
  }

  function mergeUser(updatedUser: User) {
    const index = users.value.findIndex((u) => u.id === updatedUser.id)
    if (index === -1) {
      users.value.push(updatedUser)
    } else {
      users.value[index] = updatedUser
    }
    syncUserReferences()
  }

  async function loadUsers() {
    const data = await api<DataListEnvelope<User>>('/api/v1/users')
    users.value = data.data
    syncUserReferences()
    return data
  }

  async function getUser(id: number) {
    return api<DataEnvelope<User>>(`/api/v1/users/${id}`)
  }

  async function login(username: string): Promise<boolean> {
    const trimmed = username.trim()
    if (!trimmed) return false

    if (!users.value.length) {
      await loadUsers()
    }

    const match = users.value.find((u) => u.username.toLowerCase() === trimmed.toLowerCase())
    if (match) {
      currentUser.value = match
      loginActive.value = false
      displayProfileUser.value = match
      await activitiesStore.loadActivities(match.id)
      return true
    }
    return false
  }

  function logout() {
    currentUser.value = null
    displayProfileUser.value = null
  }

  async function createUser(
    username: string,
    displayName: string,
    administrator: boolean,
    bio?: string,
  ): Promise<boolean> {
    if (!currentUser.value || !currentUser.value.administrator) return false

    const input: CreateUserInput = {
      username: username.trim(),
      displayName: displayName.trim(),
      administrator,
      bio: bio?.trim() || undefined,
    }

    if (!input.username || !input.displayName) return false

    try {
      const data = await api<DataEnvelope<User>>('/api/v1/users', input)
      users.value.push(data.data)
      closeModifyUserForm()
      return true
    } catch {
      return false
    }
  }

  async function updateUser(
    userId: number,
    username: string,
    displayName: string,
    administrator: boolean,
    bio?: string,
  ): Promise<boolean> {
    if (!currentUser.value || !currentUser.value.administrator) return false

    const patch: UpdateUserInput = {
      username: username.trim(),
      displayName: displayName.trim(),
      administrator,
      bio: bio?.trim() || undefined,
    }

    if (!patch.username || !patch.displayName) return false

    try {
      const data = await api<DataEnvelope<User>>(`/api/v1/users/${userId}`, patch, {
        method: 'PATCH',
      })
      mergeUser(data.data)
      closeModifyUserForm()
      return true
    } catch {
      return false
    }
  }

  async function deleteUser(user: User): Promise<boolean> {
    if (!currentUser.value || !currentUser.value.administrator) return false
    if (user.id === currentUser.value.id) return false

    try {
      await api<DataEnvelope<User>>(`/api/v1/users/${user.id}`, null, {
        method: 'DELETE',
      })
      users.value = users.value.filter((u) => u.id !== user.id)
      syncUserReferences()
      return true
    } catch {
      return false
    }
  }

  async function addActivity(
    type: string,
    intensity: string,
    timeElapsed: number,
    distance?: number,
    weight?: number,
    notes?: string,
  ): Promise<boolean> {
    if (!currentUser.value) return false
    if (!type || !intensity || timeElapsed <= 0) return false

    const input: CreateActivityInput = {
      type,
      intensity,
      timeElapsed,
      distance,
      weight,
      notes,
    }

    try {
      const created = await activitiesStore.createActivity(currentUser.value.id, input)
      const targetUser = users.value.find((u) => u.id === currentUser.value?.id)
      if (targetUser) {
        targetUser.activity = [created.data, ...targetUser.activity]
      }
      syncUserReferences()
      newWorkoutActive.value = false
      return true
    } catch {
      return false
    }
  }

  async function deleteActivity(activityId: number): Promise<boolean> {
    if (!currentUser.value) return false

    try {
      await activitiesStore.deleteActivity(currentUser.value.id, activityId)
      const targetUser = users.value.find((u) => u.id === currentUser.value?.id)
      if (targetUser) {
        targetUser.activity = targetUser.activity.filter((a) => a.id !== activityId)
      }
      syncUserReferences()
      return true
    } catch {
      return false
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

  function statistics(userID: number): UserStats {
    const user = users.value.find((u) => u.id === userID)
    if (!user || user.activity.length === 0) {
      return {
        favoriteWorkout: null,
        totalTimeFormatted: '00:00:00',
        totalDistance: 0,
        maxWeight: 0,
      }
    }

    const totalTime = user.activity.reduce((total, activity) => total + activity.timeElapsed, 0)
    const totalDistance = user.activity.reduce(
      (total, activity) => total + (activity.distance || 0),
      0,
    )
    const totalTimeFormatted = new Date(totalTime * 1000).toISOString().slice(11, 19)
    const maxWeight = Math.max(...user.activity.map((a) => a.weight || 0))

    const typeCounts = user.activity.reduce<Record<string, number>>((counts, activity) => {
      counts[activity.type] = (counts[activity.type] || 0) + 1
      return counts
    }, {})

    let favoriteWorkout: string | null = null
    let maxCount = 0
    for (const [type, count] of Object.entries(typeCounts)) {
      if (count > maxCount) {
        maxCount = count
        favoriteWorkout = type
      }
    }

    return { favoriteWorkout, totalTimeFormatted, totalDistance, maxWeight }
  }

  function updateProfile(userId: number | null) {
    if (userId === null) {
      displayProfileUser.value = null
      return
    }
    displayProfileUser.value = users.value.find((u) => u.id === userId) || null
  }

  function findActivity(activityId: number) {
    for (const user of users.value) {
      const activity = user.activity.find((a) => a.id === activityId)
      if (activity) return activity
    }
    return null
  }

  async function addReaction(userId: number, activityId: number) {
    if (!currentUser.value) return

    const activity = findActivity(activityId)
    if (!activity) return

    try {
      const created = await reactionsStore.createReaction('activity', activityId, userId)
      const reaction: Reaction = {
        id: created.data.id,
        userId: created.data.userId,
      }
      activity.reactions = [...activity.reactions, reaction]
      syncUserReferences()
    } catch {
      // Intentionally ignore duplicate/non-existent reaction errors for toggle UX.
    }
  }

  async function removeReaction(userId: number, activityId: number) {
    if (!currentUser.value) return

    const activity = findActivity(activityId)
    if (!activity) return

    try {
      await reactionsStore.deleteReaction('activity', activityId, userId)
      activity.reactions = activity.reactions.filter((r) => r.userId !== userId)
      syncUserReferences()
    } catch {
      // Intentionally ignore missing reaction errors for toggle UX.
    }
  }

  void loadUsers()

  return {
    users,
    currentUser,
    loginActive,
    newWorkoutActive,
    modifyUserActive,
    modifyUserMode,
    modifyUserTargetId,
    displayProfileUser,
    loadUsers,
    getUser,
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
    updateProfile,
    addReaction,
    removeReaction,
  }
})
