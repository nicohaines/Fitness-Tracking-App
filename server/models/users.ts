import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Activity, User } from '../types'

type CreateUserInput = {
	username: string
	displayName: string
	administrator?: boolean
	bio?: string
	profilePicture?: string
}

type UpdateUserInput = Partial<CreateUserInput>

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function loadSeedUsers(): User[] {
	const filePath = path.resolve(__dirname, '../data/users.json')
	const json = readFileSync(filePath, 'utf8')
	const parsed = JSON.parse(json) as User[]

	for (const user of parsed) {
		user.activity = user.activity.map((activity, index) => ({
			...activity,
			id: activity.id ?? index + 1,
			reactions: activity.reactions ?? [],
		}))
	}

	return parsed
}

let users: User[] = loadSeedUsers()

function nextUserId(): number {
	return users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1
}

export function listUsers(): User[] {
	return users
}

export function getUserById(userId: number): User | undefined {
	return users.find((u) => u.id === userId)
}

export function userExists(userId: number): boolean {
	return Boolean(getUserById(userId))
}

export function createUser(input: CreateUserInput): User {
	const username = input.username?.trim()
	const displayName = input.displayName?.trim()

	if (!username || !displayName) {
		throw Object.assign(new Error('username and displayName are required'), { status: 400 })
	}

	const usernameTaken = users.some((u) => u.username.toLowerCase() === username.toLowerCase())
	if (usernameTaken) {
		throw Object.assign(new Error('username already exists'), { status: 409 })
	}

	const user: User = {
		id: nextUserId(),
		username,
		displayName,
		administrator: Boolean(input.administrator),
		friends: [],
		profilePicture: input.profilePicture,
		bio: input.bio,
		reactions: 0,
		activity: [],
	}

	users.push(user)
	return user
}

export function updateUser(userId: number, patch: UpdateUserInput): User {
	const user = getUserById(userId)
	if (!user) {
		throw Object.assign(new Error('user not found'), { status: 404 })
	}

	if (patch.username !== undefined) {
		const username = patch.username.trim()
		if (!username) {
			throw Object.assign(new Error('username cannot be empty'), { status: 400 })
		}
		const usernameTaken = users.some(
			(u) => u.id !== userId && u.username.toLowerCase() === username.toLowerCase(),
		)
		if (usernameTaken) {
			throw Object.assign(new Error('username already exists'), { status: 409 })
		}
		user.username = username
	}

	if (patch.displayName !== undefined) {
		const displayName = patch.displayName.trim()
		if (!displayName) {
			throw Object.assign(new Error('displayName cannot be empty'), { status: 400 })
		}
		user.displayName = displayName
	}

	if (patch.administrator !== undefined) {
		user.administrator = Boolean(patch.administrator)
	}

	if (patch.bio !== undefined) user.bio = patch.bio
	if (patch.profilePicture !== undefined) user.profilePicture = patch.profilePicture

	return user
}

export function deleteUser(userId: number): User {
	const index = users.findIndex((u) => u.id === userId)
	if (index < 0) {
		throw Object.assign(new Error('user not found'), { status: 404 })
	}

	const [removed] = users.splice(index, 1)

	for (const user of users) {
		user.friends = user.friends.filter((id) => id !== userId)
	}

	return removed
}

export function listAllActivities(): Array<{ userId: number; activity: Activity }> {
	return users.flatMap((user) => user.activity.map((activity) => ({ userId: user.id, activity })))
}

export function getActivityById(activityId: number): { userId: number; activity: Activity } | undefined {
	for (const user of users) {
		const activity = user.activity.find((a) => a.id === activityId)
		if (activity) {
			return { userId: user.id, activity }
		}
	}
	return undefined
}

export function activityExists(activityId: number): boolean {
	return Boolean(getActivityById(activityId))
}
