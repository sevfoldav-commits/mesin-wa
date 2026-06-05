import { command } from '../../utils/command-builder.js'

export default command({
  name: 'demote',
  aliases: ['dm'],
  type: 'group',
  desc: 'Demote admin to member',
  isGroup: true,
  isAdmin: true,
  isBotAdmin: true,
  execute: async ({ hisoka, m }) => {
    const users = m.mentions.length
      ? m.mentions
      : m.text
          .split(',')
          .map((a) => a.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
          .filter((a) => a.includes('@s.whatsapp.net'))

    if (users.length === 0) return m.reply('Tag atau masukkan nomor target')

    await hisoka.groupParticipantsUpdate(m.from, users, 'demote')
    m.reply(`✅ Berhasil menurunkan ${users.length} peserta dari admin`)
  }
})
