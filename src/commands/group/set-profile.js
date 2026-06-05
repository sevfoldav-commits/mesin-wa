import { command } from '../../utils/command-builder.js'

export default command({
  name: 'seticon',
  aliases: ['setikon', 'setppgc', 'setppgroup'],
  type: 'group',
  desc: 'Change group profile picture\nReply to an image with %prefix%command',
  isGroup: true,
  isAdmin: true,
  isBotAdmin: true,
  isMedia: { Image: true },
  execute: async ({ hisoka, m, quoted }) => {
    await m.reply('⏱ Mengubah foto grup...')

    try {
      const media = await quoted.download()
      if (!media) return m.reply('❌ Gagal mendownload media')

      // Resize ke 512x512 untuk profile picture
      const { default: sharp } = await import('sharp')
      const resized = await sharp(media)
        .resize(512, 512, { fit: 'cover' })
        .toBuffer()

      await hisoka.updateProfilePicture(m.from, resized)
      m.reply('✅ Foto grup berhasil diubah!')
    } catch (e) {
      m.reply(`❌ Error: ${e.message}`)
    }
  }
})
