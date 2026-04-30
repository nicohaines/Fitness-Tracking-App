import { sign } from "jsonwebtoken"
import { type Activity, type User, userKeys} from '../types'
import { connect, toCamelCase, toSnakeCase, filterKeys } from './supabase'
import data1 from "../data/users.json"

type ItemType = User

const data = {
    ...data1,
    items: data1.users,
}

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

export async function login(
    username: string,
    _password: string,
): Promise<{ token: string; user: ItemType }> {
	const normalizedUsername = username?.trim()
	if (!normalizedUsername) {
		throw Object.assign(new Error('username is required'), { status: 400 })
	}

    const db = connect()
    const result = await db
        .from(TABLE_NAME)
        .select("*")
		.eq("username", normalizedUsername)
        .single()
    if (result.error) {
		throw result.error
    }
    const user = toCamelCase(result.data) as ItemType

	const payload = {
		id: user.id,
		username: user.username,
		administrator: user.administrator,
	}

    return new Promise((resolve, reject) => {
        sign(
			payload,
            process.env.JWT_SECRET || "secret",
            { expiresIn: "1h" },
            (err, token) => {
                if (err || !token) {
                    reject(err || new Error("Token generation failed"))
                    return
                }
                resolve({ token, user })
            },
        )
    })
}

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

function mapUserRow(row: Record<string, unknown>, activity: Activity[] = [], friends: number[] = []): ItemType {
	const user = toCamelCase(row) as Partial<User>
	return {
		id: Number(user.id),
		username: String(user.username ?? ''),
		displayName: String(user.displayName ?? ''),
		administrator: Boolean(user.administrator),
		friends,
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
	const ids = rows.map((row) => Number(row.id))
	const activitiesByUser = await listActivitiesByUsers(ids)

	// Build friends map from friendships table
	const friendsMap = new Map<number, number[]>()
	if (ids.length > 0) {
		const { data: aRows, error: aErr } = await db
			.from('friendships')
			.select('*')
			.in('user_a_id', ids)
		if (aErr) throw Object.assign(new Error(aErr.message), { status: 500 })
		
		const { data: bRows, error: bErr } = await db
			.from('friendships')
			.select('*')
			.in('user_b_id', ids)
		if (bErr) throw Object.assign(new Error(bErr.message), { status: 500 })

		for (const r of [...(aRows ?? []), ...(bRows ?? [])] as any[]) {
			const a = Number(r.user_a_id)
			const b = Number(r.user_b_id)

			const listA = friendsMap.get(a) ?? []
			if (!listA.includes(b)) listA.push(b)
			friendsMap.set(a, listA)

			const listB = friendsMap.get(b) ?? []
			if (!listB.includes(a)) listB.push(a)
			friendsMap.set(b, listB)
		}
	}

	return rows.map((row) => {
		const id = Number(row.id)
		return mapUserRow(row, activitiesByUser.get(id) ?? [], friendsMap.get(id) ?? [])
	})
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

	// fetch friendships for this user
	const friends: number[] = []
	const { data: aRows, error: aErr } = await db.from('friendships').select('user_b_id').eq('user_a_id', userId)
	if (aErr) throw Object.assign(new Error(aErr.message), { status: 500 })
	for (const r of (aRows ?? []) as any[]) friends.push(Number(r.user_b_id))
	
	const { data: bRows, error: bErr } = await db.from('friendships').select('user_a_id').eq('user_b_id', userId)
	if (bErr) throw Object.assign(new Error(bErr.message), { status: 500 })
	for (const r of (bRows ?? []) as any[]) friends.push(Number(r.user_a_id))

	return mapUserRow(data as Record<string, unknown>, await listActivitiesByUser(userId), friends)
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

	const items = data.items.map((item) => {
		const base = toSnakeCase(filterKeys(item, userKeys as any)) as Record<string, unknown>
		return {
			id: item.id,
			...base,
			reactions: item.reactions ?? 0,
		}
	})

	// Use upsert with onConflict on `id` so existing rows are updated to match JSON
	const result = await db.from(TABLE_NAME).upsert(items, { onConflict: 'id' }).select()
	if (result.error) {
		throw result.error
	}

	// Return number of users processed (either inserted or updated)
	return (result.data ?? []).length
}