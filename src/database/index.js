/**
 * Database service — in-memory cache backed by MongoDB.
 * Provides fast access to user & group data.
 */
import mongoose from 'mongoose'
import config from '../../config.js'
import logger from '../utils/logger.js'
import User from './models/User.js'
import Group from './models/Group.js'

class DatabaseService {
  constructor() {
    this.users = new Map()
    this.groups = new Map()
    this.connected = false
  }

  /**
   * Connect to MongoDB.
   */
  async connect() {
    const uri = config.options.URI
    if (!uri || !uri.startsWith('mongodb')) {
      logger.warn('MongoDB URI not configured, using in-memory only')
      return false
    }

    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000
      })
      this.connected = true
      logger.info('MongoDB connected')
      return true
    } catch (e) {
      logger.error('MongoDB connection failed:', e.message)
      return false
    }
  }

  /**
   * Get or create a user document.
   */
  async getUser(jid, pushName = '') {
    if (!jid) return null

    // Check cache
    let user = this.users.get(jid)
    if (user) return user

    // Check database
    if (this.connected) {
      try {
        let doc = await User.findOne({ jid })
        if (!doc) {
          doc = await User.create({ jid, name: pushName })
        } else {
          doc.lastActive = new Date()
          doc.name = pushName || doc.name
          await doc.save()
        }
        this.users.set(jid, doc)
        return doc
      } catch (e) {
        logger.error('Error fetching user:', e.message)
      }
    }

    // Fallback: create in-memory user
    const memUser = {
      jid,
      name: pushName,
      level: 1,
      xp: 0,
      totalXp: 0,
      limit: config.limit?.free || 25,
      dailyLimit: config.limit?.free || 25,
      isPremium: false,
      isBanned: false,
      totalCommands: 0,
      totalMessages: 0,
      cooldowns: new Map(),
      save: async () => {}
    }
    this.users.set(jid, memUser)
    return memUser
  }

  /**
   * Get or create a group document.
   */
  async getGroup(jid, groupName = '') {
    if (!jid) return null

    let group = this.groups.get(jid)
    if (group) return group

    if (this.connected) {
      try {
        let doc = await Group.findOne({ jid })
        if (!doc) {
          doc = await Group.create({ jid, name: groupName })
        }
        this.groups.set(jid, doc)
        return doc
      } catch (e) {
        logger.error('Error fetching group:', e.message)
      }
    }

    // Fallback in-memory
    const memGroup = {
      jid,
      name: groupName,
      welcome: { enabled: false, message: '', mediaUrl: '' },
      goodbye: { enabled: false, message: '' },
      antiLink: false,
      antiSpam: false,
      leveling: true,
      onlyAdmin: false,
      isMuted: false,
      save: async () => {}
    }
    this.groups.set(jid, memGroup)
    return memGroup
  }

  /**
   * Add XP to user, check level up.
   */
  async addXp(jid, amount = 10) {
    const user = await this.getUser(jid)
    if (!user) return null

    user.xp += amount
    user.totalXp += amount

    if (typeof user.lastActive === 'object') {
      user.lastActive = new Date()
    }

    let leveledUp = false
    while (user.xp >= (user.xpToNextLevel || Math.floor(100 * Math.pow(1.5, user.level - 1)))) {
      user.xp -= user.xpToNextLevel || Math.floor(100 * Math.pow(1.5, user.level - 1))
      user.level += 1
      leveledUp = true
    }

    if (this.connected && typeof user.save === 'function') {
      await user.save().catch(() => {})
    }

    return { leveledUp, level: user.level, xp: user.xp }
  }

  /**
   * Check and consume user limit.
   */
  async useLimit(jid, amount = 1) {
    const user = await this.getUser(jid)
    if (!user) return false

    // Premium/VIP users have no limits
    if (user.isPremium || user.isPremiumActive) return true

    if (user.limit >= amount) {
      user.limit -= amount
      if (this.connected && typeof user.save === 'function') {
        await user.save().catch(() => {})
      }
      return true
    }
    return false
  }

  /**
   * Reset daily limits for all users.
   */
  async resetDailyLimits() {
    const defaultLimit = config.limit?.free || 25
    for (const [jid, user] of this.users) {
      user.limit = user.isPremium ? (config.limit?.premium || 250) : defaultLimit
    }
    if (this.connected) {
      await User.updateMany({}, {
        $set: { limit: defaultLimit, lastDailyReset: new Date() }
      }).catch(() => {})
    }
    logger.info('Daily limits reset')
  }

  /**
   * Save all cached data to MongoDB.
   */
  async flush() {
    if (!this.connected) return
    for (const [, user] of this.users) {
      if (typeof user.save === 'function') {
        await user.save().catch(() => {})
      }
    }
  }

  /**
   * Disconnect from MongoDB.
   */
  async disconnect() {
    if (this.connected) {
      await this.flush()
      await mongoose.disconnect()
      logger.info('MongoDB disconnected')
    }
  }
}

export default DatabaseService
