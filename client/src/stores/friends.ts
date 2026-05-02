import { defineStore } from 'pinia'
import { ref } from 'vue'
import useSessionStore from './session'
import type { DataEnvelope, DataListEnvelope, Friendship } from '../../../server/types'

export const useFriendsStore = defineStore('friends', () => {
  const session = useSessionStore()
  const friendshipsByUser = ref<Record<number, Friendship[]>>({})

  function getFriendships(userId: number): Friendship[] {
    return friendshipsByUser.value[userId] ?? []
  }

  async function loadFriendships(userId: number) {
    const data = await session.api<DataListEnvelope<Friendship>>(`/users/${userId}/friends`)
    friendshipsByUser.value[userId] = data.data
    return data
  }

  async function addFriend(userId: number, friendId: number) {
    const data = await session.api<DataEnvelope<Friendship>>(`/users/${userId}/friends`, { friendId })
    const list = friendshipsByUser.value[userId] ?? []
    friendshipsByUser.value[userId] = [...list, data.data]
    return data
  }

  async function removeFriend(userId: number, friendId: number) {
    const data = await session.api<DataEnvelope<Friendship>>(`/users/${userId}/friends/${friendId}`, null, {
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
