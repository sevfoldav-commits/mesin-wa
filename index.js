/**
 * Entry point — starts the bot with auto-restart.
 */
import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import { watchFile, unwatchFile } from 'fs'
import pino from 'pino'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
console.log('[Hisoka-Morou] Starting...')

function start() {
  const args = [path.join(__dirname, 'src', 'hisoka.js'), ...process.argv.slice(2)]
  const child = spawn(process.argv[0], args, {
    stdio: ['inherit', 'inherit', 'inherit', 'ipc']
  })

  child.on('message', (data) => {
    if (data === 'reset') {
      console.log('[Hisoka-Morou] Restarting...')
      child.kill()
      start()
    }
  })

  child.on('exit', (code) => {
    if (code !== 0) {
      console.log(`[Hisoka-Morou] Exited with code ${code}, restarting...`)
      start()
    }
  })
}

start()
