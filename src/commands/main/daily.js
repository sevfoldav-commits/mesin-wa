import { command } from '../../utils/command-builder.js'

export default command({
  name: 'daily',
  aliases: ['claim', 'limit'],
  type: 'main',
  desc: 'Claim daily free limit',
  execute: async ({ hisoka, m }) => {
    const db = global.dbService
    if (!db) return m.reply('Database tidak tersedia')

    const user = await db.getUser(m.sender, m.pushName)
    const now = new Date()
    const lastReset = user.lastDailyReset || new Date(0)
    const diff = now - new Date(lastReset)

    // 24 hours = 86400000 ms
    if (diff < 86400000) {
      const remaining = Math.ceil((86400000 - diff) / 3600000)
      return m.reply(`⏳ Limit harian sudah diambil!\nTunggu ${remaining} jam lagi.`)
    }

    const dailyLimit = user.isPremium ? 250 : 25
    user.limit = dailyLimit
    user.dailyLimit = dailyLimit
    user.lastDailyReset = now

    if (typeof user.save === 'function') {
      await user.save().catch(() => {})
    }

    m.reply(`🎉 *Daily Limit Claimed!*\nLimit: *${dailyLimit}*\n\nKetik *.my* untuk cek profil.`)
  }
})
