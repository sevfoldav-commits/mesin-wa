import { command } from '../../utils/command-builder.js'

export default command({
  name: 'ytmp3',
  aliases: ['ytaudio', 'yta'],
  type: 'download',
  desc: 'Download YouTube Audio',
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

      const { title, links, a: channel } = request.data
      const audioLink = links.audio[Object.keys(links.audio)[0]]
      const fetchData = await Func.fetchJson(audioLink.url)
      const { size, data } = await Func.getFile(fetchData.dlink)

      if (size >= config.limit.download.free && !m.isPremium) return m.reply(config.msg.dlFree)
      if (size >= config.limit.download.premium && !m.isVIP) return m.reply(config.msg.dlPremium)
      if (size >= config.limit.download.VIP) return m.reply(config.msg.dlVIP)

      const caption = `🎵 *${title}*\n📢 ${channel || '-'}`

      await hisoka.sendMessage(m.from, {
        document: data,
        mimetype: 'audio/mpeg',
        fileName: `${title} - ${channel || 'Unknown'}.mp3`,
        caption
      }, { quoted: m })
    } catch (e) {
      m.reply(`❌ Error: ${e.message}`)
    }
  }
})
