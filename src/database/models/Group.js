/**
 * Group MongoDB model — settings, anti-spam, welcome, etc.
 */
import mongoose from 'mongoose'

const groupSchema = new mongoose.Schema({
  jid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: { type: String, default: '' },
  // Welcome
  welcome: {
    enabled: { type: Boolean, default: false },
    message: { type: String, default: 'Welcome @user to @group!' },
    mediaUrl: { type: String, default: '' }
  },
  // Goodbye
  goodbye: {
    enabled: { type: Boolean, default: false },
    message: { type: String, default: 'Goodbye @user!' }
  },
  // Anti-features
  antiLink: { type: Boolean, default: false },
  antiSpam: { type: Boolean, default: false },
  antiToxic: { type: Boolean, default: false },
  antiVirtex: { type: Boolean, default: false },
  // Auto-reply
  autoReply: { type: Boolean, default: false },
  autoSticker: { type: Boolean, default: false },
  // NSFW filter
  nsfwFilter: { type: Boolean, default: false },
  // Leveling
  leveling: { type: Boolean, default: true },
  // Economy (future)
  economy: { type: Boolean, default: false },
  // Admin-only mode
  onlyAdmin: { type: Boolean, default: false },
  // Mute status
  isMuted: { type: Boolean, default: false },
  mutedUntil: { type: Date, default: null },
  // Custom prefix
  prefix: { type: String, default: '' },
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

groupSchema.pre('save', function (next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.model('Group', groupSchema)
