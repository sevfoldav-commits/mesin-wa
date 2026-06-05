import { command } from '../../utils/command-builder.js'

export default command({
  name: 'ytmp4',
  aliases: ['ytvideo', 'ytv'],
  type: 'download',
  desc: 'Download YouTube Video',
  example: 'No Urls!\n\nExample : %prefix%command https://www.youtube.com/watch?v=...',
  isLimit: true,
  execute: async ({ hisoka, m, config }) => {
    const url = Func.isUrl(m.body)[0]
    if (!url) return m.reply('Masukkan link YouTube!')

    await m.reply('⏱ Mengambil data...')

    try {
      const API = global.api || api
      const request = await new API('xzn').get('/api/y2mate', { url })
      if (request.data?.err) return m.reply('❌ Gagal mengambil data video')

      const { title, links } = request.data
      const videoLink = links.video[Object.keys(links.video)[0]]
      const fetchData = await Func.fetchJson(videoLink.url)
      const dlink = fetchData.dlink
      const { size } = await Func.getFile(dlink)

      if (size >= config.limit.download.free && !m.isPremium) return m.reply(config.msg.dlFree)
      if (size >= config.limit.download.premium && !m.isVIP) return m.reply(config.msg.dlPremium)
      if (size >= config.limit.download.VIP) return m.reply(config.msg.dlVIP)

      // Send video via URL
      await hisoka.sendMessage(m.from, {
        video: { url: dlink },
        caption: `🎬 *${title}*`
      }, { quoted: m })
    } catch (e) {
      m.reply(`❌ Error: ${e.message}`)
    }
  }
})
