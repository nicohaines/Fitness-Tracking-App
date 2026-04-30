import { Router } from 'express'
import { createUser, deleteUser, getUserById, listUsers, updateUser, login } from '../models/users'
import type { DataEnvelope, DataListEnvelope, User } from '../types'
import { requireAuth } from "../middleware/auth"

function parseId(value: string): number {
  const id = Number.parseInt(value, 10)
  if (Number.isNaN(id)) {
    throw Object.assign(new Error('invalid id parameter'), { status: 400 })
  }
  return id
}

const app = Router()

function isSelfOrAdmin(req: import('express').Request, id: number): boolean {
  return Boolean(req.user && (req.user.administrator || req.user.id === id))
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

.get('/:id', requireAuth(false), async (req, res, next) => {
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

.post('/', requireAuth(true), async (req, res, next) => {
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

 .post("/login", async (req, res) => {
        const { username, email, password } = req.body

        const response: DataEnvelope<{ token: string; user: User }> = {
            data: await login(username ?? email, password),
            isSuccess: true,
        }
        res.send(response)
    })

.patch('/:id', requireAuth(false), async (req, res, next) => {
  try {
    const userId = parseId(req.params.id)
    if (!isSelfOrAdmin(req, userId)) {
      throw Object.assign(new Error('forbidden'), { status: 403 })
    }

    const user = await updateUser(userId, req.body)
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

.delete('/:id', requireAuth(false), async (req, res, next) => {
  try {
    const userId = parseId(req.params.id)
    if (!isSelfOrAdmin(req, userId)) {
      throw Object.assign(new Error('forbidden'), { status: 403 })
    }

    const existing = await getUserById(userId)
    if (!existing) {
      throw Object.assign(new Error('user not found'), { status: 404 })
    }
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
