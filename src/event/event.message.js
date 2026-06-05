/**
 * Message event handler — processes incoming messages.
 * Integrates: command execution, database, anti-spam, automations.
 */
import config from '../../config.js'
import { format } from 'util'
import moment from 'moment-timezone'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import logger from '../utils/logger.js'
import { validateCommand } from '../middleware/command-validator.js'
import { checkSpam } from '../middleware/anti-spam.js'
import { loadCommands } from '../core/command-loader.js'
import { containsLink, isVirtex } from '../lib/automation.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Main message handler — called for every incoming message.
 */
export const Message = async (hisoka, m) => {
  try {
    if (!config.options.public && !m.isOwner) return
    if (!m) return
    if (m.isBot) return

    // Initialize database service
    const db = global.dbService

    // Parse prefix & command
    const prefix = m.prefix = /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#%^&.©^]/gi.test(m.body)
      ? m.body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#%^&.©^]/gi)[0]
      : ''
    const cmd = m.cmd = m.body
      ? m.body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase()
      : ''
    const command = m.command =
      commands.get(cmd) || commands.find((v) => v.default.aliases && v.default.aliases.includes(cmd))
    const quoted = m?.hasQuotedMsg ? m.quoted : m

    // Load user data
    if (db) {
      const user = await db.getUser(m.sender, m.pushName)
      m.user = user
      user.totalMessages++

      // Add XP for activity
      if (user.totalMessages % 3 === 0) {
        const xpResult = await db.addXp(m.sender, 5)
        if (xpResult?.leveledUp) {
          await m.reply(`🎉 *Level Up!*\nKamu sekarang level *${xpResult.level}*!`)
        }
      }

      // Load group settings
      if (m.isGroup) {
        m.group = await db.getGroup(m.from, m.groupMetadata?.subject || '')
      }
    }

    // Log incoming chat
    if (m && !m.isBot) {
      logger.chat(
        m.pushName,
        m.sender,
        m.isGroup ? 'Group Chat' : 'Private Chat',
        m.body || m.type
      )
    }

    // ===== Group Automations =====
    if (m.isGroup && m.group) {
      // Anti-link
      if (m.group.antiLink && !m.isAdmin && !m.isOwner) {
        if (containsLink(m.body)) {
          await hisoka.sendMessage(m.from, {
            delete: { remoteJid: m.from, id: m.key.id, participant: m.sender }
          })
          return
        }
      }

      // Anti-virtex
      if (m.group.antiVirtex && !m.isAdmin && !m.isOwner) {
        if (isVirtex(m.body)) {
          await hisoka.sendMessage(m.from, {
            delete: { remoteJid: m.from, id: m.key.id, participant: m.sender }
          })
          return
        }
      }

      // Muted group
      if (m.group.isMuted && !m.isAdmin && !m.isOwner) return
    }

    // ===== Execute Command =====
    if (command && !m.isBot) {
      // Anti-spam check
      if (!m.isOwner) {
        const spamCheck = checkSpam(m.sender)
        if (!spamCheck.allowed) {
          if (spamCheck.reason === 'flood') {
            await m.reply('⚠️ *Anti-Spam:* Kamu terdeteksi spam. Harap tunggu 30 detik.')
          }
          return
        }
      }

      await executeCommand(command, { hisoka, m, quoted, prefix, cmd })
    }

    // ===== No-Prefix Function Handlers =====
    if (!command && !m.isBot) {
      await runFunctionHandlers({ hisoka, m, quoted, prefix, cmd })
    }
  } catch (e) {
    logger.error('Message handler error:', e)
  }
}

/**
 * Execute a validated command.
 */
async function executeCommand(command, { hisoka, m, quoted, prefix, cmd }) {
  const def = command.default || command

  // Validate permissions
  const validationError = validateCommand(command, { m, quoted, prefix })
  if (validationError) {
    const msgMap = config.msg || {}
    if (def.example && !m.text) return m.reply(validationError)
    if (def.isMedia && !quoted.mime) return m.reply(validationError)
    return m.reply(msgMap[validationError] || validationError)
  }

  // Consume limit
  if (m.user && !m.user.isPremium && !m.user.isPremiumActive) {
    const hasLimit = await global.dbService?.useLimit(m.sender)
    if (!hasLimit) {
      return m.reply('⚠️ *Limit habis!*\nGunakan `.daily` untuk klaim limit harian.')
    }
  }

  // Execute
  try {
    if (m.user) m.user.totalCommands++
    await def.execute({ hisoka, m, command: cmd, quoted, prefix, commands, config })
  } catch (err) {
    const text = format(err)
    logger.error(`Command error [${def.name}]:`, err.message)
    m.reply(
      `*Error Command*\n\n*- Name :* ${def.name}\n*- Sender :* @${m.sender.split('@')[0]}\n*- Time :* ${moment(m.timestamp * 1000).tz('Asia/Jakarta')}\n*- Log :*\n\n${text}`,
      { mentions: [m.sender] }
    )
  }
}

/**
 * Run no-prefix function handlers.
 */
async function runFunctionHandlers({ hisoka, m, quoted, prefix, cmd }) {
  const dir = path.join(__dirname, '..', config.options.pathCommand, 'function')
  if (!fs.existsSync(dir)) return

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.js'))
  for (const file of files) {
    try {
      const load = await import(Func.__filename(path.join(dir, file)))
      await load.default({ hisoka, m, quoted, prefix, commands, command: cmd, config })
    } catch (e) {
      logger.error(`Function handler error (${file}):`, e.message)
    }
  }
}

/**
 * Load all commands from the commands directory.
 */
export const readCommands = async (pathname = config.options.pathCommand) => {
  await loadCommands(pathname, commands, { skipDir: 'function' })
}

// Hot-reload
let fileP = fileURLToPath(import.meta.url)
fs.watchFile(fileP, () => {
  fs.unwatchFile(fileP)
  console.log(`Update File "${fileP}"`)
  import(`${import.meta.url}?update=${Date.now()}`)
})
