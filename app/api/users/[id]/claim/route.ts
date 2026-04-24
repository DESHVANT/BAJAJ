import { type NextRequest, NextResponse } from "next/server"
import mockDB from "@/lib/mock-database"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const user = await mockDB.findUserById(id)
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    const points = Math.floor(Math.random() * 10) + 1

    await mockDB.updateUserPoints(id, points)

    await mockDB.createClaimHistory(id, user.name, points)

    return NextResponse.json({
      success: true,
      points: points,
      message: `${user.name} claimed ${points} points!`,
    })
  } catch (error: any) {
    console.error("Error claiming points:", error)
    return NextResponse.json({ success: false, message: "Failed to claim points" }, { status: 500 })
  }
}
