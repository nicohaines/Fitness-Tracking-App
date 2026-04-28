import type { Friendship } from '../types'
import { getUserById } from './users'

function normalizePair(a: number, b: number): [number, number] {
	return a < b ? [a, b] : [b, a]
}

function buildSeedFriendships(): Friendship[] {
	return []
}

let friendships: Friendship[] = buildSeedFriendships()

function nextFriendshipId(): number {
	return friendships.length ? Math.max(...friendships.map((f) => f.id)) + 1 : 1
}

function syncLegacyFriendIds(): void {
	// No-op: friend relationships are now stored in Supabase user.friends array
}

export function listFriendships(): Friendship[] {
	return friendships
}

export async function listFriendshipsByUser(userId: number): Promise<Friendship[]> {
	const user = await getUserById(userId)
	if (!user) {
		throw Object.assign(new Error('user not found'), { status: 404 })
	}

	return friendships.filter((f) => f.userAId === userId || f.userBId === userId)
}

export async function addFriendship(userId: number, friendId: number): Promise<Friendship> {
	if (userId === friendId) {
		throw Object.assign(new Error('cannot friend yourself'), { status: 400 })
	}

	if (!(await getUserById(userId)) || !(await getUserById(friendId))) {
		throw Object.assign(new Error('user not found'), { status: 404 })
	}

	const [userAId, userBId] = normalizePair(userId, friendId)
	const exists = friendships.find((f) => f.userAId === userAId && f.userBId === userBId)
	if (exists) {
		throw Object.assign(new Error('friendship already exists'), { status: 409 })
	}

	const friendship: Friendship = {
		id: nextFriendshipId(),
		userAId,
		userBId,
		createdAt: new Date().toISOString(),
	}

	friendships.push(friendship)
	syncLegacyFriendIds()
	return friendship
}

export function removeFriendship(userId: number, friendId: number): Friendship {
	const [userAId, userBId] = normalizePair(userId, friendId)
	const index = friendships.findIndex((f) => f.userAId === userAId && f.userBId === userBId)
	if (index < 0) {
		throw Object.assign(new Error('friendship not found'), { status: 404 })
	}

	const [removed] = friendships.splice(index, 1)
	syncLegacyFriendIds()
	return removed
}

export function removeFriendshipsForUser(userId: number): void {
	friendships = friendships.filter((f) => f.userAId !== userId && f.userBId !== userId)
	syncLegacyFriendIds()
}
