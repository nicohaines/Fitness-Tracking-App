//This is intended to be a future feature and is not functional.

import { Router } from 'express'
import { createReaction, deleteReaction, listReactions } from '../models/reactions'
import type {
	DataEnvelope,
	DataListEnvelope,
	ReactionRecord,
	ReactionTargetType,
} from '../types'

const app = Router()

function parseId(value: string): number {
	const id = Number.parseInt(value, 10)
	if (Number.isNaN(id)) {
		throw Object.assign(new Error('invalid id parameter'), { status: 400 })
	}
	return id
}

function parseTargetType(value: string): ReactionTargetType {
	if (value !== 'activity' && value !== 'comment') {
		throw Object.assign(new Error('targetType must be activity or comment'), { status: 400 })
	}
	return value
}

app.get('/:targetType/:targetId', (req, res) => {
	const targetType = parseTargetType(req.params.targetType)
	const targetId = parseId(req.params.targetId)
	const reactions = listReactions(targetType, targetId)
	const response: DataListEnvelope<ReactionRecord> = {
		data: reactions,
		total: reactions.length,
		isSuccess: true,
	}
	res.send(response)
})

app.post('/', (req, res) => {
	const targetType = parseTargetType(String(req.body?.targetType))
	const targetId = parseId(String(req.body?.targetId))
	const userId = parseId(String(req.body?.userId))
	const reaction = createReaction({ targetType, targetId, userId })
	const response: DataEnvelope<ReactionRecord> = {
		data: reaction,
		isSuccess: true,
		message: 'reaction created',
	}
	res.status(201).send(response)
})

app.delete('/:targetType/:targetId/:userId', (req, res) => {
	const targetType = parseTargetType(req.params.targetType)
	const targetId = parseId(req.params.targetId)
	const userId = parseId(req.params.userId)
	const removed = deleteReaction(targetType, targetId, userId)
	const response: DataEnvelope<ReactionRecord> = {
		data: removed,
		isSuccess: true,
		message: 'reaction removed',
	}
	res.send(response)
})

export default app
