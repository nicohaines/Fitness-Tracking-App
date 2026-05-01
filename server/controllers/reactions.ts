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
	if (value !== 'activity') {
		throw Object.assign(new Error('targetType must be activity'), { status: 400 })
	}
	return value
}

app.get('/:targetType/:targetId', async (req, res, next) => {
	try {
		const targetType = parseTargetType(req.params.targetType)
		const targetId = parseId(req.params.targetId)
		const reactions = await listReactions(targetType, targetId)
		const response: DataListEnvelope<ReactionRecord> = {
			data: reactions,
			total: reactions.length,
			isSuccess: true,
		}
		res.send(response)
	} catch (err) {
		next(err)
	}
})

app.post('/', async (req, res, next) => {
	try {
		const targetType = parseTargetType(String(req.body?.targetType))
		const targetId = parseId(String(req.body?.targetId))
		const userId = parseId(String(req.body?.userId))
		const reaction = await createReaction({ targetType, targetId, userId })
		const response: DataEnvelope<ReactionRecord> = {
			data: reaction,
			isSuccess: true,
			message: 'reaction created',
		}
		res.status(201).send(response)
	} catch (err) {
		next(err)
	}
})

app.delete('/:targetType/:targetId/:userId', async (req, res, next) => {
	try {
		const targetType = parseTargetType(req.params.targetType)
		const targetId = parseId(req.params.targetId)
		const userId = parseId(req.params.userId)
		const removed = await deleteReaction(targetType, targetId, userId)
		const response: DataEnvelope<ReactionRecord> = {
			data: removed,
			isSuccess: true,
			message: 'reaction removed',
		}
		res.send(response)
	} catch (err) {
		next(err)
	}
})

export default app
