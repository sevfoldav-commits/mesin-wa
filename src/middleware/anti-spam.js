/**
 * Anti-spam middleware — cooldown & flood detection.
 */

const userTimestamps = new Map()
const floodCounts = new Map()

const SPAM_CONFIG = {
  cooldownMs: 3000,       // 3 seconds between commands per user
  floodLimit: 10,         // max messages in window
  floodWindowMs: 5000,   // 5 second window
  floodBanMs: 30000      // 30 second mute for flooding
}

/**
 * Check if a user is spamming.
 * @param {string} sender - User JID
 * @returns {{ allowed: boolean, reason?: string }}
 */
export function checkSpam(sender) {
  const now = Date.now()

  // ---- Cooldown check ----
  const lastCmd = userTimestamps.get(sender) || 0
  if (now - lastCmd < SPAM_CONFIG.cooldownMs) {
    return { allowed: false, reason: 'cooldown' }
  }
  userTimestamps.set(sender, now)

  // ---- Flood check ----
  const userFlood = floodCounts.get(sender) || { count: 0, windowStart: now }
  if (now - userFlood.windowStart > SPAM_CONFIG.floodWindowMs) {
    // Reset window
    floodCounts.set(sender, { count: 1, windowStart: now })
  } else {
    userFlood.count++
    if (userFlood.count > SPAM_CONFIG.floodLimit) {
      // Ban temporarily
      floodCounts.set(sender, {
        count: userFlood.count,
        windowStart: now + SPAM_CONFIG.floodBanMs
      })
      return { allowed: false, reason: 'flood' }
    }
    floodCounts.set(sender, userFlood)
  }

  return { allowed: true }
}

/**
 * Reset cooldown for a user (used when command fails).
 */
export function resetCooldown(sender) {
  userTimestamps.delete(sender)
}

export default { checkSpam, resetCooldown }
