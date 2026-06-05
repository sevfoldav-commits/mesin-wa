import { command } from '../../utils/command-builder.js'

export default command({
  name: 'my',
  aliases: ['profil', 'profile', 'me'],
  type: 'main',
  desc: 'Show your profile & stats',
  execute: async ({ hisoka, m }) => {
    const db = global.dbService
    if (!db) return m.reply('Database tidak tersedia')

    const user = await db.getUser(m.sender, m.pushName)
    const xpNeeded = user.xpToNextLevel || Math.floor(100 * Math.pow(1.5, user.level - 1))
    const xpBar = '█'.repeat(Math.min(Math.floor((user.xp / xpNeeded) * 10), 10)) + '░'.repeat(Math.max(10 - Math.floor((user.xp / xpNeeded) * 10), 0))

    const text = `━━━ *${user.name || m.pushName || 'User'}* ━━━
    
📊 *Level:* ${user.level}
⭐ *XP:* ${user.xp} / ${xpNeeded}
${xpBar}
📈 *Total XP:* ${user.totalXp}
🎯 *Total Command:* ${user.totalCommands}
💬 *Total Pesan:* ${user.totalMessages}
🎫 *Limit:* ${user.limit}
${user.isPremium ? '👑 *Premium:* ✅' : ''}
📅 *Bergabung:* ${new Date(user.registeredAt || Date.now()).toLocaleDateString('id-ID')}`

    m.reply(text)
  }
})
