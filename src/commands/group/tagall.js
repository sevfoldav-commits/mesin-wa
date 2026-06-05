import { command } from '../../utils/command-builder.js'

export default command({
  name: 'tagall',
  aliases: ['everyone', 'all'],
  type: 'group',
  desc: 'Tag all group members',
  isGroup: true,
  isAdmin: true,
  execute: async ({ hisoka, m }) => {
    const metadata = await hisoka.groupMetadata(m.from)
    const participants = metadata.participants || []
    const mentions = participants.map((p) => p.id)

    const reason = m.text || 'Kepada seluruh anggota grup'
    const total = participants.length
    const memberList = participants
      .map((p) => `• @${p.id.split('@')[0]}`)
      .join('\n')

    await hisoka.sendMessage(m.from, {
      text: `👥 *TAG ALL*\nPesan: ${reason}\nTotal: ${total} anggota\n\n${memberList}`,
      mentions
    }, { quoted: m })
  }
})
