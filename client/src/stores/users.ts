import data from '../../data/users.json';
import { defineStore } from 'pinia';
import type { User } from '../../types';
import { ref } from 'vue';
import { computed } from 'vue';

export const useUserStore = defineStore('user', () => {
    const users = ref<User[]>(data as User[])
    const currentUser = ref<User | null>(null)
    const loginActive = ref(false)
    const newWorkoutActive = ref(false)

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

    function addActivity(type: string, intensity: string, timeElapsed: number, distance?: number, weight?: number, notes?: string): boolean {
        if (!currentUser.value) return false
        if (!type || !intensity || !timeElapsed) return false
        newWorkoutActive.value = false
        currentUser.value?.activity.push({
            type,
            intensity,
            timeElapsed,
            distance,
            weight,
            notes,
            date: new Date().toISOString().slice(0, 10)
        })
        return true
    }

    function deleteActivity(activity: any) {
        const index = currentUser.value?.activity.indexOf(activity)
        if (index !== undefined && index !== -1) {
            currentUser.value?.activity.splice(index, 1)
        }
    }

    function createUser(username: string, displayName: string, administrator: boolean) {//Administrator only
        if (!currentUser.value || !currentUser.value.administrator) return false
    }

    function deleteUser(user: any) {//Administrator only
        if (!currentUser.value || !currentUser.value.administrator) return false
        const index = users.value.indexOf(user)
        if (index !== undefined && index !== -1 && user.value[index].id !== currentUser.value.id) {
            users.value.splice(index, 1)
        }
    }

    function statistics() {
            const totalTime = computed(() => currentUser.value?.activity.reduce((total, activity) => total + activity.timeElapsed, 0))
            const totalDistance = computed(() => currentUser.value?.activity.reduce((total, activity) => total + (activity.distance || 0), 0))
            const totalTimeFormatted = computed(() => new Date((totalTime.value ?? 0) * 1000).toISOString().slice(11, 19))
            return { totalTimeFormatted, totalDistance }
        }

    return { users, currentUser, loginActive, newWorkoutActive, login, logout, addActivity, deleteActivity, createUser, deleteUser, statistics }
})