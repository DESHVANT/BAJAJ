import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required")
}

const sql = neon(process.env.DATABASE_URL)

export { sql }

export interface User {
  id: number
  name: string
  total_points: number
  created_at: string
}

export interface ClaimHistory {
  id: number
  user_id: number
  user_name: string
  points: number
  timestamp: string
}
