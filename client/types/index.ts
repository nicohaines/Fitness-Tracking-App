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

export type Activity = {
  id: number
  timeElapsed: number //seconds
  type: string
  date: string
  intensity: string
  distance?: number //miles
  weight?: number //lbs
  notes?: string
}
