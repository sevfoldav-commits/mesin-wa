import { command } from '../../utils/command-builder.js'
import { sendPoll } from '../../lib/interactive.js'

export default command({
  name: 'poll',
  aliases: ['voting'],
  type: 'main',
  desc: 'Create a poll message\nUsage: %prefix%command question|option1|option2|option3',
  execute: async ({ hisoka, m }) => {
    if (!m.text) return m.reply('Contoh: *%prefix%poll* Apakah kamu suka bot?|Ya|Tidak|Biasa')

    const parts = m.text.split('|')
    const question = parts[0]?.trim() || 'Polling'
    const options = parts.slice(1).filter((o) => o.trim())

    if (options.length < 2) {
      return m.reply('Minimal 2 opsi! Contoh: %prefix%poll Pertanyaan|Opsi1|Opsi2')
    }

    if (options.length > 12) {
      return m.reply('Maksimal 12 opsi!')
    }

    await sendPoll(hisoka, m.from, {
      name: `📊 ${question}`,
      values: options,
      selectableCount: 1
    }, m)
  }
})
