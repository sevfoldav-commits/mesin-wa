import { exec } from 'child_process'
import { command } from '../../utils/command-builder.js'

export default command({
  name: '$',
  aliases: ['exec'],
  type: 'owner',
  desc: 'Execute shell command',
  isOwner: true,
  noPrefix: true,
  execute: async ({ m }) => {
    try {
      exec(m.text, async (err, stdout) => {
        if (err) return m.reply(Func.Format(err))
        if (stdout) return m.reply(Func.Format(stdout))
      })
    } catch (e) {
      m.reply(Func.Format(e))
    }
  }
})
