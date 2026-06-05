import { command } from '../../utils/command-builder.js'

export default command({
  name: 'sswa',
  aliases: ['listchat', 'listmsg'],
  type: 'owner',
  desc: '⚠️ Tidak tersedia di Baileys (tanpa browser)',
  isOwner: true,
  execute: async ({ hisoka, m }) => {
    m.reply('❌ Fitur screenshot WhatsApp tidak tersedia setelah migrasi ke Baileys.\n\nBaileys berjalan tanpa browser (Puppeteer). Gunakan fitur lain yang tersedia.')
  }
})
