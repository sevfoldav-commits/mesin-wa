import { command } from '../../utils/command-builder.js'

export default command({
  name: 'otp',
  aliases: ['send-otp', 'verifikasi'],
  type: 'tool',
  desc: 'Kirim kode OTP/verifikasi via SMS\nUsage: %prefix%command 08123456789',
  example: 'Example: %prefix%command 08123456789',
  execute: async ({ hisoka, m, config }) => {
    const number = m.text.trim()
    if (!number) return m.reply('Masukkan nomor tujuan!')

    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    await m.reply('⏱ Mengirim kode OTP...')

    try {
      const { default: IVASMS } = await import('../../gateway/sms.js')
      const sms = new IVASMS({
        apiKey: config.APIs?.ivasms?.Key || process.env.IVA_API_KEY,
        senderName: config.APIs?.ivasms?.senderName || 'OTP'
      })

      if (!sms.isReady()) {
        return m.reply('⚠️ IVA SMS belum dikonfigurasi.')
      }

      await sms.sendOTP(number, code, {
        template: 'Kode verifikasi Anda: %code%\nBerlaku 5 menit. Jangan bagikan kode ini!'
      })

      m.reply(`✅ *OTP terkirim!*\n\n📱 Nomor: ${number}\n🔑 Kode: *${code}*\n⏱ Berlaku: 5 menit\n\nSimpan kode ini untuk verifikasi.`)
    } catch (e) {
      m.reply(`❌ Gagal: ${e.message}`)
    }
  }
})
