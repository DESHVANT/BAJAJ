import mongoose, { type Document, Schema } from "mongoose"

export interface IClaimHistory extends Document {
  userId: mongoose.Types.ObjectId
  userName: string
  points: number
  timestamp: Date
}

const ClaimHistorySchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  points: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

// Create indexes for better performance
ClaimHistorySchema.index({ timestamp: -1 })
ClaimHistorySchema.index({ userId: 1 })

export default mongoose.models.ClaimHistory || mongoose.model<IClaimHistory>("ClaimHistory", ClaimHistorySchema)
