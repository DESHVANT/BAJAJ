import { type NextRequest, NextResponse } from "next/server"
import mockDB from "@/lib/mock-database"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (userId === undefined || userId === null) {
      return NextResponse.json({ success: false, message: "Valid user ID is required" }, { status: 400 })
    }

    const points = Math.floor(Math.random() * 10) + 1

    if (!process.env.DATABASE_URL) {
      const user = await mockDB.findUserById(String(userId))

      if (!user) {
        return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
      }

      const updatedUser = await mockDB.updateUserPoints(user._id, points)
      const claim = await mockDB.createClaimHistory(user._id, user.name, points)

      return NextResponse.json({
        success: true,
        points,
        user: updatedUser,
        claim,
        message: `${user.name} claimed ${points} points!`,
      })
    }

    const { sql } = await import("@/lib/database")
    const numericUserId = Number(userId)

    if (!Number.isFinite(numericUserId)) {
      return NextResponse.json({ success: false, message: "Valid user ID is required" }, { status: 400 })
    }

    const users = await sql<{ id: number; name: string }[]>`
      SELECT id, name FROM users WHERE id = ${numericUserId}
    `

    if (users.length === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    const user = users[0]

    await sql`BEGIN`

    try {
      await sql`
        UPDATE users 
        SET total_points = total_points + ${points} 
        WHERE id = ${numericUserId}
      `

      await sql`
        INSERT INTO claim_history (user_id, user_name, points) 
        VALUES (${numericUserId}, ${user.name}, ${points})
      `

      await sql`COMMIT`

      return NextResponse.json({
        success: true,
        points: points,
        message: `${user.name} claimed ${points} points!`,
      })
    } catch (error) {
      await sql`ROLLBACK`
      throw error
    }
  } catch (error) {
    console.error("Error claiming points:", error)
    return NextResponse.json({ success: false, message: "Failed to claim points" }, { status: 500 })
  }
}
