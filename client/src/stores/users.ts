import data from '../../data/users.json';
import { defineStore } from 'pinia';
import type { User } from '../../types';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
    const users = ref<User[]>(data as User[])
    const currentUser = ref<User | null>(null)

    function login(username: string): boolean {
        const match = users.value.find((u) => u.username === username)
        if (match) {
            currentUser.value = match
            return true
        }
        return false
    }

    function logout() {
        currentUser.value = null
    }

    return { users, currentUser, login, logout }
})