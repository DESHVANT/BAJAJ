-- MongoDB Collections Setup
-- This is a reference for the collections structure

-- Users Collection
-- {
--   "_id": ObjectId,
--   "name": String (required, unique),
--   "totalPoints": Number (default: 0),
--   "createdAt": Date
-- }

-- ClaimHistory Collection
-- {
--   "_id": ObjectId,
--   "userId": ObjectId (reference to users._id),
--   "userName": String,
--   "points": Number (1-10),
--   "timestamp": Date
-- }

-- Indexes for better performance
-- db.users.createIndex({ "name": 1 }, { unique: true })
-- db.users.createIndex({ "totalPoints": -1 })
-- db.claimHistory.createIndex({ "userId": 1 })
-- db.claimHistory.createIndex({ "timestamp": -1 })
