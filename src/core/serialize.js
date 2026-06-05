/**
 * Baileys message serializer — converts Baileys message objects
 * into a standardized format compatible with our command system.
 */
import {
  getContentType,
  jidDecode,
  downloadContentFromMessage,
  extractMessageContent
} from '@whiskeysockets/baileys'
import logger from '../utils/logger.js'

/**
 * Extract the actual message content from various message types.
 */
function getMessage(msg) {
  if (!msg?.message) return null
  const m = extractMessageContent(msg.message)
  return m
}

/**
 * Get the body/text of a message.
 */
function getBody(msg, content) {
  if (!content) return ''
  const type = getContentType(msg.message)
  if (type === 'conversation') return content
  if (type === 'extendedTextMessage') return content.text || ''
  if (type === 'imageMessage' || type === 'videoMessage') return content.caption || ''
  if (type === 'documentMessage') return content.caption || ''
  if (type === 'listResponseMessage') return content.singleSelectReply?.selectedRowId || ''
  if (type === 'buttonsResponseMessage') return content.selectedButtonId || ''
  if (type === 'templateButtonReplyMessage') return content.selectedId || ''
  return content.text || ''
}

/**
 * Detect MIME type from message type.
 */
function getMime(content) {
  if (!content) return null
  if (content.imageMessage) return 'image/jpeg'
  if (content.videoMessage) return 'video/mp4'
  if (content.audioMessage) return content.audioMessage.ptt ? 'audio/ogg; codecs=opus' : 'audio/mp4'
  if (content.stickerMessage) return 'image/webp'
  if (content.documentMessage) return content.documentMessage.mimetype || 'application/octet-stream'
  return null
}

/**
 * Check if message is a view-once message.
 */
function isViewOnce(content) {
  if (!content) return false
  const type = getContentType({ message: content })
  return type === 'viewOnceMessage' || type === 'viewOnceMessageV2'
}

/**
 * Serialize a Baileys message into our standard format.
 */
export async function serialize(sock, msg) {
  try {
    if (!msg?.key) return null

    const content = getMessage(msg)
    if (!content) return null

    const isGroup = msg.key.remoteJid.endsWith('@g.us')
    const type = getContentType(msg.message)

    // Sender information
    const sender = isGroup ? msg.key.participant || msg.key.remoteJid : msg.key.remoteJid
    const pushName = msg.pushName || ''

    // Extract text
    const body = getBody(msg, content)

    // Extract mentioned JIDs
    const mentionedJid = content?.contextInfo?.mentionedJid || []

    // Extract quoted message
    let quoted = null
    if (content?.contextInfo?.quotedMessage) {
      const quotedMsg = extractMessageContent(content.contextInfo.quotedMessage)
      const quotedType = getContentType({ message: content.contextInfo.quotedMessage })
      quoted = {
        key: {
          remoteJid: msg.key.remoteJid,
          fromMe: content.contextInfo.participant === sock.user?.id,
          id: content.contextInfo.stanzaId,
          participant: content.contextInfo.participant
        },
        message: content.contextInfo.quotedMessage,
        type: quotedType,
        mime: getMime(content.contextInfo.quotedMessage),
        text: typeof quotedMsg?.text === 'string' ? quotedMsg.text : quotedMsg?.caption || '',
        sender: content.contextInfo.participant || msg.key.remoteJid,
        duration: quotedMsg?.seconds || quotedMsg?.videoMessage?.seconds || 0,
        isViewOnce: isViewOnce(content.contextInfo.quotedMessage)
      }
    }

    // Check if sender is the bot owner
    const isOwner = Array.isArray(config.options.owner)
      ? config.options.owner.some((o) => sender?.startsWith(o))
      : false

    // Build serialized message object
    const serialized = {
      // Basic info
      key: msg.key,
      from: msg.key.remoteJid,
      sender,
      pushName: pushName,
      body,
      text: body,
      type,
      isGroup,
      isBot: msg.key.fromMe,
      fromMe: msg.key.fromMe,

      // Timestamp
      timestamp: msg.messageTimestamp || Math.floor(Date.now() / 1000),
      message: msg.message,
      content,

      // Mentions
      mentions: mentionedJid,

      // Quoted message
      hasQuotedMsg: !!quoted,
      quoted,

      // Media info
      mime: getMime(msg.message),
      duration: content?.seconds || content?.videoMessage?.seconds || 0,
      isViewOnce: isViewOnce(msg.message),

      // Bot permission checks
      isOwner,
      isPremium: isOwner,  // Owner is automatically premium
      isVIP: isOwner,      // Owner is automatically VIP

      // Group-specific (filled in later if needed)
      isAdmin: false,
      isBotAdmin: false,

      // Reply & send helpers
      reply: async (text, options = {}) => {
        return sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg, ...options })
      },

      send: async (content, options = {}) => {
        return sock.sendMessage(msg.key.remoteJid, content, { quoted: msg, ...options })
      },

      // Download media
      download: async () => {
        if (!msg.message) return null
        const msgType = getContentType(msg.message)
        if (!msgType) return null

        const stream = await downloadContentFromMessage(
          msg.message[msgType],
          msgType.replace('Message', '')
        )
        const chunks = []
        for await (const chunk of stream) {
          chunks.push(chunk)
        }
        return Buffer.concat(chunks)
      }
    }

    // For group messages, fetch admin status
    if (isGroup) {
      try {
        const groupMeta = await sock.groupMetadata(msg.key.remoteJid)
        const participants = groupMeta.participants || []
        const user = participants.find((p) => p.id === sender)
        const bot = participants.find((p) => p.id === sock.user?.id)

        serialized.isAdmin = user?.admin === 'admin' || user?.admin === 'superadmin'
        serialized.isBotAdmin = bot?.admin === 'admin' || bot?.admin === 'superadmin'
        serialized.groupMetadata = groupMeta
      } catch (e) {
        logger.debug('Failed to fetch group metadata:', e.message)
      }
    }

    return serialized
  } catch (e) {
    logger.error('Serialize error:', e)
    return null
  }
}

export default { serialize }
