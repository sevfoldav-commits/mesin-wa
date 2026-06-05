import { toAudio } from '../../lib/lib.convert.js'
import { command } from '../../utils/command-builder.js'

export default command({
  name: 'toaudio',
  aliases: ['tomp3', 'toogg'],
  type: 'convert',
  desc: 'Convert video to audio',
  isMedia: true,
  execute: async ({ hisoka, m, quoted }) => {
    if (!/video|audio/i.test(quoted.mime || '')) {
      return m.reply(`Not Supported Mime "${quoted.mime || '-'}"\n\nReply video with caption toaudio`)
    }

    await m.reply('⏱ Mengkonversi...')

    try {
      const media = await quoted.download()
      const audio = await toAudio(media, 'mp4')
      await hisoka.sendMessage(m.from, {
        document: audio,
        mimetype: 'audio/mp4',
        fileName: `Audio-${Date.now()}.mp3`
      }, { quoted: m })
    } catch (e) {
      m.reply(`❌ Error: ${e.message}`)
    }
  }
})
