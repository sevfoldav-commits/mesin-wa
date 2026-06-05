import { command } from '../../utils/command-builder.js'

export default command({
  name: 'emojimix',
  aliases: ['emojimashup'],
  type: 'convert',
  desc: 'Combine 2 Emoji into sticker\nExample: %prefix%command 😎+😾',
  example: 'Example : %prefix%command 😎+😾',
  execute: async ({ hisoka, m }) => {
    const [emoji1, emoji2] = m.text.split('+') || m.text.split(',') || m.text.split('|')
    if (!emoji1) return m.reply('Masukkan emoji! Contoh: %prefix%command 😎+😾')

    await m.reply('⏱')

    try {
      const fetch = await Func.fetchJson(
        `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}${emoji2 ? '_' : ''}${emoji2 ? encodeURIComponent(emoji2) : ''}`
      )

      if (!fetch.results?.length) return m.reply('❌ Tidak ada hasil untuk emoji tersebut')

      for (const item of fetch.results) {
        await hisoka.sendMessage(m.from, {
          sticker: { url: item.url },
          emojis: item.tags || [emoji1, emoji2].filter(Boolean)
        }, { quoted: m })
      }
    } catch (e) {
      m.reply(`❌ Error: ${e.message}`)
    }
  }
})
