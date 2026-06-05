import fs from 'fs'
import { exec } from 'child_process'
import { promisify } from 'util'
import { webp2mp4File } from '../../lib/lib.convert.js'
import { command } from '../../utils/command-builder.js'

const execAsync = promisify(exec)

export default command({
  name: 'toimage',
  aliases: ['toimg', 'tovid', 'tomp4', 'tovideo'],
  type: 'convert',
  desc: 'Convert Sticker to Image/Video',
  isMedia: { Sticker: true },
  execute: async ({ hisoka, m }) => {
    await m.reply('⏱ Mengkonversi...')

    try {
      const quoted = m.quoted || m
      const media = await quoted.download()
      if (!media) return m.reply('❌ Gagal mendownload media')

      const isAnimated = quoted.type?.includes('video') || quoted.mime?.includes('video')

      if (isAnimated) {
        const resultUrl = await webp2mp4File(media)
        await hisoka.sendMessage(m.from, {
          video: { url: resultUrl }
        }, { quoted: m })
      } else {
        await hisoka.sendMessage(m.from, {
          image: media
        }, { quoted: m })
      }
    } catch (e) {
      m.reply(`❌ Error: ${e.message}`)
    }
  }
})
