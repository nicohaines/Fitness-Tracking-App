import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../services/myFetch'
import type { Activity, DataEnvelope, DataListEnvelope } from '../../../server/types'

type CreateActivityInput = {
  type: string
  intensity: string
  timeElapsed: number
  date?: string
  distance?: number
  weight?: number
  notes?: string
}

type UpdateActivityInput = Partial<CreateActivityInput>

export const useActivitiesStore = defineStore('activities', () => {
  const activitiesByUser = ref<Record<number, Activity[]>>({})

  function getUserActivities(userId: number): Activity[] {
    return activitiesByUser.value[userId] ?? []
  }

  async function loadActivities(userId: number) {
    const data = await api<DataListEnvelope<Activity>>(`/api/v1/users/${userId}/activities`)
    activitiesByUser.value[userId] = data.data
    return data
  }

  async function getActivity(userId: number, activityId: number) {
    return api<DataEnvelope<Activity>>(`/api/v1/users/${userId}/activities/${activityId}`)
  }

  async function createActivity(userId: number, activity: CreateActivityInput) {
    const data = await api<DataEnvelope<Activity>>(`/api/v1/users/${userId}/activities`, activity)
    const list = activitiesByUser.value[userId] ?? []
    activitiesByUser.value[userId] = [data.data, ...list]
    return data
  }

  async function updateActivity(userId: number, activityId: number, patch: UpdateActivityInput) {
    const data = await api<DataEnvelope<Activity>>(`/api/v1/users/${userId}/activities/${activityId}`, patch, {
      method: 'PATCH',
    })

    const list = activitiesByUser.value[userId] ?? []
    const index = list.findIndex((a) => a.id === activityId)
    if (index !== -1) {
      list[index] = data.data
      activitiesByUser.value[userId] = [...list]
    }

    return data
  }

  async function deleteActivity(userId: number, activityId: number) {
    const data = await api<DataEnvelope<Activity>>(`/api/v1/users/${userId}/activities/${activityId}`, null, {
      method: 'DELETE',
    })

    const list = activitiesByUser.value[userId] ?? []
    activitiesByUser.value[userId] = list.filter((a) => a.id !== activityId)
    return data
  }

  return {
    activitiesByUser,
    getUserActivities,
    loadActivities,
    getActivity,
    createActivity,
    updateActivity,
    deleteActivity,
  }
})
