import { command } from '../../utils/command-builder.js'

export default command({
  name: 'gempa',
  aliases: ['infogempa', 'bmkg'],
  type: 'tool',
  desc: 'Get latest earthquake info from BMKG',
  execute: async ({ hisoka, m }) => {
    await m.reply('⏱ Mencari data gempa...')

    try {
      const data = await Func.fetchJson(
        `https://bmkg-content-inatews.storage.googleapis.com/datagempa.json?t=${Date.now()}`
      )

      const info = data?.info
      if (!info) return m.reply('❌ Gagal mendapatkan data gempa')

      const text = `
‼️ *${info.instruction || 'Info Gempa'}*

📅 *Tanggal :* ${info.timesent || '-'}
📌 *Koordinat :* ${info.latitude || '-'} - ${info.longitude || '-'}
🌋 *Magnitudo :* ${info.magnitude || '-'}
🌊 *Kedalaman :* ${info.depth || '-'}
📍 *Area :* ${info.area || '-'}
📈 *Potensi :* ${info.potential || '-'}
📝 *Dirasakan :* ${info.felt || '-'}
      `

      // Send location if coordinates are available
      if (info?.point?.coordinates) {
        const [lng, lat] = info.point.coordinates.split(',')
        if (lat && lng) {
          await hisoka.sendMessage(m.from, {
            location: {
              degreesLatitude: parseFloat(lat),
              degreesLongitude: parseFloat(lng)
            }
          }, { quoted: m })
        }
      }

      // Send shakemap image
      const shakemapUrl = `https://bmkg-content-inatews.storage.googleapis.com/${info.shakemap || ''}`
      await hisoka.sendMessage(m.from, {
        image: { url: shakemapUrl },
        caption: text
      }, { quoted: m })
    } catch (e) {
      m.reply(`❌ Error: ${e.message}`)
    }
  }
})
