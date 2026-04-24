"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Users, Plus, Zap, Clock, Star, Crown, Medal, Award, TrendingUp } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface User {
  _id: string
  name: string
  totalPoints: number
  createdAt: string
  rank?: number
}

interface ClaimHistory {
  _id: string
  userId: string
  userName: string
  points: number
  timestamp: string
}

interface Stats {
  totalUsers: number
  totalPoints: number
  averagePoints: number
}

export default function LeaderboardApp() {
  const [users, setUsers] = useState<User[]>([])
  const [leaderboard, setLeaderboard] = useState<User[]>([])
  const [claimHistory, setClaimHistory] = useState<ClaimHistory[]>([])
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalPoints: 0, averagePoints: 0 })
  const [newUserName, setNewUserName] = useState("")
  const [loading, setLoading] = useState(false)
  const [claiming, setClaiming] = useState<string | null>(null)
  const [isSeeding, setIsSeeding] = useState(false)

  const fetchData = async () => {
    try {
      const [usersRes, leaderboardRes, historyRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/leaderboard"),
        fetch("/api/claims/history"),
      ])

      const [usersData, leaderboardData, historyData] = await Promise.all([
        usersRes.json(),
        leaderboardRes.json(),
        historyRes.json(),
      ])

      if (usersData.success) setUsers(usersData.users)
      if (leaderboardData.success) {
        setLeaderboard(leaderboardData.leaderboard)
        setStats(leaderboardData.stats)
      }
      if (historyData.success) setClaimHistory(historyData.history)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      })
    }
  }

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUserName.trim()) return

    setLoading(true)
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newUserName.trim() }),
      })

      const data = await response.json()
      if (data.success) {
        setNewUserName("")
        fetchData()
        toast({
          title: "Success! 🎉",
          description: `${newUserName} has been added to the leaderboard!`,
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to add user",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add user",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const claimPoints = async (userId: string, userName: string) => {
    setClaiming(userId)
    try {
      const response = await fetch(`/api/users/${userId}/claim`, {
        method: "POST",
      })

      const data = await response.json()
      if (data.success) {
        fetchData()
        toast({
          title: `🎯 ${data.points} Points Claimed!`,
          description: `${userName} earned ${data.points} points!`,
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to claim points",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to claim points",
        variant: "destructive",
      })
    } finally {
      setClaiming(null)
    }
  }

  const seedDatabase = async () => {
    setIsSeeding(true)
    try {
      const response = await fetch("/api/seed", {
        method: "POST",
      })

      const data = await response.json()
      if (data.success) {
        fetchData()
        toast({
          title: "Database Seeded! 🌱",
          description: `Created ${data.usersCreated} users and ${data.historyCreated} history records`,
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to seed database",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to seed database",
        variant: "destructive",
      })
    } finally {
      setIsSeeding(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-500" />
      case 3:
        return <Award className="w-6 h-6 text-orange-500" />
      default:
        return <span className="text-lg font-bold">#{rank}</span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg"
      case 2:
        return "bg-gradient-to-r from-gray-400 to-gray-600 text-white shadow-lg"
      case 3:
        return "bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-lg"
      default:
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Trophy className="text-yellow-300" size={48} />
              <div>
                <h1 className="text-4xl font-bold">🏆 Leaderboard System</h1>
                <p className="text-blue-100 mt-2 text-lg">Full-Stack MongoDB Leaderboard App</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-center bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold">{stats.totalUsers}</div>
                <div className="text-sm text-blue-100">Total Users</div>
              </div>
              <div className="text-center bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold">{stats.totalPoints}</div>
                <div className="text-sm text-blue-100">Total Points</div>
              </div>
              <div className="text-center bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold">{stats.averagePoints}</div>
                <div className="text-sm text-blue-100">Avg Points</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex justify-center gap-4">
          <Button onClick={seedDatabase} disabled={isSeeding} className="bg-green-600 hover:bg-green-700 text-white">
            {isSeeding ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Seeding...
              </>
            ) : (
              <>🌱 Seed Database</>
            )}
          </Button>
          <Button onClick={fetchData} variant="outline" className="border-2 bg-transparent">
            🔄 Refresh Data
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1 h-fit shadow-lg">
            <CardHeader className="pb-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plus className="w-5 h-5" />
                Add New User
              </CardTitle>
              <CardDescription className="text-green-100">Register a new participant</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={addUser} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Enter full name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  disabled={loading}
                  className="w-full border-2 focus:border-green-500"
                />
                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                  disabled={loading || !newUserName.trim()}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add User
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 shadow-lg">
            <CardHeader className="pb-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Trophy className="w-6 h-6" />
                Championship Leaderboard
              </CardTitle>
              <CardDescription className="text-yellow-100">Top performers ranked by total points</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {leaderboard.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No users yet. Seed the database or add users manually!</p>
                  </div>
                ) : (
                  leaderboard.map((user) => (
                    <div
                      key={user._id}
                      className={`flex items-center justify-between p-5 rounded-xl border-2 transition-all hover:shadow-lg ${user.rank === 1
                          ? "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300"
                          : user.rank === 2
                            ? "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300"
                            : user.rank === 3
                              ? "bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300"
                              : "bg-white border-gray-200"
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${getRankColor(user.rank || 0)}`}
                        >
                          {getRankIcon(user.rank || 0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg">{user.name}</p>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            {user.totalPoints} total points
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={user.rank && user.rank <= 3 ? "default" : "secondary"}
                          className="text-sm px-3 py-1 font-semibold"
                        >
                          {user.totalPoints} pts
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => claimPoints(user._id, user.name)}
                          disabled={claiming === user._id}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {claiming === user._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <Zap className="w-4 h-4 mr-1" />
                              Claim
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1 shadow-lg">
            <CardHeader className="pb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5" />
                Recent Claims
              </CardTitle>
              <CardDescription className="text-purple-100">Latest point claims</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {claimHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No claims yet</p>
                  </div>
                ) : (
                  claimHistory.slice(0, 15).map((claim) => (
                    <div
                      key={claim._id}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">{claim.userName}</p>
                        <p className="text-xs text-gray-500">{new Date(claim.timestamp).toLocaleString()}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 font-bold">+{claim.points}</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-4 shadow-lg">
            <CardHeader className="pb-4 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="w-6 h-6" />
                All Participants ({users.length})
              </CardTitle>
              <CardDescription className="text-indigo-100">Complete list with quick claim actions</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {users.map((user) => (
                  <div
                    key={user._id}
                    className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all hover:border-blue-300"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-900 truncate">{user.name}</h3>
                      <Badge variant="outline" className="text-xs font-semibold">
                        {user.totalPoints} pts
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => claimPoints(user._id, user.name)}
                        disabled={claiming === user._id}
                        className="hover:bg-green-50 hover:border-green-300"
                      >
                        {claiming === user._id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></div>
                        ) : (
                          <Zap className="w-3 h-3 text-green-600" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {users.length === 0 && (
                <div className="text-center py-16">
                  <Users className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-xl font-semibold">No participants yet</p>
                  <p className="text-gray-400 text-sm mt-2">Seed the database or add users manually!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
