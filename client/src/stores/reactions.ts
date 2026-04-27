import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../services/myFetch'
import type {
  DataEnvelope,
  DataListEnvelope,
  ReactionRecord,
  ReactionTargetType,
} from '../../../server/types'

function targetKey(targetType: ReactionTargetType, targetId: number): string {
  return `${targetType}:${targetId}`
}

export const useReactionsStore = defineStore('reactions', () => {
  const reactionsByTarget = ref<Record<string, ReactionRecord[]>>({})

  function getReactions(targetType: ReactionTargetType, targetId: number): ReactionRecord[] {
    return reactionsByTarget.value[targetKey(targetType, targetId)] ?? []
  }

  async function loadReactions(targetType: ReactionTargetType, targetId: number) {
    const data = await api<DataListEnvelope<ReactionRecord>>(`/api/v1/reactions/${targetType}/${targetId}`)
    reactionsByTarget.value[targetKey(targetType, targetId)] = data.data
    return data
  }

  async function createReaction(targetType: ReactionTargetType, targetId: number, userId: number) {
    const data = await api<DataEnvelope<ReactionRecord>>('/api/v1/reactions', {
      targetType,
      targetId,
      userId,
    })

    const key = targetKey(targetType, targetId)
    const list = reactionsByTarget.value[key] ?? []
    reactionsByTarget.value[key] = [...list, data.data]
    return data
  }

  async function deleteReaction(targetType: ReactionTargetType, targetId: number, userId: number) {
    const data = await api<DataEnvelope<ReactionRecord>>(
      `/api/v1/reactions/${targetType}/${targetId}/${userId}`,
      null,
      {
        method: 'DELETE',
      },
    )

    const key = targetKey(targetType, targetId)
    const list = reactionsByTarget.value[key] ?? []
    reactionsByTarget.value[key] = list.filter((r) => r.userId !== userId)
    return data
  }

  return {
    reactionsByTarget,
    getReactions,
    loadReactions,
    createReaction,
    deleteReaction,
  }
})
