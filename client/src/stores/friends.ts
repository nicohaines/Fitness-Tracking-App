import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../services/myFetch'
import type { DataEnvelope, DataListEnvelope, Friendship } from '../../../server/types'

export const useFriendsStore = defineStore('friends', () => {
  const friendshipsByUser = ref<Record<number, Friendship[]>>({})

  function getFriendships(userId: number): Friendship[] {
    return friendshipsByUser.value[userId] ?? []
  }

  async function loadFriendships(userId: number) {
    const data = await api<DataListEnvelope<Friendship>>(`/api/v1/users/${userId}/friends`)
    friendshipsByUser.value[userId] = data.data
    return data
  }

  async function addFriend(userId: number, friendId: number) {
    const data = await api<DataEnvelope<Friendship>>(`/api/v1/users/${userId}/friends`, { friendId })
    const list = friendshipsByUser.value[userId] ?? []
    friendshipsByUser.value[userId] = [...list, data.data]
    return data
  }

  async function removeFriend(userId: number, friendId: number) {
    const data = await api<DataEnvelope<Friendship>>(`/api/v1/users/${userId}/friends/${friendId}`, null, {
      method: 'DELETE',
    })

    const list = friendshipsByUser.value[userId] ?? []
    friendshipsByUser.value[userId] = list.filter(
      (f) => !(f.userAId === data.data.userAId && f.userBId === data.data.userBId),
    )

    return data
  }

  return {
    friendshipsByUser,
    getFriendships,
    loadFriendships,
    addFriend,
    removeFriend,
  }
})
