import { command } from '../../utils/command-builder.js'
import IVASMS from '../../lib/ivasms.js'

let ivasmsInstance = null
const activeOrders = new Map()

function getIVASMS() {
  if (!ivasmsInstance) ivasmsInstance = new IVASMS()
  return ivasmsInstance
}

export default command({
  name: 'ivasms',
  aliases: ['sms', 'otp'],
  type: 'tool',
  desc: `IVASMS - SMS Virtual untuk OTP

Subcommand:
  .ivasms balance          — Cek saldo
  .ivasms search [negara]  — Cari nomor tersedia
  .ivasms buy [negara]     — Beli nomor baru
  .ivasms otp <order_id>   — Ambil OTP dari nomor
  .ivasms wait <order_id>  — Tunggu OTP (auto 2 menit)
  .ivasms cancel <order_id> — Batalkan pesanan
  .ivasms orders           — Daftar pesanan

Contoh:
  .ivasms buy id           — Beli nomor Indonesia
  .ivasms otp 12345        — Ambil OTP dari order 12345`,

  execute: async ({ hisoka, m }) => {
    const args = m.text.trim().split(/\s+/)
    const sub = args[0]?.toLowerCase()
    const param = args.slice(1).join(' ')

    if (!sub) {
      return m.reply(`📱 *IVASMS - SMS Virtual*\n\nSubcommand:\n• balance — Cek saldo\n• search [negara] — Cari nomor\n• buy [negara] — Beli nomor\n• otp <id> — Ambil OTP\n• wait <id> — Tunggu OTP\n• cancel <id> — Batalkan\n• orders — Daftar pesanan`)
    }

    const api = getIVASMS()

    switch (sub) {
      case 'balance':
      case 'saldo': {
        await m.reply('⏱ Cek saldo...')
        const res = await api.balance()
        if (!res.success) return m.reply(`❌ Gagal: ${res.error}`)
        return m.reply(`💰 *Saldo IVASMS*\n\nRp ${res.balance?.toLocaleString?.('id-ID') || res.balance || 0}`)
      }

      case 'search':
      case 'cari': {
        await m.reply('⏱ Mencari nomor...')
        const country = param || 'id'
        const res = await api.search({ country })
        if (!res.success) return m.reply(`❌ Gagal: ${res.error}`)
        if (!res.data?.length) return m.reply(`Tidak ada nomor tersedia untuk ${country}`)

        let text = `📱 *Nomor Tersedia (${country.toUpperCase()})*\n\n`
        for (const num of res.data.slice(0, 10)) {
          text += `• ${num.number || num.phone || num.id} — Rp ${num.price || num.harga || '?'}\n`
        }
        text += `\nGunakan: .ivasms buy ${country}`
        return m.reply(text)
      }

      case 'buy':
      case 'beli': {
        await m.reply('⏱ Membeli nomor...')
        const country2 = param || 'id'
        const res = await api.buy({ country: country2 })
        if (!res.success) return m.reply(`❌ Gagal: ${res.error}`)

        if (res.orderId) {
          activeOrders.set(res.orderId, { country: country2, time: Date.now() })
        }

        let text = `✅ *Nomor Berhasil Dibeli*\n\n`
        text += `🆔 Order ID: ${res.orderId}\n`
        text += `📞 Nomor: ${res.phoneNumber || 'Cek orders'}\n`
        text += `🌍 Negara: ${country2.toUpperCase()}\n`
        text += `\n📌 Ambil OTP:\n.ivasms otp ${res.orderId}\n.ivasms wait ${res.orderId}`

        // Auto wait for OTP (background)
        m.reply(text)

        // Auto-poll OTP in background
        m.reply(`⏳ Menunggu OTP... (maks 2 menit)`)
        const otpResult = await api.waitForOtp(res.orderId)
        if (otpResult.success && otpResult.otp) {
          return m.reply(`📩 *OTP Masuk!*\n\nKode: *${otpResult.otp}*\nPengirim: ${otpResult.sms?.[0]?.from || '-'}\nPesan: ${otpResult.sms?.[0]?.text || '-'}`)
        } else {
          return m.reply(`⏰ Belum ada OTP. Cek manual:\n.ivasms otp ${res.orderId}`)
        }
      }

      case 'otp':
      case 'sms': {
        if (!param) return m.reply('Masukkan Order ID!\nContoh: .ivasms otp 12345')
        const otpRes = await api.getSms(param)
        if (!otpRes.success) return m.reply(`❌ Gagal: ${otpRes.error}`)
        if (!otpRes.sms?.length) return m.reply(`📭 Belum ada SMS untuk order ${param}`)

        let text = `📩 *SMS untuk Order ${param}*\n\n`
        for (const s of otpRes.sms) {
          text += `Dari: ${s.from}\nPesan: ${s.text}\nWaktu: ${s.date}\n\n`
        }
        if (otpRes.otp) text += `🔑 *OTP: ${otpRes.otp}*\n`
        return m.reply(text)
      }

      case 'wait':
      case 'tunggu': {
        if (!param) return m.reply('Masukkan Order ID!\nContoh: .ivasms wait 12345')
        await m.reply(`⏳ Menunggu OTP untuk order ${param}... (maks 2 menit)`)
        const waitRes = await api.waitForOtp(param)
        if (waitRes.success && waitRes.otp) {
          return m.reply(`📩 *OTP Masuk!*\n\nKode: *${waitRes.otp}*\nPengirim: ${waitRes.sms?.[0]?.from || '-'}\nPesan: ${waitRes.sms?.[0]?.text || '-'}`)
        }
        return m.reply(`⏰ Timeout! Belum ada OTP. Coba:\n.ivasms otp ${param}`)
      }

      case 'cancel':
      case 'batal': {
        if (!param) return m.reply('Masukkan Order ID!\nContoh: .ivasms cancel 12345')
        const cancelRes = await api.cancel(param)
        if (!cancelRes.success) return m.reply(`❌ Gagal: ${cancelRes.error}`)
        activeOrders.delete(param)
        return m.reply(`✅ Order ${param} dibatalkan`)
      }

      case 'orders':
      case 'list': {
        const listRes = await api.orders()
        if (!listRes.success) return m.reply(`❌ Gagal: ${listRes.error}`)
        if (!listRes.orders?.length) return m.reply('Belum ada pesanan')

        let text = `📋 *Daftar Pesanan*\n\n`
        for (const o of listRes.orders.slice(0, 10)) {
          text += `• ${o.id || o.order_id}: ${o.phone || o.number || '-'} (${o.status || '-'})\n`
        }
        return m.reply(text)
      }

      default:
        m.reply(`Subcommand tidak dikenal: ${sub}\n\nGunakan: balance, search, buy, otp, wait, cancel, orders`)
    }
  }
})
