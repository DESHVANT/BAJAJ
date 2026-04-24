import { NextResponse } from "next/server"
import mockDB from "@/lib/mock-database"

export async function POST() {
  try {
    const result = await mockDB.seedData()

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      usersCreated: result.usersCreated,
      historyCreated: result.historyCreated,
    })
  } catch (error: any) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ success: false, message: "Failed to seed database" }, { status: 500 })
  }
}
