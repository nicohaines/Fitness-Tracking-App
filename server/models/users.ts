import type { Activity, User } from '../types'
import { connect, toCamelCase, toSnakeCase, filterKeys } from './supabase'
import data1 from "../data/users.json"

type ItemType = User
type SeedUser = Pick<
	ItemType,
	'username' | 'displayName' | 'administrator' | 'profilePicture' | 'bio' | 'reactions'
>
type SeedActivity = Omit<Activity, 'id' | 'reactions'>

const data = {
    items: data1 as ItemType[],
}

const USER_SEED_KEYS: (keyof SeedUser)[] = [
	'username',
	'displayName',
	'administrator',
	'profilePicture',
	'bio',
	'reactions',
]

const ACTIVITY_SEED_KEYS: (keyof SeedActivity)[] = [
	'type',
	'intensity',
	'timeElapsed',
	'date',
	'distance',
	'weight',
	'notes',
]

export const TABLE_NAME = "users"
const ACTIVITIES_TABLE_NAME = 'activities'

type CreateUserInput = {
	username: string
	displayName: string
	administrator?: boolean
	bio?: string
	profilePicture?: string
}

type UpdateUserInput = Partial<CreateUserInput>

function mapActivityRow(row: Record<string, unknown>): Activity {
	const activity = toCamelCase(row) as Partial<Activity>
	return {
		id: Number(activity.id),
		type: String(activity.type ?? ''),
		intensity: String(activity.intensity ?? ''),
		timeElapsed: Number(activity.timeElapsed ?? 0),
		date: String(activity.date ?? ''),
		distance: activity.distance as number | undefined,
		weight: activity.weight as number | undefined,
		notes: activity.notes as string | undefined,
		reactions: [],
	}
}

function mapUserRow(row: Record<string, unknown>, activity: Activity[] = []): ItemType {
	const user = toCamelCase(row) as Partial<User>
	return {
		id: Number(user.id),
		username: String(user.username ?? ''),
		displayName: String(user.displayName ?? ''),
		administrator: Boolean(user.administrator),
		friends: Array.isArray(user.friends) ? (user.friends as number[]) : [],
		profilePicture: user.profilePicture as string | undefined,
		bio: user.bio as string | undefined,
		reactions: Number(user.reactions ?? 0),
		activity,
	}
}

async function listActivitiesByUser(userId: number): Promise<Activity[]> {
	const db = connect()
	const { data, error } = await db.from(ACTIVITIES_TABLE_NAME).select('*').eq('user_id', userId)

	if (error) {
		throw Object.assign(new Error(error.message), { status: 500 })
	}

	return (data ?? []).map((row) => mapActivityRow(row as Record<string, unknown>))
}

async function listActivitiesByUsers(userIds: number[]): Promise<Map<number, Activity[]>> {
	if (userIds.length === 0) {
		return new Map()
	}

	const db = connect()
	const { data, error } = await db.from(ACTIVITIES_TABLE_NAME).select('*').in('user_id', userIds)

	if (error) {
		throw Object.assign(new Error(error.message), { status: 500 })
	}

	const grouped = new Map<number, Activity[]>()
	for (const row of data ?? []) {
		const activityRow = row as Record<string, unknown>
		const userId = Number(activityRow.user_id)
		const list = grouped.get(userId) ?? []
		list.push(mapActivityRow(activityRow))
		grouped.set(userId, list)
	}

	return grouped
}

export async function listUsers(): Promise<ItemType[]> {
	const db = connect()
	const { data, error } = await db.from(TABLE_NAME).select('*', { count: 'estimated' })

	if (error) {
		throw Object.assign(new Error(error.message), { status: 500 })
	}

	const rows = (data ?? []) as Record<string, unknown>[]
	const activitiesByUser = await listActivitiesByUsers(rows.map((row) => Number(row.id)))

	return rows.map((row) => mapUserRow(row, activitiesByUser.get(Number(row.id)) ?? []))
}

export async function getUserById(userId: number): Promise<ItemType | undefined> {
	const db = connect()
	const { data, error } = await db.from(TABLE_NAME).select('*').eq('id', userId).maybeSingle()

	if (error) {
		throw Object.assign(new Error(error.message), { status: 500 })
	}

	if (!data) {
		return undefined
	}

	return mapUserRow(data as Record<string, unknown>, await listActivitiesByUser(userId))
}

export async function userExists(userId: number): Promise<boolean> {
	return Boolean(await getUserById(userId))
}

export async function createUser(input: CreateUserInput): Promise<ItemType> {
	const username = input.username?.trim()
	const displayName = input.displayName?.trim()

	if (!username || !displayName) {
		throw Object.assign(new Error('username and displayName are required'), { status: 400 })
	}

	const db = connect()
	const { data: existingUser, error: existingError } = await db
		.from(TABLE_NAME)
		.select('*')
		.ilike('username', username)
		.maybeSingle()

	if (existingError) {
		throw Object.assign(new Error(existingError.message), { status: 500 })
	}

	const usernameTaken = Boolean(existingUser)
	if (usernameTaken) {
		throw Object.assign(new Error('username already exists'), { status: 409 })
	}

	const newUser = {
		username,
		displayName,
		administrator: Boolean(input.administrator),
		profilePicture: input.profilePicture,
		bio: input.bio,
		reactions: 0,
	}

	const { data, error } = await db.from(TABLE_NAME).insert(toSnakeCase(newUser)).select().single()

	if (error) {
		throw Object.assign(new Error(error.message), { status: 500 })
	}

	return mapUserRow(data as Record<string, unknown>)
}

export async function updateUser(userId: number, patch: UpdateUserInput): Promise<ItemType> {
	const user = await getUserById(userId)
	if (!user) {
		throw Object.assign(new Error('user not found'), { status: 404 })
	}

	const patchRow: Record<string, unknown> = {}
	if (patch.username !== undefined) {
		const username = patch.username.trim()
		if (!username) {
			throw Object.assign(new Error('username cannot be empty'), { status: 400 })
		}
		const db = connect()
		const { data: existingUser, error: existingError } = await db
			.from(TABLE_NAME)
			.select('id')
			.eq('username', username)
			.neq('id', userId)
			.maybeSingle()

		if (existingError) {
			throw Object.assign(new Error(existingError.message), { status: 500 })
		}

		const usernameTaken = Boolean(existingUser)
		if (usernameTaken) {
			throw Object.assign(new Error('username already exists'), { status: 409 })
		}
		patchRow.username = username
	}

	if (patch.displayName !== undefined) {
		const displayName = patch.displayName.trim()
		if (!displayName) {
			throw Object.assign(new Error('displayName cannot be empty'), { status: 400 })
		}
		patchRow.displayName = displayName
	}

	if (patch.administrator !== undefined) {
		patchRow.administrator = Boolean(patch.administrator)
	}

	if (patch.bio !== undefined) patchRow.bio = patch.bio
	if (patch.profilePicture !== undefined) patchRow.profilePicture = patch.profilePicture

	const db = connect()
	const { data, error } = await db
		.from(TABLE_NAME)
		.update(toSnakeCase(patchRow))
		.eq('id', userId)
		.select()
		.single()

	if (error) {
		throw Object.assign(new Error(error.message), { status: 500 })
	}

	return mapUserRow(data as Record<string, unknown>, user.activity)
}

export async function deleteUser(userId: number): Promise<ItemType> {
	const existing = await getUserById(userId)
	if (!existing) {
		throw Object.assign(new Error('user not found'), { status: 404 })
	}

	const db = connect()
	const { error } = await db.from(TABLE_NAME).delete().eq('id', userId)

	if (error) {
		throw Object.assign(new Error(error.message), { status: 500 })
	}

	return existing
}

export async function listAllActivities(): Promise<Array<{ userId: number; activity: Activity }>> {
	const db = connect()
	const { data, error } = await db.from(ACTIVITIES_TABLE_NAME).select('*')

	if (error) {
		throw Object.assign(new Error(error.message), { status: 500 })
	}

	return (data ?? []).map((row) => {
		const activityRow = row as Record<string, unknown>
		return {
			userId: Number(activityRow.user_id),
			activity: mapActivityRow(activityRow),
		}
	})
}

export async function getActivityById(
	activityId: number,
): Promise<{ userId: number; activity: Activity } | undefined> {
	const db = connect()
	const { data, error } = await db.from(ACTIVITIES_TABLE_NAME).select('*').eq('id', activityId).maybeSingle()

	if (error) {
		throw Object.assign(new Error(error.message), { status: 500 })
	}

	if (!data) {
		return undefined
	}

	const activityRow = data as Record<string, unknown>
	return {
		userId: Number(activityRow.user_id),
		activity: mapActivityRow(activityRow),
	}
}

export async function activityExists(activityId: number): Promise<boolean> {
	return Boolean(await getActivityById(activityId))
}

export async function seed() {
	const db = connect()
	let seededUsers = 0

	for (const item of data.items) {
		const { activity = [], id: _ignoredId, friends: _ignoredFriends, ...userSeed } = item
		const userSeedRow = userSeed as SeedUser
		const userResult = await db
			.from(TABLE_NAME)
			.insert(toSnakeCase(filterKeys(userSeedRow, USER_SEED_KEYS)))
			.select('id')
			.single()

		if (userResult.error) {
			throw userResult.error
		}

		seededUsers += 1
		const userId = Number(userResult.data.id)
		const activities = activity.map((entry) => ({
			userId,
			...toSnakeCase(filterKeys(entry as SeedActivity, ACTIVITY_SEED_KEYS)),
		}))

		if (activities.length > 0) {
			const activityResult = await db.from(ACTIVITIES_TABLE_NAME).insert(activities)
			if (activityResult.error) {
				throw activityResult.error
			}
		}
	}

	return seededUsers
}