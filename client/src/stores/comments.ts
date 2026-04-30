// //This is intended to be a future feature and is not yet functional.

// import { defineStore } from 'pinia'
// import { ref } from 'vue'
// import { api } from '../services/myFetch'
// import type { Comment, DataEnvelope, DataListEnvelope } from '../../../server/types'

// type CreateCommentInput = {
//   userId: number
//   content: string
// }

// type UpdateCommentInput = {
//   content?: string
// }

// export const useCommentsStore = defineStore('comments', () => {
//   const commentsByActivity = ref<Record<number, Comment[]>>({})

//   function getActivityComments(activityId: number): Comment[] {
//     return commentsByActivity.value[activityId] ?? []
//   }

//   async function loadComments(activityId: number) {
//     const data = await api<DataListEnvelope<Comment>>(`/api/v1/activities/${activityId}/comments`)
//     commentsByActivity.value[activityId] = data.data
//     return data
//   }

//   async function getComment(activityId: number, commentId: number) {
//     return api<DataEnvelope<Comment>>(`/api/v1/activities/${activityId}/comments/${commentId}`)
//   }

//   async function createComment(activityId: number, comment: CreateCommentInput) {
//     const data = await api<DataEnvelope<Comment>>(`/api/v1/activities/${activityId}/comments`, comment)
//     const list = commentsByActivity.value[activityId] ?? []
//     commentsByActivity.value[activityId] = [...list, data.data]
//     return data
//   }

//   async function updateComment(activityId: number, commentId: number, patch: UpdateCommentInput) {
//     const data = await api<DataEnvelope<Comment>>(`/api/v1/activities/${activityId}/comments/${commentId}`, patch, {
//       method: 'PATCH',
//     })

//     const list = commentsByActivity.value[activityId] ?? []
//     const index = list.findIndex((c) => c.id === commentId)
//     if (index !== -1) {
//       list[index] = data.data
//       commentsByActivity.value[activityId] = [...list]
//     }

//     return data
//   }

//   async function deleteComment(activityId: number, commentId: number) {
//     const data = await api<DataEnvelope<Comment>>(`/api/v1/activities/${activityId}/comments/${commentId}`, null, {
//       method: 'DELETE',
//     })

//     const list = commentsByActivity.value[activityId] ?? []
//     commentsByActivity.value[activityId] = list.filter((c) => c.id !== commentId)
//     return data
//   }

//   return {
//     commentsByActivity,
//     getActivityComments,
//     loadComments,
//     getComment,
//     createComment,
//     updateComment,
//     deleteComment,
//   }
// })
