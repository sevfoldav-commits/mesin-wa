/**
 * Logger utility — structured logging with optional color.
 * Falls back to plain console if chalk is unavailable.
 */
let chalk

try {
  chalk = (await import('chalk')).default
} catch {
  chalk = null
}

const timestamp = () => {
  const now = new Date()
  return now.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
}

const color = (colorFn, str) => (chalk ? colorFn(str) : str)

const logger = {
  info: (...args) => {
    console.log(color(chalk?.cyan ?? ((s) => s), `[${timestamp()}] [INFO]`), ...args)
  },

  warn: (...args) => {
    console.warn(color(chalk?.yellow ?? ((s) => s), `[${timestamp()}] [WARN]`), ...args)
  },

  error: (...args) => {
    console.error(color(chalk?.red ?? ((s) => s), `[${timestamp()}] [ERROR]`), ...args)
  },

  debug: (...args) => {
    if (process.env.DEBUG) {
      console.log(color(chalk?.magenta ?? ((s) => s), `[${timestamp()}] [DEBUG]`), ...args)
    }
  },

  chat: (pushName, sender, chatType, body) => {
    if (chalk) {
      console.log(
        chalk.black(chalk.bgWhite('- FROM')),
        chalk.black(chalk.bgGreen(pushName)),
        chalk.black(chalk.yellow(sender)),
        '\n' + chalk.black(chalk.bgWhite('- IN')),
        chalk.black(chalk.bgGreen(chatType)),
        '\n' + chalk.black(chalk.bgWhite('- MESSAGE')),
        chalk.black(chalk.bgGreen(body || ''))
      )
    } else {
      console.log(`[CHAT] From: ${pushName} (${sender}) | ${chatType} | ${body || ''}`)
    }
  }
}

export default logger
