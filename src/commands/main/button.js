import { command } from '../../utils/command-builder.js'
import { sendButtons, sendList, sendPoll } from '../../lib/interactive.js'

export default command({
  name: 'button',
  aliases: ['btn'],
  type: 'main',
  desc: 'Send interactive button message',
  execute: async ({ hisoka, m }) => {
    await sendButtons(hisoka, m.from, {
      text: '📌 *Button Interaktif*\n\nIni adalah contoh pesan dengan tombol!',
      footer: 'Powered by Hisoka-Morou',
      buttons: [
        { buttonId: 'yes', buttonText: '✅ Ya' },
        { buttonId: 'no', buttonText: '❌ Tidak' },
        { buttonId: 'info', buttonText: 'ℹ️ Info' }
      ]
    }, m)
  }
})
