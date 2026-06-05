/**
 * Command builder — standardized template for defining commands.
 *
 * Usage:
 *   import { command } from '../../utils/command-builder.js'
 *   export default command(...)
 */

export const command = (options) => {
  const {
    name,
    aliases = [],
    type = 'main',
    desc = '',
    example = '',
    noPrefix = false,
    locked = false,
    isOwner = false,
    isGroup = false,
    isPrivate = false,
    isAdmin = false,
    isBotAdmin = false,
    isBot = false,
    isPremium = false,
    isVIP = false,
    isQuoted = false,
    isMedia = null,
    execute = () => {}
  } = options

  return {
    name,
    aliases: Array.isArray(aliases) ? aliases : [aliases],
    type,
    desc,
    example,
    noPrefix,
    locked,
    isOwner,
    isGroup,
    isPrivate,
    isAdmin,
    isBotAdmin,
    isBot,
    isPremium,
    isVIP,
    isQuoted,
    isMedia,
    execute
  }
}

export default { command }
