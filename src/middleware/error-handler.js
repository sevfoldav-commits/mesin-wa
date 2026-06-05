/**
 * Global error handler — provides consistent error formatting.
 */
import { format } from 'util'
import logger from '../utils/logger.js'

/**
 * Wrap an async function with error handling.
 */
export function tryCatch(fn, context = 'Command') {
  return async (...args) => {
    try {
      return await fn(...args)
    } catch (err) {
      const errorMsg = format(err)
      logger.error(`[${context}] ${err.message}`)

      // Try to send error to user if m (message) object is in args
      const m = args.find((a) => a && typeof a === 'object' && a.reply)
      if (m && typeof m.reply === 'function') {
        try {
          await m.reply(`❌ *Error*\n\n${errorMsg.substring(0, 2000)}`)
        } catch {}
      }
    }
  }
}

/**
 * Format error for display.
 */
export function formatError(err, { m, commandName } = {}) {
  const parts = ['*Error Command*']
  if (commandName) parts.push(`\n*- Name :* ${commandName}`)
  if (m?.sender) parts.push(`\n*- Sender :* @${m.sender.split('@')[0]}`)
  parts.push(`\n*- Time :* ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`)
  parts.push(`\n*- Log :*\n\n${format(err)}`)
  return parts.join('')
}

export default { tryCatch, formatError }
