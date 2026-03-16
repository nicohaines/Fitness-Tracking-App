import data from '../../data/exerciseStats.json';
import { defineStore } from 'pinia';
import type { ExerciseStat } from '../../types';
import { ref } from 'vue';

export const useExerciseStatStore = defineStore('exerciseStat', () => {
    const exerciseStats = ref<ExerciseStat[]>(data as ExerciseStat[])

    return { exerciseStats }
})