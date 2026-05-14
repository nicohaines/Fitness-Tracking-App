import type { Activity } from '../types'
import { getUserById } from './users'
import { connect, toCamelCase, toSnakeCase } from './supabase'
import { listReactionsByTargetIds } from './reactions'
import data1 from "../data/users.json"

export const TABLE_NAME = "activities"

const data = {
	...data1,
	items: data1.users,
}

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


function mapActivityRow(row: Record<string, unknown>): Activity {
	const mapped = toCamelCase(row) as Partial<Activity>
	return {
		id: Number(mapped.id),
		type: String(mapped.type ?? ''),
		intensity: String(mapped.intensity ?? ''),
		timeElapsed: Number(mapped.timeElapsed ?? 0),
		date: String(mapped.date ?? ''),
		distance: mapped.distance as number | undefined,
		weight: mapped.weight as number | undefined,
		notes: mapped.notes as string | undefined,
		reactions: [],
	}
}

async function attachActivityReactions(activities: Activity[]): Promise<Activity[]> {
	if (activities.length === 0) {
		return activities
	}

	const reactionsByActivity = await listReactionsByTargetIds(
		'activity',
		activities.map((activity) => activity.id),
	)

	return activities.map((activity) => ({
		...activity,
		reactions: reactionsByActivity.get(activity.id) ?? [],
	}))
}

export async function listActivitiesByUser(userId: number): Promise<Activity[]> {
	const db = connect()
	const { data, error } = await db
		.from(TABLE_NAME)
		.select('*', { count: 'estimated' })
		.eq('user_id', userId)
		.order('date', { ascending: false })
		.order('id', { ascending: false })

	if (error) {
		throw Object.assign(new Error(error.message), { status: 500 })
	}

	const activities = (data ?? []).map((row) => mapActivityRow(row as Record<string, unknown>))
	return attachActivityReactions(activities)
}

export async function listActivitiesByUserPaged(
	userId: number,
	options: { page?: number; pageSize?: number } = {},
): Promise<{ activities: Activity[]; total: number }> {
	const db = connect()

	const page = Math.max(1, Number(options.page ?? 1))
	const pageSize = Math.max(1, Number(options.pageSize ?? 10))
	const start = (page - 1) * pageSize

	const query = db
		.from(TABLE_NAME)
		.select('*', { count: 'exact' })
		.eq('user_id', userId)
		.order('date', { ascending: false })
		.order('id', { ascending: false })
		.range(start, start + pageSize - 1)

	const { data, error, count } = await query

	if (error) {
		throw Object.assign(new Error(error.message), { status: 500 })
	}

	const activities = (data ?? []).map((row) => mapActivityRow(row as Record<string, unknown>))
	const attached = await attachActivityReactions(activities)

	return { activities: attached, total: count ?? attached.length }
}

export async function getActivityByUser(userId: number, activityId: number): Promise<Activity | undefined> {
	const db = connect()
	const { data, error } = await db
		.from(TABLE_NAME)
		.select('*')
		.eq('user_id', userId)
		.eq('id', activityId)
		.maybeSingle()

	if (error) {
		throw Object.assign(new Error(error.message), { status: 500 })
	}

	if (!data) {
		return undefined
	}

	return (await attachActivityReactions([mapActivityRow(data as Record<string, unknown>)]))[0]
}

export async function createActivityForUser(userId: number, input: CreateActivityInput): Promise<Activity> {
	const user = await getUserById(userId)
	if (!user) {
		throw Object.assign(new Error('user not found'), { status: 404 })
	}

	if (!input.type || !input.intensity || input.timeElapsed === undefined || input.timeElapsed <= 0) {
		throw Object.assign(new Error('type, intensity, and positive timeElapsed are required'), { status: 400 })
	}

	const db = connect()
	const activity = {
		userId,
		type: input.type,
		intensity: String(input.intensity ?? '').toLowerCase(),
		timeElapsed: input.timeElapsed,
		date: input.date ?? new Date().toISOString().slice(0, 10),
		distance: input.distance,
		weight: input.weight,
		notes: input.notes,
	}

	const { data, error } = await db.from(TABLE_NAME).insert(toSnakeCase(activity)).select().single()

	if (error) {
		console.error('createActivityForUser db error:', error)
		throw Object.assign(new Error(error.message ?? 'db error'), { status: 500, details: error })
	}

	return (await attachActivityReactions([mapActivityRow(data as Record<string, unknown>)]))[0]
}

export async function updateActivityForUser(
	userId: number,
	activityId: number,
	patch: UpdateActivityInput,
): Promise<Activity> {
	const user = await getUserById(userId)
	if (!user) {
		throw Object.assign(new Error('user not found'), { status: 404 })
	}

	const activity = await getActivityByUser(userId, activityId)
	if (!activity) {
		throw Object.assign(new Error('activity not found'), { status: 404 })
	}

	const patchRow: Record<string, unknown> = {}
	if (patch.type !== undefined) patchRow.type = patch.type
	if (patch.intensity !== undefined) patchRow.intensity = String(patch.intensity).toLowerCase()
	if (patch.timeElapsed !== undefined) {
		if (patch.timeElapsed <= 0) {
			throw Object.assign(new Error('timeElapsed must be positive'), { status: 400 })
		}
		patchRow.timeElapsed = patch.timeElapsed
	}
	if (patch.date !== undefined) patchRow.date = patch.date
	if (patch.distance !== undefined) patchRow.distance = patch.distance
	if (patch.weight !== undefined) patchRow.weight = patch.weight
	if (patch.notes !== undefined) patchRow.notes = patch.notes

	if (Object.keys(patchRow).length === 0) {
		return activity
	}

	const db = connect()
	const { data, error } = await db
		.from(TABLE_NAME)
		.update(toSnakeCase(patchRow))
		.eq('id', activityId)
		.eq('user_id', userId)
		.select()
		.single()

	if (error) {
		throw Object.assign(new Error(error.message), { status: 500 })
	}

	return (await attachActivityReactions([mapActivityRow(data as Record<string, unknown>)]))[0]
}

export async function deleteActivityForUser(userId: number, activityId: number): Promise<Activity> {
	const user = await getUserById(userId)
	if (!user) {
		throw Object.assign(new Error('user not found'), { status: 404 })
	}

	const existing = await getActivityByUser(userId, activityId)
	if (!existing) {
		throw Object.assign(new Error('activity not found'), { status: 404 })
	}

	const db = connect()
	const { data, error } = await db
		.from(TABLE_NAME)
		.delete()
		.eq('id', activityId)
		.eq('user_id', userId)
		.select()
		.single()

	if (error) {
		throw Object.assign(new Error(error.message), { status: 500 })
	}

	return (await attachActivityReactions([mapActivityRow(data as Record<string, unknown>)]))[0]
}

export async function seed(): Promise<number> {
	const db = connect()
	let seededActivities = 0

	for (const user of data.items) {
		const userId = user.id
		const activities = (user.activity ?? []).map((entry: any) => ({
			user_id: userId,
			type: entry.type,
			intensity: entry.intensity.toLowerCase(),
			time_elapsed: entry.timeElapsed,
			date: entry.date,
			distance: entry.distance ?? null,
			weight: entry.weight ?? null,
			notes: entry.notes ?? null,
		}))

		if (activities.length > 0) {
			const result = await db.from(TABLE_NAME).insert(activities)
			if (result.error) {
				throw result.error
			}
			seededActivities += activities.length
		}
	}

	return seededActivities
}
