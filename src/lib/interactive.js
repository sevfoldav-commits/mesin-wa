/**
 * Interactive message builders — buttons, lists, polls.
 * Uses Baileys proto-based message construction for v7.
 */
import { proto, generateWAMessageFromContent } from '@whiskeysockets/baileys'
import logger from '../utils/logger.js'

/**
 * Send an interactive button message using NativeFlow.
 */
export async function sendButtons(sock, jid, options = {}, quoted = null) {
  const { text = '', footer = '', buttons = [] } = options

  const nativeFlowButtons = buttons.map((b) => ({
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({
      display_text: b.buttonText || b.text || b.label || 'Button',
      id: b.buttonId || b.id || '1'
    })
  }))

  const interactiveMsg = proto.Message.InteractiveMessage.create({
    body: proto.Message.InteractiveMessage.Body.create({ text }),
    footer: footer
      ? proto.Message.InteractiveMessage.Footer.create({ text: footer })
      : undefined,
    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
      buttons: nativeFlowButtons
    })
  })

  const msg = generateWAMessageFromContent(
    jid,
    { interactiveMessage: interactiveMsg },
    { quoted, userJid: sock.user?.id || jid }
  )

  return sock.relayMessage(jid, msg.message, { messageId: msg.key.id })
}

/**
 * Send a list message.
 */
export async function sendList(sock, jid, options = {}, quoted = null) {
  const { text = '', footer = '', title = '', buttonText = 'Select', sections = [] } = options

  const listSections = sections.map((s) => ({
    title: s.title || '',
    rows: (s.rows || []).map((r) => ({
      title: r.title || '',
      rowId: r.rowId || r.id || r.title,
      description: r.description || ''
    }))
  }))

  const listMessage = proto.Message.ListMessage.create({
    title,
    description: text,
    footerText: footer,
    buttonText: buttonText || 'Select',
    listType: proto.Message.ListMessage.ListType.SINGLE_SELECT,
    sections: listSections,
    type: 1
  })

  const msg = generateWAMessageFromContent(
    jid,
    { listMessage },
    { quoted, userJid: sock.user?.id || jid }
  )

  return sock.relayMessage(jid, msg.message, { messageId: msg.key.id })
}

/**
 * Send a poll message.
 */
export async function sendPoll(sock, jid, options = {}, quoted = null) {
  const { name = 'Poll', values = ['Yes', 'No'], selectableCount = 1 } = options

  const pollOptions = values.map((v) => ({
    optionName: typeof v === 'string' ? v : v.optionName || v.name || 'Option'
  }))

  const pollMessage = proto.Message.PollCreationMessage.create({
    name,
    options: pollOptions,
    selectableCount: selectableCount || 1
  })

  const msg = generateWAMessageFromContent(
    jid,
    { pollCreationMessage: pollMessage },
    { quoted, userJid: sock.user?.id || jid }
  )

  return sock.relayMessage(jid, msg.message, { messageId: msg.key.id })
}

/**
 * Send a reaction to a message.
 */
export async function sendReaction(sock, jid, messageKey, emoji) {
  return sock.sendMessage(jid, {
    react: { key: messageKey, text: emoji }
  })
}

export default { sendButtons, sendList, sendPoll, sendReaction }
