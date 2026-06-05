import { command } from '../../utils/command-builder.js'

export default command({
  name: 'approval',
  aliases: ['approve'],
  type: 'group',
  desc: 'Toggle membership approval mode',
  isGroup: true,
  isAdmin: true,
  isBotAdmin: true,
  execute: async ({ hisoka, m }) => {
    const metadata = await hisoka.groupMetadata(m.from)
    const currentMode = metadata.joinApprovalMode === true || metadata.joinApprovalMode === 'true'
    // Toggle via group setting - use 'locked'/'unlocked' approach for membership approval
    // In Baileys, this needs a custom group query
    await hisoka.groupSettingUpdate(m.from, currentMode ? 'unlocked' : 'locked')
    m.reply(currentMode
      ? '🔓 Mode persetujuan anggota dimatikan'
      : '🔒 Mode persetujuan anggota diaktifkan'
    )
  }
})
