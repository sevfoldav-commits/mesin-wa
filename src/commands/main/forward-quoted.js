import { command } from '../../utils/command-builder.js'

export default command({
  name: 'quoted',
  aliases: ['q', 'get-quoted', 'getquoted'],
  type: 'main',
  desc: 'Get/forward the quoted message',
  isQuoted: true,
  execute: async ({ hisoka, m }) => {
    const quoted = m.quoted
    if (!quoted) return m.reply('Tidak ada pesan yang di-quote')

    try {
      // If quoted has media, download and send
      if (quoted.mime) {
        const media = await quoted.download()
        if (!media) return m.reply('❌ Gagal mendownload media')

        const isVideo = /video/i.test(quoted.mime || '')
        const isAudio = /audio/i.test(quoted.mime || '')
        const isImage = /image/i.test(quoted.mime || '')

        if (isVideo) {
          await hisoka.sendMessage(m.from, { video: media, caption: quoted.text }, { quoted: m })
        } else if (isAudio) {
          await hisoka.sendMessage(m.from, { audio: media, mimetype: quoted.mime }, { quoted: m })
        } else if (isImage) {
          await hisoka.sendMessage(m.from, { image: media, caption: quoted.text }, { quoted: m })
        } else {
          await hisoka.sendMessage(m.from, { document: media, mimetype: quoted.mime }, { quoted: m })
        }
      } else {
        // Just text
        m.reply(quoted.text || 'Pesan tidak memiliki teks')
      }
    } catch (e) {
      m.reply(`❌ Error: ${e.message}`)
    }
  }
})
