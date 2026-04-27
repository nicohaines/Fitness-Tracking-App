import { Router } from 'express'
import {
	createActivityForUser,
	deleteActivityForUser,
	getActivityByUser,
	listActivitiesByUser,
	updateActivityForUser,
} from '../models/activities'
import { deleteCommentsByActivity } from '../models/comments'
import { deleteReactionsByTarget } from '../models/reactions'
import type { Activity, DataEnvelope, DataListEnvelope } from '../types'

const app = Router({ mergeParams: true })

function parseId(value: string): number {
	const id = Number.parseInt(value, 10)
	if (Number.isNaN(id)) {
		throw Object.assign(new Error('invalid id parameter'), { status: 400 })
	}
	return id
}

app.get('/', (req, res) => {
	const userId = parseId((req.params as { userId: string }).userId)
	const activities = listActivitiesByUser(userId)
	const response: DataListEnvelope<Activity> = {
		data: activities,
		total: activities.length,
		isSuccess: true,
	}
	res.send(response)
})

app.get('/:id', (req, res) => {
	const params = req.params as { userId: string; id: string }
	const userId = parseId(params.userId)
	const activityId = parseId(params.id)
	const activity = getActivityByUser(userId, activityId)
	if (!activity) {
		throw Object.assign(new Error('activity not found'), { status: 404 })
	}

	const response: DataEnvelope<Activity> = {
		data: activity,
		isSuccess: true,
	}
	res.send(response)
})

app.post('/', (req, res) => {
	const userId = parseId((req.params as { userId: string }).userId)
	const activity = createActivityForUser(userId, req.body)
	const response: DataEnvelope<Activity> = {
		data: activity,
		isSuccess: true,
		message: 'activity created',
	}
	res.status(201).send(response)
})

app.patch('/:id', (req, res) => {
	const params = req.params as { userId: string; id: string }
	const userId = parseId(params.userId)
	const activityId = parseId(params.id)
	const activity = updateActivityForUser(userId, activityId, req.body)
	const response: DataEnvelope<Activity> = {
		data: activity,
		isSuccess: true,
		message: 'activity updated',
	}
	res.send(response)
})

app.delete('/:id', (req, res) => {
	const params = req.params as { userId: string; id: string }
	const userId = parseId(params.userId)
	const activityId = parseId(params.id)
	const removed = deleteActivityForUser(userId, activityId)
	deleteCommentsByActivity(activityId)
	deleteReactionsByTarget('activity', activityId)

	const response: DataEnvelope<Activity> = {
		data: removed,
		isSuccess: true,
		message: 'activity deleted',
	}
	res.send(response)
})

export default app
