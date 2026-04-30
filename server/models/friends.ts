import type { Friendship } from '../types'
import { getUserById } from './users'
import { connect } from './supabase'
import friendsData from "../data/friends.json"

function normalizePair(a: number, b: number): [number, number] {
	return a < b ? [a, b] : [b, a]
}

export async function listFriendshipsByUser(userId: number): Promise<Friendship[]> {
	const db = connect()
	
	// Query both directions: user_a_id = userId OR user_b_id = userId
	const { data: aRows, error: aErr } = await db
		.from('friendships')
		.select('*')
		.eq('user_a_id', userId)
	
	const { data: bRows, error: bErr } = await db
		.from('friendships')
		.select('*')
		.eq('user_b_id', userId)

	if (aErr || bErr) {
		throw Object.assign(new Error(aErr?.message ?? bErr?.message ?? 'db error'), { status: 500 })
	}

	const allRows = [...(aRows ?? []), ...(bRows ?? [])]
	
	return allRows.map((row) => {
		const r = row as Record<string, unknown>
		return {
			id: Number(r.id),
			userAId: Number(r.user_a_id),
			userBId: Number(r.user_b_id),
			createdAt: String(r.created_at ?? new Date().toISOString()),
		}
	})
}

export async function addFriendship(userId: number, friendId: number): Promise<Friendship> {
	if (userId === friendId) {
		throw Object.assign(new Error('cannot friend yourself'), { status: 400 })
	}

	if (!(await getUserById(userId)) || !(await getUserById(friendId))) {
		throw Object.assign(new Error('user not found'), { status: 404 })
	}

	const [userAId, userBId] = normalizePair(userId, friendId)
	
	const db = connect()
	const { data: existing, error: existingErr } = await db
		.from('friendships')
		.select('*')
		.eq('user_a_id', userAId)
		.eq('user_b_id', userBId)
		.maybeSingle()
	
	if (existingErr) {
		throw Object.assign(new Error(existingErr.message), { status: 500 })
	}
	
	if (existing) {
		throw Object.assign(new Error('friendship already exists'), { status: 409 })
	}

	const { data, error } = await db
		.from('friendships')
		.insert({ user_a_id: userAId, user_b_id: userBId })
		.select()
		.single()

	if (error) {
		throw Object.assign(new Error(error.message), { status: 500 })
	}

	return {
		id: Number(data.id),
		userAId: Number(data.user_a_id),
		userBId: Number(data.user_b_id),
		createdAt: String(data.created_at),
	}
}

export async function removeFriendship(userId: number, friendId: number): Promise<Friendship> {
	const [userAId, userBId] = normalizePair(userId, friendId)
	
	const db = connect()
	const { data: existing, error: existingErr } = await db
		.from('friendships')
		.select('*')
		.eq('user_a_id', userAId)
		.eq('user_b_id', userBId)
		.maybeSingle()
	
	if (existingErr) {
		throw Object.assign(new Error(existingErr.message), { status: 500 })
	}
	
	if (!existing) {
		throw Object.assign(new Error('friendship not found'), { status: 404 })
	}

	const { data, error } = await db
		.from('friendships')
		.delete()
		.eq('user_a_id', userAId)
		.eq('user_b_id', userBId)
		.select()
		.single()

	if (error) {
		throw Object.assign(new Error(error.message), { status: 500 })
	}

	return {
		id: Number(data.id),
		userAId: Number(data.user_a_id),
		userBId: Number(data.user_b_id),
		createdAt: String(data.created_at),
	}
}

export async function seed(): Promise<number> {
	const db = connect()
	let seededFriendships = 0

	for (const friendship of friendsData.friendships) {
		const record = {
			user_a_id: friendship.userId1,
			user_b_id: friendship.userId2,
		}
		const result = await db.from('friendships').insert(record)
		if (result.error) {
			throw result.error
		}
		seededFriendships += 1
	}

	return seededFriendships
}
