export type { DataEnvelope, DataListEnvelope } from './dataEnvelopes'

export type User = {
  id: number
  username: string
  displayName: string
  administrator: boolean
  friends: number[]
  profilePicture?: string
  bio?: string
  reactions: number
  activity: Activity[]
}

export const userKeys = [
    "username",
    "displayName",
    "administrator",
    "bio",
    "profilePicture",
]

export type Activity = {
  id: number
  timeElapsed: number //seconds
  type: string
  date: string
  intensity: string
  distance?: number //miles
  weight?: number //lbs
  notes?: string
  reactions: Reaction[]
}

export type Reaction = {
  userId: number;
  id: number;
}

export type Friendship = {
  id: number
  userAId: number
  userBId: number
  createdAt: string
}

export type Comment = {
  id: number
  activityId: number
  userId: number
  content: string
  createdAt: string
  updatedAt?: string
}

export type ReactionTargetType = 'activity' | 'comment'

export type ReactionRecord = {
  id: number
  userId: number
  targetType: ReactionTargetType
  targetId: number
  createdAt: string
}
