import { Router } from 'express'
import { removeFriendshipsForUser } from '../models/friends'
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

app.get('/', async (_req, res, next) => {
  try {
    const users = await listUsers()
    const response: DataListEnvelope<User> = {
      data: users,
      total: users.length,
      isSuccess: true,
    }
    res.send(response)
  } catch (err) {
    next(err)
  }
})

app.get('/:id', async (req, res, next) => {
  try {
    const user = await getUserById(parseId(req.params.id))
    if (!user) {
      throw Object.assign(new Error('user not found'), { status: 404 })
    }

    const response: DataEnvelope<User> = {
      data: user,
      isSuccess: true,
    }
    res.send(response)
  } catch (err) {
    next(err)
  }
})

app.post('/', async (req, res, next) => {
  try {
    const user = await createUser(req.body)
    const response: DataEnvelope<User> = {
      data: user,
      isSuccess: true,
      message: 'user created',
    }
    res.status(201).send(response)
  } catch (err) {
    next(err)
  }
})

app.patch('/:id', async (req, res, next) => {
  try {
    const user = await updateUser(parseId(req.params.id), req.body)
    const response: DataEnvelope<User> = {
      data: user,
      isSuccess: true,
      message: 'user updated',
    }
    res.send(response)
  } catch (err) {
    next(err)
  }
})

app.delete('/:id', async (req, res, next) => {
  try {
    const userId = parseId(req.params.id)
    const existing = await getUserById(userId)
    if (!existing) {
      throw Object.assign(new Error('user not found'), { status: 404 })
    }

    // TODO: restore activity reaction cleanup when reactions are migrated to Supabase.
    // for (const activity of existing.activity) {
    // 	await deleteReactionsByTarget('activity', activity.id)
    // }
    await removeFriendshipsForUser(userId)
    // TODO: restore comment and reaction cleanup when those features are migrated.
    // await deleteCommentsByUser(userId)
    // await deleteReactionsByUser(userId)

    const removed = await deleteUser(userId)
    const response: DataEnvelope<User> = {
      data: removed,
      isSuccess: true,
      message: 'user deleted',
    }
    res.send(response)
  } catch (err) {
    next(err)
  }
})

export default app
