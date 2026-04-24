import { NextResponse } from "next/server"
import mockDB from "@/lib/mock-database"

export async function GET() {
  try {
    const history = await mockDB.findClaimHistory()

    return NextResponse.json({
      success: true,
      history: history,
    })
  } catch (error: any) {
    console.error("Error fetching claim history:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch claim history" }, { status: 500 })
  }
}
