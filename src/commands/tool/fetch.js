import axios from 'axios'
import { format } from 'util'
import { command } from '../../utils/command-builder.js'

export default command({
  name: 'fetch',
  aliases: ['get', 'url'],
  type: 'tool',
  desc: 'Fetch URL content',
  example: 'No Urls!?\n\nExample : %prefix%command https://example.com',
  execute: async ({ hisoka, m, config }) => {
    const url = Func.isUrl(m.text)[0]
    if (!url) return m.reply('Masukkan URL!')
    if (!/^https?:\/\//.test(url)) return m.reply('URL tidak valid')

    await m.reply('⏱ Mengambil data...')

    try {
      const headRes = await axios.head(url).catch(() => null)
      const contentType = headRes?.headers?.['content-type'] || ''
      const isText = /text|json/.test(contentType)

      if (isText) {
        const res = await axios.get(url)
        const text = typeof res.data === 'object' ? format(res.data) : res.data
        return m.reply(text.substring(0, 5000)) // Limit output
      }

      // Download file
      const { size, data, ext, mime } = await Func.getFile(url)

      if (size >= config.limit.download.free && !m.isPremium) return m.reply(config.msg.dlFree)
      if (size >= config.limit.download.premium && !m.isVIP) return m.reply(config.msg.dlPremium)
      if (size >= config.limit.download.VIP) return m.reply(config.msg.dlVIP)

      // Parse custom filename from text
      let fileName = m.text.includes('filename=')
        ? m.text.split('filename=')[1].split(' ')[0] + '.' + ext
        : Func.getRandom(ext, 20)
      let caption = m.text.includes('caption=')
        ? m.text.split('caption=')[1].split(' ')[0]
        : ''

      await hisoka.sendMessage(m.from, {
        document: data,
        mimetype: mime || 'application/octet-stream',
        fileName,
        caption
      }, { quoted: m })
    } catch (e) {
      m.reply(`❌ Error: ${e.message}`)
    }
  }
})
