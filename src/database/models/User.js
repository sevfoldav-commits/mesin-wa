/**
 * User MongoDB model — leveling, limit, premium status
 */
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  jid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: { type: String, default: '' },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  totalXp: { type: Number, default: 0 },
  limit: {
    type: Number,
    default: 25 // Default free limit
  },
  dailyLimit: {
    type: Number,
    default: 25
  },
  lastDailyReset: { type: Date, default: Date.now },
  isPremium: { type: Boolean, default: false },
  premiumExpiry: { type: Date, default: null },
  isBanned: { type: Boolean, default: false },
  registeredAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
  // Stats
  totalCommands: { type: Number, default: 0 },
  totalMessages: { type: Number, default: 0 },
  // Cooldown tracking
  cooldowns: { type: Map, of: Number, default: new Map() }
})

// XP required for next level
userSchema.virtual('xpToNextLevel').get(function () {
  return Math.floor(100 * Math.pow(1.5, this.level - 1))
})

// Total XP required to reach this level
userSchema.virtual('totalXpForCurrentLevel').get(function () {
  if (this.level <= 1) return 0
  let total = 0
  for (let i = 1; i < this.level; i++) {
    total += Math.floor(100 * Math.pow(1.5, i - 1))
  }
  return total
})

// Check if can level up
userSchema.virtual('canLevelUp').get(function () {
  return this.xp >= this.xpToNextLevel
})

// Premium status check
userSchema.virtual('isPremiumActive').get(function () {
  return this.isPremium && this.premiumExpiry && new Date() < this.premiumExpiry
})

export default mongoose.model('User', userSchema)
