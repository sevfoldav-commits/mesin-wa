import { command } from '../../utils/command-builder.js'

export default command({
  name: 'restrict',
  aliases: ['editinfo', 'editinfogroup', 'editinfogc'],
  type: 'group',
  desc: 'Toggle group info editing (only admin or all members)',
  isGroup: true,
  isAdmin: true,
  isBotAdmin: true,
  execute: async ({ hisoka, m }) => {
    const metadata = await hisoka.groupMetadata(m.from)
    const isRestrict = metadata.restrict === true || metadata.restrict === 'true'
    await hisoka.groupSettingUpdate(m.from, isRestrict ? 'unlocked' : 'locked')
    m.reply(isRestrict ? '🔓 Info grup bisa diubah semua anggota.' : '🔒 Info grup hanya bisa diubah admin.')
  }
})
