import { command } from '../../utils/command-builder.js'

export default command({
  name: 'sms',
  aliases: ['send-sms'],
  type: 'tool',
  desc: 'Kirim SMS via IVA Gateway\nUsage: %prefix%command 08123456789|Pesan kamu',
  example: 'Example: %prefix%command 08123456789|Halo, ini pesan dari bot!',
  execute: async ({ hisoka, m, config }) => {
    if (!m.text.includes('|')) {
      return m.reply('Format: *%prefix%sms* nomor|pesan\nContoh: %prefix%sms 08123456789|Halo kak!')
    }

    const [number, ...messageParts] = m.text.split('|')
    const message = messageParts.join('|').trim()

    if (!number || !message) {
      return m.reply('Format: nomor|pesan')
    }

    if (message.length > 160) {
      return m.reply('⚠️ Pesan maksimal 160 karakter (1 SMS segment)')
    }

    await m.reply('⏱ Mengirim SMS...')

    try {
      const { default: IVASMS } = await import('../../gateway/sms.js')
      const sms = new IVASMS({
        apiKey: config.APIs?.ivasms?.Key || process.env.IVA_API_KEY,
        senderName: config.APIs?.ivasms?.senderName || 'Info'
      })

      if (!sms.isReady()) {
        return m.reply('⚠️ IVA SMS belum dikonfigurasi. Set IVA_API_KEY di .env atau config.')
      }

      const result = await sms.send(number, message)
      const status = `
📱 *SMS Terkirim!*

📤 Tujuan: ${number}
📝 Pesan: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}
💰 Sisa Saldo: ${result?.data?.balance || '-'}
🆔 ID: ${result?.data?.message_id || '-'}
📊 Status: ${result?.data?.status || 'terkirim'}
      `
      m.reply(status)
    } catch (e) {
      m.reply(`❌ Gagal kirim SMS: ${e.message}`)
    }
  }
})
