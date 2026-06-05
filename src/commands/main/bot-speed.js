import cp from 'child_process'
import { promisify } from 'util'
import { command } from '../../utils/command-builder.js'

export default command({
  name: 'speed',
  aliases: ['speedtes', 'speedtest'],
  type: 'main',
  desc: 'Check internet speed',
  execute: async ({ hisoka, m }) => {
    const exec = promisify(cp.exec).bind(cp)
    await m.reply('Test Speed...')
    try {
      const { stdout, stderr } = await exec('speedtest')
      if (stdout) return m.reply(stdout)
      if (stderr) return m.reply(stderr)
    } catch (e) {
      const { stdout, stderr } = e
      if (stdout) return m.reply(stdout)
      if (stderr) return m.reply(stderr)
    }
  }
})
