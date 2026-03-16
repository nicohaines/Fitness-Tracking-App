import data from '../../data/users.json';
import { defineStore } from 'pinia';
import type { User } from '../../types';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
    const users = ref<User[]>(data)

    return { users }
})