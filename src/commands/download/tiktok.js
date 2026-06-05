import { toAudio } from '../../lib/lib.convert.js'
import { command } from '../../utils/command-builder.js'

export default command({
  name: 'tiktok',
  aliases: ['tt', 'ttdl'],
  type: 'download',
  desc: 'Download Video and Audio Tiktok',
  example: 'No Urls!\n\nExample : %prefix%command https://www.tiktok.com/@user/video/...',
  isLimit: true,
  execute: async ({ hisoka, m }) => {
    const url = Func.isUrl(m.text)[0]
    if (!url) return m.reply('Masukkan link TikTok!')

    await m.reply('⏱ Mengunduh...')

    try {
      const json = await Func.fetchJson(
        `https://api.tiklydown.me/api/download?url=${url}`
      )

      if (!json?.video?.noWatermark) return m.reply('❌ Gagal mengambil data TikTok')

      const text = `
📱 *TikTok Downloader*

👤 Author : ${json?.author?.name} (@${json?.author?.unique_id})
🎵 Judul : ${json?.title || '-'}
👁 Dilihat : ${json?.stats?.playCount || 0}
💬 Komentar : ${json?.stats?.commentCount || 0}
🔄 Dibagikan : ${json?.stats?.shareCount || 0}
⏱ Durasi : ${json?.video?.durationFormatted || '-'}
`

      const noWatermark = json?.video?.noWatermark
      const musicUrl = json?.music?.play_url
      const musicTitle = json?.music?.title || 'audio'

      if (m.text.toLowerCase().includes('audio') || m.text.toLowerCase().includes('mp3')) {
        // Audio only
        await hisoka.sendMessage(m.from, {
          document: { url: musicUrl },
          mimetype: 'audio/mpeg',
          fileName: `${musicTitle}.mp3`
        }, { quoted: m })
      } else {
        // Video with audio
        await hisoka.sendMessage(m.from, {
          video: { url: noWatermark },
          caption: text
        }, { quoted: m })
      }
    } catch (e) {
      m.reply(`❌ Error: ${e.message}`)
    }
  }
})
