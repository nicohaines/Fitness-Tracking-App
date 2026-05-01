import type { ReactionRecord, ReactionTargetType } from '../types'
import { connect, toCamelCase, toSnakeCase } from './supabase'
import reactionsData from '../data/reactions.json'

export const TABLE_NAME = 'reactions'

type CreateReactionInput = {
	userId: number
	targetType: ReactionTargetType
	targetId: number
}

function mapReactionRow(row: Record<string, unknown>): ReactionRecord {
	const mapped = toCamelCase(row) as Partial<ReactionRecord>
	return {
		id: Number(mapped.id),
		userId: Number(mapped.userId),
		targetType: String(mapped.targetType ?? '') as ReactionTargetType,
		targetId: Number(mapped.targetId),
		createdAt: String(mapped.createdAt ?? new Date().toISOString()),
	}
}

async function activityExists(activityId: number): Promise<boolean> {
	const db = connect()
	const { data, error } = await db.from('activities').select('id').eq('id', activityId).maybeSingle()
	if (error) {
		throw Object.assign(new Error(error.message), { status: 500 })
	}
	return Boolean(data)
}

async function userExists(userId: number): Promise<boolean> {
	const db = connect()
	const { data, error } = await db.from('users').select('id').eq('id', userId).maybeSingle()
	if (error) {
		throw Object.assign(new Error(error.message), { status: 500 })
	}
	return Boolean(data)
}

async function targetExists(targetType: ReactionTargetType, targetId: number): Promise<boolean> {
	if (targetType === 'activity') {
		return activityExists(targetId)
	}
	return false
}

export async function listReactions(targetType: ReactionTargetType, targetId: number): Promise<ReactionRecord[]> {
	if (!(await targetExists(targetType, targetId))) {
		throw Object.assign(new Error(`${targetType} not found`), { status: 404 })
	}

	const db = connect()
	const { data, error } = await db
		.from(TABLE_NAME)
		.select('*')
		.eq('target_type', targetType)
		.eq('target_id', targetId)

	if (error) {
		throw Object.assign(new Error(error.message), { status: 500 })
	}

	return (data ?? []).map((row) => mapReactionRow(row as Record<string, unknown>))
}

export async function listReactionsByTargetIds(
	targetType: ReactionTargetType,
	targetIds: number[],
): Promise<Map<number, ReactionRecord[]>> {
	if (targetIds.length === 0) {
		return new Map()
	}

	const db = connect()
	const { data, error } = await db
		.from(TABLE_NAME)
		.select('*')
		.eq('target_type', targetType)
		.in('target_id', targetIds)

	if (error) {
		throw Object.assign(new Error(error.message), { status: 500 })
	}

	const grouped = new Map<number, ReactionRecord[]>()
	for (const row of data ?? []) {
		const reaction = mapReactionRow(row as Record<string, unknown>)
		const list = grouped.get(reaction.targetId) ?? []
		list.push(reaction)
		grouped.set(reaction.targetId, list)
	}

	return grouped
}

export async function createReaction(input: CreateReactionInput): Promise<ReactionRecord> {
	if (!(await userExists(input.userId))) {
		throw Object.assign(new Error('user not found'), { status: 404 })
	}
	if (!(await targetExists(input.targetType, input.targetId))) {
		throw Object.assign(new Error(`${input.targetType} not found`), { status: 404 })
	}

	const db = connect()
	const { data: existing, error: existingError } = await db
		.from(TABLE_NAME)
		.select('id')
		.eq('user_id', input.userId)
		.eq('target_type', input.targetType)
		.eq('target_id', input.targetId)
		.maybeSingle()

	if (existingError) {
		throw Object.assign(new Error(existingError.message), { status: 500 })
	}

	if (existing) {
		throw Object.assign(new Error('reaction already exists'), { status: 409 })
	}

	const payload = toSnakeCase({
		userId: input.userId,
		targetType: input.targetType,
		targetId: input.targetId,
	})

	const { data, error } = await db.from(TABLE_NAME).insert(payload).select().single()

	if (error) {
		throw Object.assign(new Error(error.message), { status: 500 })
	}

	return mapReactionRow(data as Record<string, unknown>)
}

export async function deleteReaction(
	targetType: ReactionTargetType,
	targetId: number,
	userId: number,
): Promise<ReactionRecord> {
	const db = connect()
	const { data: existing, error: existingError } = await db
		.from(TABLE_NAME)
		.select('*')
		.eq('user_id', userId)
		.eq('target_type', targetType)
		.eq('target_id', targetId)
		.maybeSingle()

	if (existingError) {
		throw Object.assign(new Error(existingError.message), { status: 500 })
	}

	if (!existing) {
		throw Object.assign(new Error('reaction not found'), { status: 404 })
	}

	const { data, error } = await db
		.from(TABLE_NAME)
		.delete()
		.eq('user_id', userId)
		.eq('target_type', targetType)
		.eq('target_id', targetId)
		.select()
		.single()

	if (error) {
		throw Object.assign(new Error(error.message), { status: 500 })
	}

	return mapReactionRow(data as Record<string, unknown>)
}

export async function seed(): Promise<number> {
	const db = connect()
	let seededReactions = 0

	for (const reaction of reactionsData.reactions) {
		const result = await db.from(TABLE_NAME).insert(
			toSnakeCase({
				userId: reaction.userId,
				targetType: reaction.targetType,
				targetId: reaction.targetId,
			}),
		)

		if (result.error) {
			throw result.error
		}

		seededReactions += 1
	}

	return seededReactions
}
