interface User {
  _id: string
  name: string
  totalPoints: number
  createdAt: string
  updatedAt: string
}

interface ClaimHistory {
  _id: string
  userId: string
  userName: string
  points: number
  timestamp: string
}

class MockDatabase {
  private users: User[] = []
  private claimHistory: ClaimHistory[] = []
  private isInitialized = false

  constructor() {
    this.loadFromStorage()
  }

  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      try {
        const storedUsers = localStorage.getItem('leaderboard_users')
        const storedHistory = localStorage.getItem('leaderboard_history')

        if (storedUsers) {
          this.users = JSON.parse(storedUsers)
        }
        if (storedHistory) {
          this.claimHistory = JSON.parse(storedHistory)
        }
      } catch (error) {
        console.error('Error loading from storage:', error)
      }
    }
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('leaderboard_users', JSON.stringify(this.users))
        localStorage.setItem('leaderboard_history', JSON.stringify(this.claimHistory))
      } catch (error) {
        console.error('Error saving to storage:', error)
      }
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  async initialize() {
    if (this.isInitialized) return

    if (this.users.length === 0) {
      const sampleUsers = [
        { name: "Rocket Riya", totalPoints: 120 },
        { name: "Blitz Ben", totalPoints: 110 },
        { name: "Ninja Nia", totalPoints: 105 },
        { name: "Captain Code", totalPoints: 99 },
        { name: "Pixel Pete", totalPoints: 95 },
        { name: "Quantum Queen", totalPoints: 92 },
        { name: "Speedy Sam", totalPoints: 88 },
        { name: "Ace Alex", totalPoints: 85 },
        { name: "Legend Leo", totalPoints: 80 },
        { name: "Mighty Maya", totalPoints: 77 },
        { name: "Turbo Tina", totalPoints: 74 },
        { name: "Flash Finn", totalPoints: 70 },
        { name: "Giga Grace", totalPoints: 68 },
        { name: "Vortex Vikram", totalPoints: 65 },
        { name: "Hero Hana", totalPoints: 62 },
      ]

      this.users = sampleUsers.map(user => ({
        _id: this.generateId(),
        name: user.name,
        totalPoints: user.totalPoints,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))

      for (let i = 0; i < 20; i++) {
        const randomUser = this.users[Math.floor(Math.random() * this.users.length)]
        const points = Math.floor(Math.random() * 10) + 1
        const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()

        this.claimHistory.push({
          _id: this.generateId(),
          userId: randomUser._id,
          userName: randomUser.name,
          points: points,
          timestamp: timestamp,
        })
      }

      this.saveToStorage()
    }

    this.isInitialized = true
  }

  async findUsers(): Promise<User[]> {
    await this.initialize()
    return this.users.sort((a, b) => b.totalPoints - a.totalPoints)
  }

  async findUserById(id: string): Promise<User | null> {
    await this.initialize()
    return this.users.find(user => user._id === id) || null
  }

  async findUserByName(name: string): Promise<User | null> {
    await this.initialize()
    return this.users.find(user =>
      user.name.toLowerCase() === name.toLowerCase()
    ) || null
  }

  async createUser(name: string): Promise<User> {
    await this.initialize()

    const existingUser = await this.findUserByName(name)
    if (existingUser) {
      throw new Error('User with this name already exists')
    }

    const newUser: User = {
      _id: this.generateId(),
      name: name.trim(),
      totalPoints: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.users.push(newUser)
    this.saveToStorage()
    return newUser
  }

  async updateUserPoints(userId: string, points: number): Promise<User> {
    await this.initialize()

    const userIndex = this.users.findIndex(user => user._id === userId)
    if (userIndex === -1) {
      throw new Error('User not found')
    }

    this.users[userIndex].totalPoints += points
    this.users[userIndex].updatedAt = new Date().toISOString()
    this.saveToStorage()

    return this.users[userIndex]
  }

  async createClaimHistory(userId: string, userName: string, points: number): Promise<ClaimHistory> {
    await this.initialize()

    const claim: ClaimHistory = {
      _id: this.generateId(),
      userId,
      userName,
      points,
      timestamp: new Date().toISOString(),
    }

    this.claimHistory.push(claim)
    this.saveToStorage()
    return claim
  }

  async findClaimHistory(): Promise<ClaimHistory[]> {
    await this.initialize()
    return this.claimHistory.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }

  async clearData(): Promise<void> {
    this.users = []
    this.claimHistory = []
    this.isInitialized = false
    this.saveToStorage()
  }

  async seedData(): Promise<{ usersCreated: number; historyCreated: number }> {
    await this.clearData()
    await this.initialize()
    return {
      usersCreated: this.users.length,
      historyCreated: this.claimHistory.length,
    }
  }
}

const mockDB = new MockDatabase()

export default mockDB 