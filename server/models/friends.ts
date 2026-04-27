import type { Friendship } from '../types'
import { getUserById, listUsers } from './users'

function normalizePair(a: number, b: number): [number, number] {
	return a < b ? [a, b] : [b, a]
}

function buildSeedFriendships(): Friendship[] {
	const users = listUsers()
	const ids = new Set(users.map((u) => u.id))
	const seen = new Set<string>()
	const friendships: Friendship[] = []
	let id = 1

	for (const user of users) {
		for (const friendId of user.friends) {
			if (!ids.has(friendId) || user.id === friendId) continue
			const [userAId, userBId] = normalizePair(user.id, friendId)
			const key = `${userAId}:${userBId}`
			if (seen.has(key)) continue
			seen.add(key)
			friendships.push({
				id: id++,
				userAId,
				userBId,
				createdAt: new Date().toISOString(),
			})
		}
	}

	return friendships
}

let friendships: Friendship[] = buildSeedFriendships()

function nextFriendshipId(): number {
	return friendships.length ? Math.max(...friendships.map((f) => f.id)) + 1 : 1
}

function syncLegacyFriendIds(): void {
	const byUser = new Map<number, Set<number>>()
	for (const user of listUsers()) {
		byUser.set(user.id, new Set<number>())
	}

	for (const friendship of friendships) {
		byUser.get(friendship.userAId)?.add(friendship.userBId)
		byUser.get(friendship.userBId)?.add(friendship.userAId)
	}

	for (const user of listUsers()) {
		user.friends = [...(byUser.get(user.id) ?? new Set<number>())].sort((a, b) => a - b)
	}
}

export function listFriendships(): Friendship[] {
	return friendships
}

export function listFriendshipsByUser(userId: number): Friendship[] {
	const user = getUserById(userId)
	if (!user) {
		throw Object.assign(new Error('user not found'), { status: 404 })
	}

	return friendships.filter((f) => f.userAId === userId || f.userBId === userId)
}

export function addFriendship(userId: number, friendId: number): Friendship {
	if (userId === friendId) {
		throw Object.assign(new Error('cannot friend yourself'), { status: 400 })
	}

	if (!getUserById(userId) || !getUserById(friendId)) {
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
