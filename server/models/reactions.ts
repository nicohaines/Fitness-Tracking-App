//This is intended to be a future feature and is not functional.

import type { ReactionRecord, ReactionTargetType } from '../types'
import { commentExists } from './comments'
import { activityExists, userExists } from './users'

type CreateReactionInput = {
	userId: number
	targetType: ReactionTargetType
	targetId: number
}

let reactions: ReactionRecord[] = []

function nextReactionId(): number {
	return reactions.length ? Math.max(...reactions.map((r) => r.id)) + 1 : 1
}

async function targetExists(targetType: ReactionTargetType, targetId: number): Promise<boolean> {
	if (targetType === 'activity') await activityExists(targetId)
	if (targetType === 'comment') await commentExists(targetId)
	return false
}

export function listReactions(targetType: ReactionTargetType, targetId: number): ReactionRecord[] {
	if (!targetExists(targetType, targetId)) {
		throw Object.assign(new Error(`${targetType} not found`), { status: 404 })
	}

	return reactions.filter((r) => r.targetType === targetType && r.targetId === targetId)
}

export function createReaction(input: CreateReactionInput): ReactionRecord {
	if (!userExists(input.userId)) {
		throw Object.assign(new Error('user not found'), { status: 404 })
	}
	if (!targetExists(input.targetType, input.targetId)) {
		throw Object.assign(new Error(`${input.targetType} not found`), { status: 404 })
	}

	const existing = reactions.find(
		(r) =>
			r.userId === input.userId &&
			r.targetType === input.targetType &&
			r.targetId === input.targetId,
	)
	if (existing) {
		throw Object.assign(new Error('reaction already exists'), { status: 409 })
	}

	const reaction: ReactionRecord = {
		id: nextReactionId(),
		userId: input.userId,
		targetType: input.targetType,
		targetId: input.targetId,
		createdAt: new Date().toISOString(),
	}

	reactions.push(reaction)
	return reaction
}

export function deleteReaction(
	targetType: ReactionTargetType,
	targetId: number,
	userId: number,
): ReactionRecord {
	const index = reactions.findIndex(
		(r) => r.targetType === targetType && r.targetId === targetId && r.userId === userId,
	)
	if (index < 0) {
		throw Object.assign(new Error('reaction not found'), { status: 404 })
	}

	const [removed] = reactions.splice(index, 1)
	return removed
}

export function deleteReactionsByTarget(targetType: ReactionTargetType, targetId: number): void {
	reactions = reactions.filter((r) => !(r.targetType === targetType && r.targetId === targetId))
}

export function deleteReactionsByUser(userId: number): void {
	reactions = reactions.filter((r) => r.userId !== userId)
}
