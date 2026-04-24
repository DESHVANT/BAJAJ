import mongoose, { type Document, Schema } from "mongoose"

export interface IUser extends Document {
  name: string
  totalPoints: number
  createdAt: Date
  updatedAt: Date
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      unique: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    totalPoints: {
      type: Number,
      default: 0,
      min: [0, "Points cannot be negative"],
    },
  },
  {
    timestamps: true,
  },
)

UserSchema.index({ totalPoints: -1 })
UserSchema.index({ name: 1 })

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
