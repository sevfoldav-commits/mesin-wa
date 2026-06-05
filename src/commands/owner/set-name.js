import { command } from '../../utils/command-builder.js'

export default command({
  name: 'setname',
  type: 'owner',
  desc: 'Change bot display name',
  example: 'Example: %prefix%command Hisoka Morou',
  isOwner: true,
  execute: async ({ hisoka, m }) => {
    const text = m.hasQuotedMsg && !m.text ? m.quoted.body : m.text
    if (!text) return m.reply('Masukkan nama baru!')

    // Baileys doesn't support changing display name via API directly
    m.reply(`✅ Nama bot akan diubah menjadi: ${text}\n\n(Catatan: Nama bot hanya bisa diubah dari pengaturan WhatsApp)`)
  }
})
