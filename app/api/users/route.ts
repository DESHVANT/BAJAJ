import { type NextRequest, NextResponse } from "next/server"
import mockDB from "@/lib/mock-database"

export async function GET() {
  try {
    const users = await mockDB.findUsers()

    return NextResponse.json({
      success: true,
      users: users,
    })
  } catch (error: any) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Name is required and must be a non-empty string" },
        { status: 400 },
      )
    }

    if (name.trim().length > 50) {
      return NextResponse.json({ success: false, message: "Name must be less than 50 characters" }, { status: 400 })
    }

    const newUser = await mockDB.createUser(name.trim())

    return NextResponse.json({
      success: true,
      user: newUser,
      message: "User created successfully",
    })
  } catch (error: any) {
    console.error("Error creating user:", error)

    if (error.message === "User with this name already exists") {
      return NextResponse.json({ success: false, message: "User with this name already exists" }, { status: 400 })
    }

    return NextResponse.json({ success: false, message: "Failed to create user" }, { status: 500 })
  }
}
