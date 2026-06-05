import webp from 'node-webpmux'
import { command } from '../../utils/command-builder.js'

export default command({
  name: 'exif',
  aliases: ['getexif'],
  type: 'tool',
  desc: 'Get sticker metadata (EXIF)',
  isMedia: { Sticker: true },
  execute: async ({ hisoka, m, quoted }) => {
    try {
      const media = await quoted.download()
      if (!media) return m.reply('❌ Gagal mendownload sticker')

      const img = new webp.Image()
      await img.load(media)

      if (!img.exif) return m.reply('Tidak ada metadata EXIF pada sticker ini')

      const exifData = JSON.parse(img.exif.slice(22).toString())
      m.reply(Func.Format(exifData))
    } catch (e) {
      m.reply(`❌ Error: ${e.message}`)
    }
  }
})
