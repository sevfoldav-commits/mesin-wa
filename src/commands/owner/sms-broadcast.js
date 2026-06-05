import { command } from '../../utils/command-builder.js'

export default command({
  name: 'broadcast',
  aliases: ['bcast', 'smsblast'],
  type: 'owner',
  desc: 'Kirim SMS broadcast ke banyak nomor\nUsage: %prefix%command pesan|nomor1,nomor2,nomor3',
  isOwner: true,
  execute: async ({ hisoka, m, config }) => {
    if (!m.text.includes('|')) {
      return m.reply('Format: *%prefix%broadcast* pesan|nomor1,nomor2,...\nPisahkan nomor dengan koma.')
    }

    const [message, numbersStr] = m.text.split('|')
    const numbers = numbersStr.split(',').map(n => n.trim()).filter(Boolean)

    if (!message || numbers.length === 0) {
      return m.reply('Masukkan pesan & daftar nomor!')
    }

    if (numbers.length > 200) {
      return m.reply('⚠️ Maksimal 200 nomor per broadcast untuk keamanan.')
    }

    if (message.length > 160) {
      return m.reply('⚠️ Pesan maksimal 160 karakter.')
    }

    await m.reply(`⏱ Mengirim SMS broadcast ke *${numbers.length}* nomor...\nEstimasi: ~${Math.ceil(numbers.length / 50)} detik`)

    try {
      const { default: IVASMS } = await import('../../gateway/sms.js')
      const sms = new IVASMS({
        apiKey: config.APIs?.ivasms?.Key || process.env.IVA_API_KEY,
        senderName: config.APIs?.ivasms?.senderName || 'Info'
      })

      if (!sms.isReady()) {
        return m.reply('⚠️ IVA SMS belum dikonfigurasi.')
      }

      // Cek saldo dulu
      const balance = await sms.getBalance()
      const estimatedCost = numbers.length * 150 // Estimasi Rp150/SMS
      if (balance.balance < estimatedCost) {
        return m.reply(`⚠️ Saldo tidak mencukupi!\nSaldo: Rp${balance.balance.toLocaleString()}\nEstimasi biaya: Rp${estimatedCost.toLocaleString()}`)
      }

      const result = await sms.broadcast(numbers, message)
      
      const report = `
📱 *SMS Broadcast Selesai!*

📤 Total: ${result.total} nomor
📦 Batch: ${result.batches}
💰 Estimasi biaya: Rp${(result.total * 150).toLocaleString()}
✅ Terkirim: ${result.results.filter(r => r?.data?.status === 'sent' || r?.status === 'success').length || '?'}
      `
      m.reply(report)
    } catch (e) {
      m.reply(`❌ Broadcast gagal: ${e.message}`)
    }
  }
})
