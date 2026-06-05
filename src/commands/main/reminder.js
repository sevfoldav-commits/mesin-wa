import { command } from '../../utils/command-builder.js'
import { reminders } from '../../lib/automation.js'

export default command({
  name: 'reminder',
  aliases: ['remind', 'remindme'],
  type: 'main',
  desc: 'Set a reminder\nUsage: %prefix%command 30s Beli susu\nSupports: s (detik), m (menit), h (jam)',
  execute: async ({ hisoka, m }) => {
    const args = m.text.trim().split(/\s+/)
    const timeStr = args[0]
    const text = args.slice(1).join(' ')

    if (!timeStr || !text) {
      return m.reply('Contoh: %prefix%reminder 30s Beli susu di warung')
    }

    // Parse time
    const match = timeStr.match(/^(\d+)([smh])$/i)
    if (!match) return m.reply('Format waktu: 30s, 5m, 2h')

    const amount = parseInt(match[1])
    const unit = match[2].toLowerCase()
    const multipliers = { s: 1000, m: 60000, h: 3600000 }
    const delayMs = amount * (multipliers[unit] || 1000)

    if (delayMs > 86400000) return m.reply('Maksimal 24 jam!')
    if (delayMs < 10000) return m.reply('Minimal 10 detik!')

    const id = reminders.add(hisoka, {
      jid: m.from,
      delayMs,
      text,
      sender: m.sender
    })

    const unitName = { s: 'detik', m: 'menit', h: 'jam' }[unit]
    m.reply(`⏰ *Reminder diatur!*\nID: ${id}\nWaktu: ${amount} ${unitName}\nPesan: ${text}`)
  }
})
