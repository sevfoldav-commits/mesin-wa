import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers
} from '@whiskeysockets/baileys'
import pino from 'pino'
import path from 'path'
import { createInterface } from 'readline'
import config from './config.js'
import IVASMS from './src/lib/ivasms.js'

const rl = createInterface({ input: process.stdin, output: process.stdout })
const ask = (q) => new Promise((r) => rl.question(r, q))
const SESSION_DIR = path.join(process.cwd(), 'sessions')

async function getVersion() {
  try {
    const result = await Promise.race([
      fetchLatestBaileysVersion(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
    ])
    return result
  } catch {
    return { version: [6, 7, 0], isLatest: false }
  }
}

async function main() {
  const args = process.argv.slice(2)

  if (args.includes('--pair')) {
    const phone = args[args.indexOf('--pair') + 1]
    if (phone) await doPairing(phone)
    else await showGuide()
  } else if (args.includes('--buy')) {
    await buyAndOtp(args)
  } else {
    await showGuide()
  }

  rl.close()
  setTimeout(() => process.exit(0), 1000)
}

async function showGuide() {
  console.log(`
╔══════════════════════════════════════════════════╗
║     CARA DAFTAR WA BARU + LINK KE BOT            ║
╚══════════════════════════════════════════════════╝

📱 LANGKAH 1 (Opsional): BELI NOMOR
   node register-wa.js --buy id
   → Dapat nomor + OTP dari IVASMS

📱 LANGKAH 2: DAFTAR WA
   Install WA di HP/emulator → daftar pake nomor
   Kalau pake IVASMS, ambil OTP dari dashboard

📱 LANGKAH 3: LINK KE BOT (Pairing Code)
   node register-wa.js --pair 62812xxxx
   → Dapat kode 8 digit
   → HP: ⋮ (3 titik) → Perangkat tertaut
   → Ketuk kode 8 digit
   → Masukkan kode → Bot tersambung ✅
`)
  process.exit(0)
}

async function doPairing(phone) {
  phone = phone.replace(/[^0-9]/g, '')
  if (phone.startsWith('0')) phone = '62' + phone.slice(1)
  if (!phone.startsWith('62')) phone = '62' + phone

  console.log(`\n🔗 Generating pairing code untuk +${phone}...`)
  console.log('⏳ Menghubungi server WhatsApp...')

  const sessionPath = path.join(SESSION_DIR, phone)
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
  const { version } = await getVersion()

  let codeSent = false
  let timeout = setTimeout(() => {
    if (!codeSent) {
      console.log('\n⏰ Timeout. Coba lagi nanti atau periksa koneksi internet.')
      process.exit(1)
    }
  }, 25000)

  const sock = makeWASocket({
    version,
    browser: Browsers.windows('Hisoka'),
    auth: state,
    logger: pino({ level: 'silent' }),
    markOnlineOnConnect: false,
    syncFullHistory: false,
    generateHighQualityLinkPreview: false
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update

    if (connection === 'open' && !codeSent) {
      codeSent = true
      clearTimeout(timeout)

      try {
        const code = await sock.requestPairingCode(phone)
        const formattedCode = code.match(/.{1,4}/g)?.join(' ') || code

        console.log(`\n═══════════════════════════════════════`)
        console.log(`   ✅ PAIRING CODE: ${formattedCode} ✅`)
        console.log(`═══════════════════════════════════════`)
        console.log(`
📱 Cara pakai:
   1. Buka WhatsApp di HP
   2. Tap ⋮ (3 titik) → Perangkat tertaut
   3. Tap "Ketuk kode 8 digit" 
   4. Masukkan: ${formattedCode}
   5. Selesai! 🎉

📁 Session disimpan di: ${sessionPath}
`)
      } catch (e) {
        console.log(`\n❌ Gagal generate pairing code: ${e.message}`)
      }
      process.exit(0)
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode
      console.log(`\n❌ Koneksi tertutup (${statusCode}). Coba lagi.`)
      if (!codeSent) process.exit(1)
    }
  })
}

async function buyAndOtp(args) {
  const ivasms = new IVASMS()
  const bal = await ivasms.balance()

  if (!bal.success) {
    console.log('❌ Gagal cek saldo:', bal.error)
    return
  }

  console.log(`💰 Saldo: Rp ${bal.balance?.toLocaleString?.('id-ID') || bal.balance || 0}`)

  const country = args[args.indexOf('--buy') + 1] || 'id'
  console.log(`\n📱 Membeli nomor ${country.toUpperCase()}...`)

  const buy = await ivasms.buy({ country, service: 'whatsapp' })
  if (!buy.success) {
    console.log('❌ Gagal beli nomor:', buy.error)
    return
  }

  console.log(`✅ Nomor: ${buy.phoneNumber}`)
  console.log(`🆔 Order ID: ${buy.orderId}`)
  console.log(`\n📌 Daftarkan nomor ${buy.phoneNumber} di WhatsApp HP/emulator`)
  console.log(`📌 Lalu ambil OTP dengan:\n   node register-wa.js --otp ${buy.orderId}\n`)

  process.stdout.write('⏳ Auto-wait OTP')
  for (let i = 0; i < 24; i++) {
    await new Promise((r) => setTimeout(r, 5000))
    const otp = await ivasms.getSms(buy.orderId)
    if (otp.success && otp.otp) {
      console.log(`\n\n✅✅✅ OTP: ${otp.otp} ✅✅✅`)
      console.log(`📱 Masukkan ke WA. Lalu link bot:\n   node register-wa.js --pair ${buy.phoneNumber}`)
      return
    }
    process.stdout.write('.')
  }
  console.log('\n⏰ Timeout. Cek manual: node register-wa.js --otp ' + buy.orderId)
  process.exit(0)
}

main()
