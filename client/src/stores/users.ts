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

    function updateDisplayName(newDisplayName: string): boolean {
        if (!currentUser.value) {
            return false
        }

        const trimmed = newDisplayName.trim()
        if (!trimmed) {
            return false
        }

        const userIndex = users.value.findIndex((u) => u.id === currentUser.value!.id)
        if (userIndex === -1) {
            return false
        }

        const existingUser = users.value[userIndex]
        if (!existingUser) {
            return false
        }

        const updatedUser: User = { ...existingUser, displayName: trimmed }
        users.value[userIndex] = updatedUser
        currentUser.value = updatedUser

        return true
    }

    function deleteNonAdminUser(userId: number): boolean {
        const user = users.value.find((u) => u.id === userId)
        if (currentUser.value?.isAdmin === false) {
            return false
        }
        
        if (!user || user.isAdmin) {
            return false
        }

        users.value = users.value
            .filter((u) => u.id !== userId)
            .map((u) => ({
                ...u,
                friends: u.friends.filter((friendId) => friendId !== userId),
            }))

        if (currentUser.value?.id === userId) {
            currentUser.value = null
        }

        return true
    }

    function removeExerciseStatIdFromUsers(statId: number) {
        users.value = users.value.map((u) => ({
            ...u,
            exerciseStats: u.exerciseStats.filter((id) => id !== statId),
        }))
    }

    return { users, currentUser, login, logout, updateDisplayName, deleteNonAdminUser, removeExerciseStatIdFromUsers }
})