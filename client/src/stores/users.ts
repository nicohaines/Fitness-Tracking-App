import data from '../../data/users.json';
import { defineStore } from 'pinia';
import type { User } from '../../types';
import { ref } from 'vue';
import { computed } from 'vue';

export const useUserStore = defineStore('user', () => {
    const users = ref<User[]>(data as User[])
    const currentUser = ref<User | null>(null)
    const loginActive = ref(false)

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

    function addActivity() {

    }

    function deleteActivity() {
        
    }

    function createUser() {//Administrator only

    }

    function deleteUser() {//Administrator only

    }

    function addFriend() {

    }

    function removeFriend(){

    }

    function statistics() {
            const totalTime = computed(() => currentUser.value?.activity.reduce((total, activity) => total + activity.timeElapsed, 0))
            const totalDistance = computed(() => currentUser.value?.activity.reduce((total, activity) => total + (activity.distance || 0), 0))
            const totalTimeFormatted = computed(() => new Date((totalTime.value ?? 0) * 1000).toISOString().slice(11, 19))
            return { totalTimeFormatted, totalDistance }
        }

    return { users, currentUser, loginActive,login, logout, addActivity, deleteActivity, createUser, deleteUser, addFriend, removeFriend, statistics }
})