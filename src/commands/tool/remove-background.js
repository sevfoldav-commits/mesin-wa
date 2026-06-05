import axios from 'axios'
import { command } from '../../utils/command-builder.js'

export default command({
  name: 'removebg',
  aliases: ['rembg', 'nobg'],
  type: 'tool',
  desc: 'Remove background from image',
  isMedia: { Image: true },
  execute: async ({ hisoka, m, quoted }) => {
    await m.reply('⏱ Menghapus background...')

    try {
      const media = await quoted.download()
      if (!media) return m.reply('❌ Gagal mendownload media')

      const image = await removeBG(media)
      await hisoka.sendMessage(m.from, { image }, { quoted: m })
    } catch (e) {
      m.reply(`❌ Error: ${e.message}`)
    }
  }
})

async function removeBG(buffer) {
  const file = await Func.getFile(buffer)
  const { data } = await axios.post(
    'https://bgremover.zyro.com/v1/ai/background-remover',
    { image_data: `data:image/jpeg;base64,${file.data.toString('base64')}` }
  )
  return Buffer.from(data.result.split(',')[1], 'base64')
}
