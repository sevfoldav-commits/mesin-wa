/**
 * Command loader — scans commands directory and registers commands.
 * Uses parallel imports for faster loading.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import logger from '../utils/logger.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Load all command files from a directory into a Collection.
 * @param {string} commandPath - Relative path from src/ to commands dir
 * @param {Map} collection - Commands collection to populate
 * @param {object} [options]
 * @param {boolean} [options.skipDir] - Directory name to skip (e.g. 'function')
 */
export const loadCommands = async (
  commandPath,
  collection,
  options = {}
) => {
  const { skipDir = 'function' } = options
  const dir = path.join(__dirname, '..', commandPath)

  if (!fs.existsSync(dir)) {
    logger.warn(`Commands directory not found: ${dir}`)
    return
  }

  const dirs = fs.readdirSync(dir)
  const allFiles = []

  // Collect all file paths
  for (const dirName of dirs) {
    if (dirName === skipDir) continue
    const fullPath = path.join(dir, dirName)
    if (!fs.statSync(fullPath).isDirectory()) continue

    const files = fs
      .readdirSync(fullPath)
      .filter((f) => f.endsWith('.js'))

    for (const file of files) {
      allFiles.push(path.join(fullPath, file))
    }
  }

  // Import all commands in parallel for speed
  const results = await Promise.allSettled(
    allFiles.map(async (filePath) => {
      const fileUrl = pathToFileURL(filePath).href
      const command = await import(fileUrl)
      return { filePath, command }
    })
  )

  let loaded = 0
  for (const result of results) {
    if (result.status === 'fulfilled') {
      const { command } = result.value
      if (command.default?.name) {
        collection.set(command.default.name, command)
        loaded++
      } else {
        logger.warn(`Skipping ${path.basename(result.value.filePath)}: no name export`)
      }
    } else {
      logger.error(`Failed to load command: ${result.reason?.message?.substring(0, 100)}`)
    }
  }

  logger.info(`Loaded ${loaded} commands`)
}

/**
 * Reload a single command module (for hot-reload).
 */
export const reloadCommand = async (filePath, collection) => {
  try {
    const fileUrl = pathToFileURL(filePath).href + `?update=${Date.now()}`
    const command = await import(fileUrl)
    if (command.default?.name) {
      collection.set(command.default.name, command)
      logger.info(`Reloaded command: ${command.default.name}`)
    }
  } catch (err) {
    logger.error(`Failed to reload ${filePath}:`, err.message)
  }
}

export default { loadCommands, reloadCommand }
