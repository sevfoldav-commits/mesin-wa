import { command } from '../../utils/command-builder.js'

export default command({
  name: 'announ',
  aliases: ['onlyadmin', 'onlyadmins', 'announce'],
  type: 'group',
  desc: 'Toggle group close (only admin can send messages)',
  isGroup: true,
  isAdmin: true,
  isBotAdmin: true,
  execute: async ({ hisoka, m }) => {
    const metadata = await hisoka.groupMetadata(m.from)
    const isAnnounce = metadata.announce === true || metadata.announce === 'true'
    await hisoka.groupSettingUpdate(m.from, isAnnounce ? 'not_announcement' : 'announcement')
    m.reply(isAnnounce ? '🔓 Grup dibuka! Semua anggota bisa mengirim pesan.' : '🔒 Grup ditutup! Hanya admin yang bisa mengirim pesan.')
  }
})
