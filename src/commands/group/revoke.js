import { command } from '../../utils/command-builder.js'

export default command({
  name: 'revoke',
  aliases: ['revokeinvite', 'resetlink'],
  type: 'group',
  desc: 'Revoke group invite link',
  isGroup: true,
  isAdmin: true,
  isBotAdmin: true,
  execute: async ({ hisoka, m }) => {
    await hisoka.groupRevokeInvite(m.from)
    // Get the new invite code
    const code = await hisoka.groupInviteCode(m.from)
    m.reply(`✅ Tautan undangan grup berhasil direset!\n\nKode baru: ${code}`)
  }
})
