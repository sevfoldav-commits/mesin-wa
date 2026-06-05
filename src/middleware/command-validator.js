/**
 * Command validator middleware — checks permission & conditions before execution.
 */

const checkMedia = (command, quoted) => {
  const media = command.isMedia
  if (!media) return null
  if (typeof media === 'object' && media !== null) {
    if (media.Sticker && !/webp/i.test(quoted.mime)) return 'Reply Sticker...'
    if (media.Image && !/image/i.test(quoted.mime)) return 'Reply or Send Caption With Image...'
    if (media.Video && !/video/i.test(quoted.mime)) return 'Reply or Send Caption With Video...'
    if (media.Audio && !/audio|voice/i.test(quoted.mime)) return 'Reply Audio...'
    if (media.Text && !/text/i.test(quoted.mime)) return 'Reply Media Text...'
    if (media.Font && !/font/i.test(quoted.mime)) return 'Reply Media Font...'
    if (media.Application && !/application/i.test(quoted.mime)) return 'Reply Media Application...'
    if (media.ViewOnce && !quoted.isViewOnce) return 'Reply View Once...'
    return null
  }
  return 'Reply media...'
}

export const validateCommand = (command, { m, quoted, prefix }) => {
  if (!command || !m) return null
  const def = command.default || command

  if (def.locked && !m.isOwner) return 'locked'
  if (def.isOwner && !m.isOwner) return 'owner'
  if (def.isGroup && !m.isGroup) return 'group'
  if (def.isPrivate && m.isGroup) return 'private'
  if (def.isBotAdmin && !m.isBotAdmin) return 'botAdmin'
  if (def.isAdmin && !m.isAdmin) return 'admin'
  if (def.isBot && m.fromMe) return 'bot'
  if (def.isPremium && !m.isPremium) return 'premium'
  if (def.isVIP && !m.isVIP) return 'vip'
  if (def.isQuoted && !m.hasQuotedMsg) return 'quoted'

  if (def.isMedia && !quoted.mime) {
    const msg = checkMedia(def, quoted)
    if (msg) return msg
  }

  if (def.example && !m.text) {
    return def.example
      .replace(/%prefix/gi, prefix)
      .replace(/%command/gi, def.name)
      .replace(/%text/gi, m.text)
  }

  return null // valid
}

export default { validateCommand }
