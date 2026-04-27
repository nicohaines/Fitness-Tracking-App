import type { Activity } from '../types'
import { getUserById } from './users'

type CreateActivityInput = {
	type: string
	intensity: string
	timeElapsed: number
	date?: string
	distance?: number
	weight?: number
	notes?: string
}

type UpdateActivityInput = Partial<CreateActivityInput>

function nextActivityId(userId: number): number {
	const user = getUserById(userId)
	if (!user) {
		throw Object.assign(new Error('user not found'), { status: 404 })
	}
	return user.activity.length ? Math.max(...user.activity.map((a) => a.id)) + 1 : 1
}

export function listActivitiesByUser(userId: number): Activity[] {
	const user = getUserById(userId)
	if (!user) {
		throw Object.assign(new Error('user not found'), { status: 404 })
	}
	return user.activity
}

export function getActivityByUser(userId: number, activityId: number): Activity | undefined {
	return listActivitiesByUser(userId).find((a) => a.id === activityId)
}

export function createActivityForUser(userId: number, input: CreateActivityInput): Activity {
	const user = getUserById(userId)
	if (!user) {
		throw Object.assign(new Error('user not found'), { status: 404 })
	}

	if (!input.type || !input.intensity || input.timeElapsed === undefined || input.timeElapsed <= 0) {
		throw Object.assign(new Error('type, intensity, and positive timeElapsed are required'), { status: 400 })
	}

	const activity: Activity = {
		id: nextActivityId(userId),
		type: input.type,
		intensity: input.intensity,
		timeElapsed: input.timeElapsed,
		date: input.date ?? new Date().toISOString().slice(0, 10),
		distance: input.distance,
		weight: input.weight,
		notes: input.notes,
		reactions: [],
	}

	user.activity.unshift(activity)
	return activity
}

export function updateActivityForUser(
	userId: number,
	activityId: number,
	patch: UpdateActivityInput,
): Activity {
	const activity = getActivityByUser(userId, activityId)
	if (!activity) {
		throw Object.assign(new Error('activity not found'), { status: 404 })
	}

	if (patch.type !== undefined) activity.type = patch.type
	if (patch.intensity !== undefined) activity.intensity = patch.intensity
	if (patch.timeElapsed !== undefined) {
		if (patch.timeElapsed <= 0) {
			throw Object.assign(new Error('timeElapsed must be positive'), { status: 400 })
		}
		activity.timeElapsed = patch.timeElapsed
	}
	if (patch.date !== undefined) activity.date = patch.date
	if (patch.distance !== undefined) activity.distance = patch.distance
	if (patch.weight !== undefined) activity.weight = patch.weight
	if (patch.notes !== undefined) activity.notes = patch.notes

	return activity
}

export function deleteActivityForUser(userId: number, activityId: number): Activity {
	const user = getUserById(userId)
	if (!user) {
		throw Object.assign(new Error('user not found'), { status: 404 })
	}

	const index = user.activity.findIndex((a) => a.id === activityId)
	if (index < 0) {
		throw Object.assign(new Error('activity not found'), { status: 404 })
	}

	const [removed] = user.activity.splice(index, 1)
	return removed
}
