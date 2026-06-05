import { command } from '../../utils/command-builder.js'

export default command({
  name: 'add',
  aliases: ['+'],
  type: 'group',
  desc: 'Add participants to group',
  isGroup: true,
  isAdmin: true,
  isBotAdmin: true,
  execute: async ({ hisoka, m }) => {
    const users = m.text
      .split(',')
      .map((a) => a.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
      .filter((a) => a.includes('@s.whatsapp.net'))

    if (users.length === 0) return m.reply('Masukkan nomor target, pisahkan dengan koma')

    await hisoka.groupParticipantsUpdate(m.from, users, 'add')
    m.reply(`✅ Berhasil menambahkan ${users.length} peserta`)
  }
})
