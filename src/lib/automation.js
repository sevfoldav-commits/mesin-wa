/**
 * Automation utilities — auto-reply, anti-link, welcome/goodbye, reminders.
 */
import logger from '../utils/logger.js'

/**
 * Check if message contains a link (for anti-link feature).
 * @param {string} text
 * @returns {boolean}
 */
export function containsLink(text) {
  if (!text) return false
  const urlPattern = /(https?:\/\/|www\.)[^\s]+/gi
  return urlPattern.test(text)
}

/**
 * Check if message contains virtex (weird unicode / Zalgo).
 * @param {string} text
 * @returns {boolean}
 */
export function isVirtex(text) {
  if (!text) return false
  // Check for Zalgo / combining characters abuse
  const combiningChars = text.match(/[\u0300-\u036f\u0483-\u0489\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7-\u06e8\u06ea-\u06ed\u0711\u0730-\u074a\u07a6-\u07b0\u0901-\u0903\u093c-\u094d]/g)
  // Long text with many special chars
  if (text.length > 500 && (combiningChars?.length || 0) > text.length * 0.3) return true
  // Unusual character repetition
  if ((text.match(/(.)\1{20,}/g)?.length || 0) > 3) return true
  return false
}

/**
 * Check for toxic/forbidden words.
 * @param {string} text
 * @param {string[]} wordList
 * @returns {boolean}
 */
export function containsToxic(text, wordList = []) {
  if (!text || wordList.length === 0) return false
  const lower = text.toLowerCase()
  return wordList.some((word) => lower.includes(word.toLowerCase()))
}

/**
 * Generate welcome message for new members.
 * @param {string} template - Welcome template
 * @param {object} params
 * @returns {string}
 */
export function formatWelcome(template, { userName = '', groupName = '', memberCount = 0 }) {
  return template
    .replace(/@user/g, `@${userName}`)
    .replace(/@group/g, groupName)
    .replace(/@count/g, String(memberCount))
}

/**
 * Simple in-memory reminder system.
 */
class ReminderSystem {
  constructor() {
    this.reminders = new Map()
    this.timers = new Map()
    this.counter = 0
  }

  /**
   * Add a reminder.
   * @param {object} sock - Baileys socket
   * @param {object} options
   * @param {string} options.jid - Chat JID
   * @param {number} options.delayMs - Delay in milliseconds
   * @param {string} options.text - Reminder text
   * @param {string} options.sender - Creator JID
   * @returns {number} reminderId
   */
  add(sock, { jid, delayMs, text, sender = '' }) {
    const id = ++this.counter
    const timeout = setTimeout(async () => {
      try {
        await sock.sendMessage(jid, {
          text: `⏰ *Reminder!*\n\n${text}`
        })
        this.reminders.delete(id)
        this.timers.delete(id)
      } catch (e) {
        logger.error('Reminder error:', e.message)
      }
    }, delayMs)

    this.reminders.set(id, { jid, text, sender, delayMs, createdAt: Date.now() })
    this.timers.set(id, timeout)
    return id
  }

  /**
   * Cancel a reminder.
   */
  cancel(id) {
    const timer = this.timers.get(id)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(id)
      this.reminders.delete(id)
      return true
    }
    return false
  }

  /**
   * List all reminders for a user.
   */
  listForUser(sender) {
    const result = []
    for (const [id, reminder] of this.reminders) {
      if (reminder.sender === sender) {
        result.push({ id, ...reminder })
      }
    }
    return result
  }
}

export const reminders = new ReminderSystem()

export default { containsLink, isVirtex, containsToxic, formatWelcome, reminders }
