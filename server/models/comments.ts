import type { Comment } from '../types'
import { activityExists, userExists } from './users'

type CreateCommentInput = {
	userId: number
	content: string
}

type UpdateCommentInput = {
	content?: string
}

let comments: Comment[] = []

function nextCommentId(): number {
	return comments.length ? Math.max(...comments.map((c) => c.id)) + 1 : 1
}

export function listCommentsByActivity(activityId: number): Comment[] {
	if (!activityExists(activityId)) {
		throw Object.assign(new Error('activity not found'), { status: 404 })
	}

	return comments.filter((c) => c.activityId === activityId)
}

export function getCommentById(commentId: number): Comment | undefined {
	return comments.find((c) => c.id === commentId)
}

export function commentExists(commentId: number): boolean {
	return Boolean(getCommentById(commentId))
}

export function createComment(activityId: number, input: CreateCommentInput): Comment {
	if (!activityExists(activityId)) {
		throw Object.assign(new Error('activity not found'), { status: 404 })
	}
	if (!userExists(input.userId)) {
		throw Object.assign(new Error('user not found'), { status: 404 })
	}

	const content = input.content?.trim()
	if (!content) {
		throw Object.assign(new Error('content is required'), { status: 400 })
	}

	const comment: Comment = {
		id: nextCommentId(),
		activityId,
		userId: input.userId,
		content,
		createdAt: new Date().toISOString(),
	}

	comments.push(comment)
	return comment
}

export function updateComment(commentId: number, patch: UpdateCommentInput): Comment {
	const comment = getCommentById(commentId)
	if (!comment) {
		throw Object.assign(new Error('comment not found'), { status: 404 })
	}

	if (patch.content !== undefined) {
		const content = patch.content.trim()
		if (!content) {
			throw Object.assign(new Error('content cannot be empty'), { status: 400 })
		}
		comment.content = content
		comment.updatedAt = new Date().toISOString()
	}

	return comment
}

export function deleteComment(commentId: number): Comment {
	const index = comments.findIndex((c) => c.id === commentId)
	if (index < 0) {
		throw Object.assign(new Error('comment not found'), { status: 404 })
	}

	const [removed] = comments.splice(index, 1)
	return removed
}

export function deleteCommentsByActivity(activityId: number): void {
	comments = comments.filter((c) => c.activityId !== activityId)
}

export function deleteCommentsByUser(userId: number): void {
	comments = comments.filter((c) => c.userId !== userId)
}
