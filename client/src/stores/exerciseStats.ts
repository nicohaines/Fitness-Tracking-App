import data from '../../data/exerciseStats.json';
import { defineStore } from 'pinia';
import type { ExerciseStat } from '../../types';
import { ref } from 'vue';

export const useExerciseStatStore = defineStore('exerciseStat', () => {
    const exerciseStats = ref<ExerciseStat[]>(data as ExerciseStat[])

    function updateExerciseStat(id: number, updates: Partial<Omit<ExerciseStat, 'id'>>): boolean {
        const index = exerciseStats.value.findIndex((stat) => stat.id === id)
        if (index === -1) {
            return false
        }

        const existing = exerciseStats.value[index]
        if (!existing) {
            return false
        }

        exerciseStats.value[index] = { ...existing, ...updates }
        return true
    }

    function deleteExerciseStat(id: number): boolean {
        const originalLength = exerciseStats.value.length
        exerciseStats.value = exerciseStats.value.filter((stat) => stat.id !== id)
        return exerciseStats.value.length < originalLength
    }

    function deleteExerciseStatsByUserId(userId: number) {
        exerciseStats.value = exerciseStats.value.filter((stat) => stat.userId !== userId)
    }

    return { exerciseStats, updateExerciseStat, deleteExerciseStat, deleteExerciseStatsByUserId }
})