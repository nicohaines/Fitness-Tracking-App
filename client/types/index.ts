export interface User {
  id: number
  username: string
  displayName: string
  isAdmin: boolean
  friends: number[]
  exerciseStats: number[]
}

export type ExerciseType =
  | 'Strength'
  | 'Cardio'
  | 'Running'
  | 'Swimming'
  | 'Yoga'
  | 'Biking'
  | 'Lifting'

export type Intensity = 'Low' | 'Medium' | 'High'

export interface ExerciseStat {
  id: number
  userId: number
  type: ExerciseType
  /** Duration in minutes */
  timeElapsed: number
  /** ISO date string (YYYY-MM-DD) */
  dateRecorded: string
  intensity: Intensity
}
