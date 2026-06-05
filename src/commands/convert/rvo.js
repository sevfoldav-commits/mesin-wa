import { command } from '../../utils/command-builder.js'

export default command({
  name: 'rvo',
  aliases: ['readviewonce', 'read-view-once'],
  type: 'convert',
  desc: 'Convert view once message to image/video',
  isMedia: { ViewOnce: true },
  execute: async ({ hisoka, m, quoted }) => {
    await m.reply('⏱ Membaca pesan...')
    try {
      const media = await quoted.download()
      if (!media) return m.reply('❌ Gagal mendownload media')

      // Detect type from message content
      const msg = quoted.message || quoted.content || {}
      const isVideo = msg.videoMessage || msg.video || quoted.mime?.includes('video')

      if (isVideo) {
        await hisoka.sendMessage(m.from, { video: media, caption: '' }, { quoted: m })
      } else {
        await hisoka.sendMessage(m.from, { image: media, caption: '' }, { quoted: m })
      }
    } catch (e) {
      m.reply(`❌ Error: ${e.message}`)
    }
  }
})
