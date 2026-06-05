import { command } from '../../utils/command-builder.js'

export default command({
  name: 'description',
  aliases: ['desc', 'set-description', 'setdesc', 'set-desc'],
  type: 'group',
  desc: 'Change group description\nExample: %prefix%command Deskripsi baru',
  isGroup: true,
  isAdmin: true,
  isBotAdmin: true,
  execute: async ({ hisoka, m }) => {
    const text = m.hasQuotedMsg && !m.text ? m.quoted.body : m.text
    if (!text) return m.reply('Masukkan deskripsi grup baru')
    await hisoka.groupUpdateDescription(m.from, text)
    m.reply('✅ Deskripsi grup berhasil diubah')
  }
})
