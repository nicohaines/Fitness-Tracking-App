import { Router } from 'express'
import {
	createActivityForUser,
	deleteActivityForUser,
	getActivityByUser,
	listActivitiesByUser,
	updateActivityForUser,
} from '../models/activities'
import type { Activity, DataEnvelope, DataListEnvelope } from '../types'

const app = Router({ mergeParams: true })

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
		const activities = await listActivitiesByUser(userId)
		const response: DataListEnvelope<Activity> = {
			data: activities,
			total: activities.length,
			isSuccess: true,
		}
		res.send(response)
	} catch (err) {
		next(err)
	}
})

app.get('/:id', async (req, res, next) => {
	try {
		const params = req.params as { userId: string; id: string }
		const userId = parseId(params.userId)
		const activityId = parseId(params.id)
		const activity = await getActivityByUser(userId, activityId)
		if (!activity) {
			throw Object.assign(new Error('activity not found'), { status: 404 })
		}

		const response: DataEnvelope<Activity> = {
			data: activity,
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
		const activity = await createActivityForUser(userId, req.body)
		const response: DataEnvelope<Activity> = {
			data: activity,
			isSuccess: true,
			message: 'activity created',
		}
		res.status(201).send(response)
	} catch (err) {
		next(err)
	}
})

app.patch('/:id', async (req, res, next) => {
	try {
		const params = req.params as { userId: string; id: string }
		const userId = parseId(params.userId)
		const activityId = parseId(params.id)
		const activity = await updateActivityForUser(userId, activityId, req.body)
		const response: DataEnvelope<Activity> = {
			data: activity,
			isSuccess: true,
			message: 'activity updated',
		}
		res.send(response)
	} catch (err) {
		next(err)
	}
})

app.delete('/:id', async (req, res, next) => {
	try {
		const params = req.params as { userId: string; id: string }
		const userId = parseId(params.userId)
		const activityId = parseId(params.id)
		const removed = await deleteActivityForUser(userId, activityId)
		// TODO: restore comment cleanup when comments are migrated to Supabase.
		// await deleteCommentsByActivity(activityId)
		// TODO: restore reaction cleanup when reactions are migrated to Supabase.
		// await deleteReactionsByTarget('activity', activityId)

		const response: DataEnvelope<Activity> = {
			data: removed,
			isSuccess: true,
			message: 'activity deleted',
		}
		res.send(response)
	} catch (err) {
		next(err)
	}
})

export default app
