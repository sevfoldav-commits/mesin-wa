import { command } from '../../utils/command-builder.js'

export default command({
  name: 'getinvite',
  aliases: ['invite', 'linkgroup', 'linkgc'],
  type: 'group',
  desc: 'Get group invite link',
  isGroup: true,
  isBotAdmin: true,
  execute: async ({ hisoka, m }) => {
    const code = await hisoka.groupInviteCode(m.from)
    m.reply(`🔗 *Link Grup*\n\nhttps://chat.whatsapp.com/${code}`)
  }
})
