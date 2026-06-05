/**
 * Group participant handler — welcome, goodbye, anti-spam for new members.
 */
import logger from '../utils/logger.js'
import { formatWelcome } from '../lib/automation.js'

/**
 * Handle group participant updates (new members join or leave).
 */
export async function handleGroupParticipants(sock, update) {
  const { id: jid, participants, action } = update
  if (!jid || !participants || !action) return

  const db = global.dbService
  if (!db) return

  const group = await db.getGroup(jid)
  if (!group) return

  try {
    const metadata = await sock.groupMetadata(jid)
    const groupName = metadata.subject || 'Group'
    const memberCount = metadata.participants?.length || 0

    for (const userJid of participants) {
      const user = await db.getUser(userJid)
      const userName = user?.name || userJid.split('@')[0]

      if (action === 'add') {
        logger.info(`Member joined: ${userName} in ${groupName}`)

        // Welcome message
        if (group.welcome?.enabled && group.welcome?.message) {
          const text = formatWelcome(group.welcome.message, {
            userName,
            groupName,
            memberCount
          })

          if (group.welcome.mediaUrl) {
            await sock.sendMessage(jid, {
              image: { url: group.welcome.mediaUrl },
              caption: text
            })
          } else {
            await sock.sendMessage(jid, { text })
          }
        }
      }

      if (action === 'remove') {
        logger.info(`Member left: ${userName} from ${groupName}`)

        // Goodbye message
        if (group.goodbye?.enabled && group.goodbye?.message) {
          const text = formatWelcome(group.goodbye.message, {
            userName,
            groupName,
            memberCount
          })
          await sock.sendMessage(jid, { text })
        }
      }
    }
  } catch (e) {
    logger.error('Group participant handler error:', e.message)
  }
}

export default { handleGroupParticipants }
