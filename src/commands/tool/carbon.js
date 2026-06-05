import axios from 'axios'
import { command } from '../../utils/command-builder.js'

export default command({
  name: 'carbon',
  aliases: ['carbons'],
  type: 'tool',
  desc: 'Create carbon code image from text',
  example: 'Example: %prefix%command console.log("hello")',
  execute: async ({ hisoka, m }) => {
    if (!m.text) return m.reply('Masukkan kode yang ingin dijadikan gambar!')

    await m.reply('⏱ Membuat karbon...')

    try {
      const { data } = await axios.post(
        'https://carbonara.solopov.dev/api/cook',
        { code: m.text },
        { responseType: 'arraybuffer' }
      )

      await hisoka.sendMessage(m.from, { image: data }, { quoted: m })
    } catch (e) {
      m.reply(`❌ Error: ${e.message}`)
    }
  }
})
