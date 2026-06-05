import { UploadFileUgu } from '../../lib/lib.convert.js'
import fs from 'fs'
import axios from 'axios'
import { command } from '../../utils/command-builder.js'

export default command({
  name: 'fakechat',
  aliases: ['fake-chat', 'qc', 'sqc'],
  type: 'convert',
  desc: 'Convert text to sticker with quote style\nUsage: %prefix%command teks|nama|reply teks',
  execute: async ({ hisoka, m, quoted, prefix, command }) => {
    const [a, b] = m.text.split('|')
    let media, reply
    const tempDir = './temp'

    try {
      // Handle quoted media
      if (quoted?.isMedia && quoted.mime) {
        const ext = quoted.mime.split('/')[1]
        const fileName = Func.getRandom(ext)
        const buffer = await quoted.download()
        if (buffer) {
          const upload = await UploadFileUgu(buffer, fileName)
          if (upload?.url) media = { media: { url: upload.url } }
          try { fs.unlinkSync(`${tempDir}/${fileName}`) } catch {}
        }
      }

      // Handle reply info
      if (b && m.quoted?.sender) {
        reply = {
          name: m.quoted.pushName || m.quoted.sender.split('@')[0],
          text: b === 'q' ? quoted.body.replace(prefix + command, '') : b,
          chatId: 5,
          id: 5
        }
      }

      await m.reply('⏱')

      // Get profile pictures
      const defaultPic = 'https://i0.wp.com/telegra.ph/file/134ccbbd0dfc434a910ab.png'
      const getPic = async (jid) => {
        try { return await hisoka.profilePictureUrl(jid, 'image') } catch { return defaultPic }
      }

      const senderPic = await getPic(m.sender)
      const quotedPic = m.quoted?.sender ? await getPic(m.quoted.sender) : defaultPic

      const jsonnya = {
        type: 'quoted',
        format: 'png',
        backgroundColor: '#1b1e23',
        messages: [
          {
            avatar: true,
            from: {
              id: 8,
              name: b
                ? (m.pushName || m.sender.split('@')[0])
                : (m.quoted?.pushName || m.quoted?.sender?.split('@')[0] || 'User'),
              photo: { url: b ? senderPic : quotedPic }
            },
            ...(media || {}),
            text: a || quoted.body.replace(prefix + command, ''),
            replyMessage: reply || undefined
          }
        ]
      }

      const post = await axios.post(
        'https://bot.lyo.su/quote/generate',
        jsonnya,
        { headers: { 'Content-Type': 'application/json' } }
      )

      const buffer = Buffer.from(post.data.result.image, 'base64')
      await hisoka.sendMessage(m.from, { sticker: buffer }, { quoted: m })
    } catch (e) {
      m.reply(`❌ Error: ${e.message}`)
    }
  }
})
