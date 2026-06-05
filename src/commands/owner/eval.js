import { format } from 'util'
import { command } from '../../utils/command-builder.js'

export default command({
  name: '>',
  aliases: ['eval', '>>'],
  type: 'owner',
  desc: 'Execute JavaScript code',
  isOwner: true,
  execute: async (opt) => {
    const { m, hisoka } = opt
    if (!m.text) return m.reply('Masukkan kode!')

    try {
      const result = /await/i.test(m.text)
        ? await eval('(async() => { ' + m.text + ' })()')
        : eval(m.text)

      // Handle Promise result
      if (result && typeof result.then === 'function') {
        result
          .then((res) => m.reply(format(res)))
          .catch((err) => m.reply(format(err)))
      } else {
        m.reply(format(result))
      }
    } catch (e) {
      m.reply(format(e))
    }
  }
})
