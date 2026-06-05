import { command } from '../../utils/command-builder.js'

export default command({
  name: 'subject',
  aliases: ['setsubject', 'set-subject'],
  type: 'group',
  desc: 'Change group subject/name\nExample: %prefix%command Nama Grup Baru',
  isGroup: true,
  isAdmin: true,
  isBotAdmin: true,
  execute: async ({ hisoka, m }) => {
    const text = m.hasQuotedMsg && !m.text ? m.quoted.body : m.text
    if (!text) return m.reply('Masukkan nama grup baru')
    await hisoka.groupUpdateSubject(m.from, text)
    m.reply(`✅ Nama grup diubah menjadi: ${text}`)
  }
})
