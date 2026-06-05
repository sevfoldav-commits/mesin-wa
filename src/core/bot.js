/**
 * Baileys WhatsApp client — core bot setup with auth.
 */
import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  Browsers
} from '@whiskeysockets/baileys'
import pino from 'pino'
import qrcode from 'qrcode-terminal'
import path from 'path'
import config from '../../config.js'
import logger from '../utils/logger.js'
import { serialize } from './serialize.js'
import { Message } from '../event/event.message.js'
import { handleGroupParticipants } from './group-handler.js'

const SESSION_DIR = path.join(process.cwd(), config.session.Path || 'session')

/**
 * Fetch version with timeout to prevent hanging.
 */
async function getVersion() {
  try {
    const result = await Promise.race([
      fetchLatestBaileysVersion(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
    ])
    return result
  } catch {
    logger.warn('Could not fetch latest Baileys version, using default')
    return { version: [6, 7, 0], isLatest: false }
  }
}

/**
 * Create and initialize a Baileys WhatsApp socket.
 */
export async function createBot() {
  const { version, isLatest } = await getVersion()
  logger.info(`Baileys v${version.join('.')} (latest: ${isLatest})`)

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR)

  const sock = makeWASocket({
    version,
    browser: Browsers.windows('Hisoka'),
    auth: state,
    logger: pino({ level: process.env.DEBUG ? 'debug' : 'silent' }),
    printQRInTerminal: false,
    syncFullHistory: false,
    markOnlineOnConnect: true
  })

  // Connection updates
  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      logger.info('QR Code received, please scan!')
      qrcode.generate(qr, { small: true })
      return
    }

    if (connection === 'open') {
      logger.info('WhatsApp connected!')
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut
      logger.warn(`Disconnected. Status: ${statusCode}. Reconnect: ${shouldReconnect}`)

      if (shouldReconnect) {
        setTimeout(() => {
          logger.info('Reconnecting...')
          createBot()
        }, 5000)
      } else {
        logger.error('Logged out. Delete session folder and restart.')
      }
    }
  })

  // Save credentials
  sock.ev.on('creds.update', saveCreds)

  // Handle messages
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    for (const msg of messages) {
      if (msg.key.fromMe && !config.options.public) continue
      const m = await serialize(sock, msg)
      if (!m) continue
      await Message(sock, m)
    }
  })

  // Handle group participant changes (welcome/goodbye)
  sock.ev.on('group-participants.update', async (update) => {
    await handleGroupParticipants(sock, update)
  })

  return sock
}

export default { createBot }
