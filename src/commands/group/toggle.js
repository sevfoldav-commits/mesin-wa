import { command } from '../../utils/command-builder.js'

const TOGGLES = {
  antilink: 'antiLink',
  antispam: 'antiSpam',
  antitoxic: 'antiToxic',
  antivirtex: 'antiVirtex',
  welcome: 'welcome.enabled',
  goodbye: 'goodbye.enabled',
  leveling: 'leveling',
  onlyadmin: 'onlyAdmin',
  nsfw: 'nsfwFilter'
}

export default command({
  name: 'toggle',
  aliases: ['set'],
  type: 'group',
  desc: 'Toggle group settings\nUsage: %prefix%command antilink on/off\nAvailable: antilink, antispam, antivirtex, welcome, goodbye, leveling, onlyadmin',
  isGroup: true,
  isAdmin: true,
  execute: async ({ hisoka, m }) => {
    const args = m.text.trim().split(/\s+/)
    const feature = args[0]?.toLowerCase()
    const action = args[1]?.toLowerCase()

    if (!feature || !action || !TOGGLES[feature]) {
      const list = Object.keys(TOGGLES).map((k) => `• ${k}`).join('\n')
      return m.reply(`*Pengaturan Grup*\n\nFitur yang tersedia:\n${list}\n\nContoh: %prefix%toggle antilink on`)
    }

    if (!['on', 'off'].includes(action)) {
      return m.reply('Gunakan *on* atau *off*')
    }

    const group = m.group || await global.dbService?.getGroup(m.from)
    if (!group) return m.reply('Grup tidak ditemukan di database')

    const value = action === 'on'
    const key = TOGGLES[feature]

    // Handle nested keys like "welcome.enabled"
    if (key.includes('.')) {
      const [parent, child] = key.split('.')
      group[parent] = group[parent] || {}
      group[parent][child] = value
    } else {
      group[key] = value
    }

    await group.save?.()
    m.reply(`✅ *${feature}* → ${action.toUpperCase()}`)
  }
})
