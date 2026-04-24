import { NextResponse } from "next/server"
import mockDB from "@/lib/mock-database"

export async function GET() {
  try {
    const leaderboard = await mockDB.findUsers()

    const rankedLeaderboard = leaderboard.map((user, index) => ({
      ...user,
      rank: index + 1,
    }))

    const totalUsers = leaderboard.length
    const totalPoints = leaderboard.reduce((sum, user) => sum + user.totalPoints, 0)
    const averagePoints = totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0

    return NextResponse.json({
      success: true,
      leaderboard: rankedLeaderboard,
      stats: {
        totalUsers,
        totalPoints,
        averagePoints,
      },
    })
  } catch (error: any) {
    console.error("Error fetching leaderboard:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch leaderboard" }, { status: 500 })
  }
}
