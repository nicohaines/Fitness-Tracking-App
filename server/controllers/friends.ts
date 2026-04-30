import { Router } from 'express'
import { addFriendship, listFriendshipsByUser, removeFriendship } from '../models/friends'
import type { DataEnvelope, DataListEnvelope, Friendship } from '../types'

const app = Router({ mergeParams: true })

function isSelfOrAdmin(req: import('express').Request, id: number): boolean {
	return Boolean(req.user && (req.user.administrator || req.user.id === id))
}

function parseId(value: string): number {
	const id = Number.parseInt(value, 10)
	if (Number.isNaN(id)) {
		throw Object.assign(new Error('invalid id parameter'), { status: 400 })
	}
	return id
}

app.get('/', async (req, res, next) => {
	try {
		const userId = parseId((req.params as { userId: string }).userId)
		if (!isSelfOrAdmin(req, userId)) throw Object.assign(new Error('forbidden'), { status: 403 })
		const friendships = await listFriendshipsByUser(userId)
		const response: DataListEnvelope<Friendship> = {
			data: friendships,
			total: friendships.length,
			isSuccess: true,
		}
		res.send(response)
	} catch (err) {
		next(err)
	}
})

app.post('/', async (req, res, next) => {
	try {
		const userId = parseId((req.params as { userId: string }).userId)
		if (!isSelfOrAdmin(req, userId)) throw Object.assign(new Error('forbidden'), { status: 403 })
		const friendId = parseId(String(req.body?.friendId))
		const friendship = await addFriendship(userId, friendId)
		const response: DataEnvelope<Friendship> = {
			data: friendship,
			isSuccess: true,
			message: 'friendship created',
		}
		res.status(201).send(response)
	} catch (err) {
		next(err)
	}
})

app.delete('/:friendId', async (req, res) => {
	const params = req.params as { userId: string; friendId: string }
	const userId = parseId(params.userId)
	if (!isSelfOrAdmin(req, userId)) throw Object.assign(new Error('forbidden'), { status: 403 })
	const friendId = parseId(params.friendId)
	const removed = await removeFriendship(userId, friendId)
	const response: DataEnvelope<Friendship> = {
		data: removed,
		isSuccess: true,
		message: 'friendship removed',
	}
	res.send(response)
})

export default app
