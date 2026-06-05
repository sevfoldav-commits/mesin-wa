/**
 * Main bot entry — initializes Baileys, database, and modules.
 */
import config from '../config.js'
import path from 'path'
import { fileURLToPath } from 'url'
import API from './lib/lib.api.js'
import Function from './lib/lib.function.js'
import { Message, readCommands } from './event/event.message.js'
import DatabaseService from './database/index.js'
import logger from './utils/logger.js'
import { createBot } from './core/bot.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Global modules
global.Func = Function
global.api = API
global.commands = new ((await import('./lib/lib.collection.js')).default)()
global.dbService = null
global.hisoka = null

/**
 * Watch commands directory for hot-reload.
 */
function watchCommands() {
  import('chokidar').then(({ default: chokidar }) => {
    const watchDir = Func.__filename(path.join(process.cwd(), 'src', 'commands'))
    const watcher = chokidar.watch(watchDir, { ignored: /^\./ })
    watcher
      .on('change', async (p) => {
        try {
          const cmd = await import(Func.__filename(p) + '?v=' + Date.now())
          if (cmd?.default?.name) {
            global.commands.set(cmd.default.name, cmd)
            logger.debug(`Hot-reloaded: ${cmd.default.name}`)
          }
        } catch (e) {
          logger.error(`Failed to reload:`, e.message)
        }
      })
  }).catch(() => {})
}

/**
 * Start the bot.
 */
async function start() {
  process.on('uncaughtException', (err) => logger.error('Uncaught Exception:', err.message))
  process.on('unhandledRejection', (err) => logger.error('Unhandled Rejection:', err.message))

  try {
    // 1. Load commands
    logger.info('Loading commands...')
    await readCommands()
    logger.info(`Loaded ${global.commands.size} commands`)

    // 2. Start watcher for hot-reload (only monitors changes, not initial add)
    watchCommands()

    // 3. Initialize database
    logger.info('Initializing database...')
    const db = new DatabaseService()
    global.dbService = db
    await db.connect()

    // 4. Periodically save DB & reset limits
    setInterval(() => db.resetDailyLimits(), 3600000)
    setInterval(() => {
      if (db.connected) db.flush().catch(() => {})
    }, 30000)

    // 5. Start Baileys bot
    logger.info('Starting Baileys...')
    const hisoka = await createBot()
    global.hisoka = hisoka

    logger.info('Bot is running!')
    return hisoka
  } catch (e) {
    logger.error('Failed to start bot:', e.message)
    logger.info('Retrying in 10 seconds...')
    setTimeout(start, 10000)
  }
}

start().catch((e) => logger.error('Startup error:', e.message))

export default { start }
