import { Router } from 'express'
import {
	createComment,
	deleteComment,
	getCommentById,
	listCommentsByActivity,
	updateComment,
} from '../models/comments'
import { deleteReactionsByTarget } from '../models/reactions'
import type { Comment, DataEnvelope, DataListEnvelope } from '../types'

const app = Router({ mergeParams: true })

function parseId(value: string): number {
	const id = Number.parseInt(value, 10)
	if (Number.isNaN(id)) {
		throw Object.assign(new Error('invalid id parameter'), { status: 400 })
	}
	return id
}

app.get('/', (req, res) => {
	const activityId = parseId((req.params as { activityId: string }).activityId)
	const comments = listCommentsByActivity(activityId)
	const response: DataListEnvelope<Comment> = {
		data: comments,
		total: comments.length,
		isSuccess: true,
	}
	res.send(response)
})

app.get('/:id', (req, res) => {
	const params = req.params as { activityId: string; id: string }
	const activityId = parseId(params.activityId)
	const commentId = parseId(params.id)
	const comment = getCommentById(commentId)
	if (!comment || comment.activityId !== activityId) {
		throw Object.assign(new Error('comment not found'), { status: 404 })
	}

	const response: DataEnvelope<Comment> = {
		data: comment,
		isSuccess: true,
	}
	res.send(response)
})

app.post('/', (req, res) => {
	const activityId = parseId((req.params as { activityId: string }).activityId)
	const comment = createComment(activityId, req.body)
	const response: DataEnvelope<Comment> = {
		data: comment,
		isSuccess: true,
		message: 'comment created',
	}
	res.status(201).send(response)
})

app.patch('/:id', (req, res) => {
	const params = req.params as { activityId: string; id: string }
	const activityId = parseId(params.activityId)
	const commentId = parseId(params.id)
	const existing = getCommentById(commentId)
	if (!existing || existing.activityId !== activityId) {
		throw Object.assign(new Error('comment not found'), { status: 404 })
	}
	const comment = updateComment(commentId, req.body)
	const response: DataEnvelope<Comment> = {
		data: comment,
		isSuccess: true,
		message: 'comment updated',
	}
	res.send(response)
})

app.delete('/:id', (req, res) => {
	const params = req.params as { activityId: string; id: string }
	const activityId = parseId(params.activityId)
	const commentId = parseId(params.id)
	const existing = getCommentById(commentId)
	if (!existing || existing.activityId !== activityId) {
		throw Object.assign(new Error('comment not found'), { status: 404 })
	}

	const removed = deleteComment(commentId)
	deleteReactionsByTarget('comment', commentId)
	const response: DataEnvelope<Comment> = {
		data: removed,
		isSuccess: true,
		message: 'comment deleted',
	}
	res.send(response)
})

export default app
