import { command } from '../../utils/command-builder.js'

export default command({
  name: 'twitter',
  aliases: ['twitterdl', 'twdl'],
  type: 'download',
  desc: 'Download Twitter/X video',
  example: 'No Urls!\n\nExample : %prefix%command https://twitter.com/user/status/...',
  isLimit: true,
  execute: async ({ hisoka, m }) => {
    const url = Func.isUrl(m.body)[0]
    if (!url) return m.reply('Masukkan link Twitter!')

    await m.reply('⏱ Mengunduh...')

    try {
      const API = global.api || api
      const request = await new API('xzn').get('/api/twitterdl', { url })
      if (request.data?.err) return m.reply('❌ Gagal mengambil data')

      const media = request.data?.media?.[0] || request.data?.video || request.data?.url
      if (!media) return m.reply('❌ Tidak ada media ditemukan')

      const isVideo = /\.(mp4|mov|webm)/i.test(media)
      const caption = `🐦 *Twitter/X Video*`

      if (isVideo) {
        await hisoka.sendMessage(m.from, { video: { url: media }, caption }, { quoted: m })
      } else {
        await hisoka.sendMessage(m.from, { image: { url: media }, caption }, { quoted: m })
      }
    } catch (e) {
      m.reply(`❌ Error: ${e.message}`)
    }
  }
})
