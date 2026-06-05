import { command } from '../../utils/command-builder.js'

export default command({
  name: 'setname',
  aliases: ['setsubject'],
  type: 'group',
  desc: 'Change group subject/name',
  isGroup: true,
  isAdmin: true,
  isBotAdmin: true,
  execute: async ({ hisoka, m }) => {
    if (!m.text) return m.reply('Masukkan nama grup baru')
    await hisoka.groupUpdateSubject(m.from, m.text)
    m.reply(`✅ Nama grup diubah menjadi: ${m.text}`)
  }
})
