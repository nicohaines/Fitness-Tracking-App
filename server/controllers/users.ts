import { Router } from 'express'
import { deleteCommentsByUser } from '../models/comments'
import { removeFriendshipsForUser } from '../models/friends'
import { deleteReactionsByUser, deleteReactionsByTarget } from '../models/reactions'
import { createUser, deleteUser, getUserById, listUsers, updateUser } from '../models/users'
import type { DataEnvelope, DataListEnvelope, User } from '../types'

const app = Router()

function parseId(value: string): number {
  const id = Number.parseInt(value, 10)
  if (Number.isNaN(id)) {
    throw Object.assign(new Error('invalid id parameter'), { status: 400 })
  }
  return id
}

app.get('/', (_req, res) => {
  const users = listUsers()
  const response: DataListEnvelope<User> = {
    data: users,
    total: users.length,
    isSuccess: true,
  }
  res.send(response)
})

app.get('/:id', (req, res) => {
  const user = getUserById(parseId(req.params.id))
  if (!user) {
    throw Object.assign(new Error('user not found'), { status: 404 })
  }

  const response: DataEnvelope<User> = {
    data: user,
    isSuccess: true,
  }
  res.send(response)
})

app.post('/', (req, res) => {
  const user = createUser(req.body)
  const response: DataEnvelope<User> = {
    data: user,
    isSuccess: true,
    message: 'user created',
  }
  res.status(201).send(response)
})

app.patch('/:id', (req, res) => {
  const user = updateUser(parseId(req.params.id), req.body)
  const response: DataEnvelope<User> = {
    data: user,
    isSuccess: true,
    message: 'user updated',
  }
  res.send(response)
})

app.delete('/:id', (req, res) => {
  const userId = parseId(req.params.id)
  const existing = getUserById(userId)
  if (!existing) {
    throw Object.assign(new Error('user not found'), { status: 404 })
  }

  for (const activity of existing.activity) {
    deleteReactionsByTarget('activity', activity.id)
  }
  removeFriendshipsForUser(userId)
  deleteCommentsByUser(userId)
  deleteReactionsByUser(userId)

  const removed = deleteUser(userId)
  const response: DataEnvelope<User> = {
    data: removed,
    isSuccess: true,
    message: 'user deleted',
  }
  res.send(response)
})

export default app
