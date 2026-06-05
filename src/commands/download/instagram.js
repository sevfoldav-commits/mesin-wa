import { command } from '../../utils/command-builder.js'

export default command({
  name: 'instagram',
  aliases: ['ig', 'igdl'],
  type: 'download',
  desc: 'Download video and photo Instagram',
  example: 'No Urls?!\n\nExample : %prefix%command https://www.instagram.com/reel/...',
  isLimit: true,
  execute: async ({ hisoka, m }) => {
    const url = Func.isUrl(m.body)[0]
    if (!url) return m.reply('Masukkan link Instagram!')

    await m.reply('⏱ Mengunduh...')

    try {
      const API = global.api || api
      const request = await new API('xzn').get('/api/igdl', { url })
      if (request.data?.err) return m.reply('❌ Gagal mengambil data')

      const caption = request.data.caption ? `📷 *Instagram*\n\n${request.data.caption}` : ''

      for (const media of request.data.media) {
        const isVideo = /\.(mp4|mov|webm)/i.test(media)
        if (isVideo) {
          await hisoka.sendMessage(m.from, { video: { url: media }, caption }, { quoted: m })
        } else {
          await hisoka.sendMessage(m.from, { image: { url: media }, caption }, { quoted: m })
        }
      }
    } catch (e) {
      m.reply(`❌ Error: ${e.message}`)
    }
  }
})
