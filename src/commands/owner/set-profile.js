import { command } from '../../utils/command-builder.js'

export default command({
  name: 'setprofile',
  aliases: ['setpp'],
  type: 'owner',
  desc: 'Change bot profile picture\nReply to an image with %prefix%command',
  isOwner: true,
  isMedia: { Image: true },
  execute: async ({ hisoka, m, quoted }) => {
    await m.reply('⏱ Mengubah foto profil...')

    try {
      const media = await quoted.download()
      if (!media) return m.reply('❌ Gagal mendownload media')

      const { default: sharp } = await import('sharp')
      const resized = await sharp(media)
        .resize(512, 512, { fit: 'cover' })
        .toBuffer()

      await hisoka.updateProfilePicture(m.sender, resized)
      m.reply('✅ Foto profil berhasil diubah!')
    } catch (e) {
      m.reply(`❌ Error: ${e.message}`)
    }
  }
})
