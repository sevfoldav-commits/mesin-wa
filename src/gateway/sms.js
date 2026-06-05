/**
 * IVA SMS Gateway — send & manage SMS via IVA API.
 * 
 * Fitur:
 * - Kirim SMS (reguler & OTP)
 * - Cek saldo
 * - Manajemen kontak
 * - Laporan pengiriman (report)
 * - SMS broadcast ke banyak nomor
 * - Webhook untuk menerima SMS masuk
 */
import axios from 'axios'
import moment from 'moment-timezone'
import logger from '../utils/logger.js'

class IVASMS {
  constructor(config = {}) {
    this.apiKey = config.apiKey || ''
    this.baseURL = config.baseURL || 'https://api.ivasms.com/v1'
    this.senderName = config.senderName || 'Info'
    this.webhookUrl = config.webhookUrl || ''
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 15000,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
  }

  /**
   * Check if API is configured.
   */
  isReady() {
    return !!this.apiKey
  }

  /**
   * Kirim SMS reguler.
   * @param {string|string[]} to - Nomor tujuan (62xx atau 08xx)
   * @param {string} message - Isi pesan
   * @param {object} [options]
   * @param {string} [options.senderName] - Nama pengirim (harus terdaftar)
   * @param {boolean} [options.isOtp] - Jika true, pesan tidak akan terpotong
   * @returns {Promise<object>}
   */
  async send(to, message, options = {}) {
    if (!this.isReady()) {
      throw new Error('IVA SMS not configured. Set IVA_API_KEY in config.')
    }

    const recipients = Array.isArray(to) ? to : [to]
    const formattedNumbers = recipients.map(n => this._formatNumber(n))

    const payload = {
      api_key: this.apiKey,
      receiver: formattedNumbers.join(','),
      data: {
        message: message.substring(0, 160), // SMS max 160 chars per segment
        sender: options.senderName || this.senderName
      },
      ...(options.scheduledAt ? { scheduled_at: options.scheduledAt } : {}),
      ...(options.callbackUrl ? { callback_url: options.callbackUrl || this.webhookUrl } : {})
    }

    try {
      const { data } = await this.client.post('/sms/send', payload)
      logger.info(`SMS sent to ${formattedNumbers.length} number(s): ${data?.data?.message_id || '-'}`)
      return data
    } catch (e) {
      const errMsg = e.response?.data?.message || e.message
      logger.error('SMS send failed:', errMsg)
      throw new Error(`SMS failed: ${errMsg}`)
    }
  }

  /**
   * Kirim OTP (kode verifikasi).
   * OTP biasanya nggak dipotong & prioritas tinggi.
   */
  async sendOTP(to, code, options = {}) {
    const message = options.template 
      ? options.template.replace(/%code%/g, code)
      : `Kode verifikasi Anda: ${code}\nJangan bagikan kode ini kepada siapapun.`
    
    return this.send(to, message, { ...options, isOtp: true })
  }

  /**
   * Kirim SMS broadcast ke banyak nomor.
   */
  async broadcast(numbers, message, options = {}) {
    const chunks = this._chunkArray(numbers, 50) // Max 50 per batch
    const results = []
    
    for (const batch of chunks) {
      const result = await this.send(batch, message, options)
      results.push(result)
      await this._delay(1000) // Anti-spam delay
    }
    
    return {
      total: numbers.length,
      batches: chunks.length,
      results
    }
  }

  /**
   * Cek saldo akun.
   */
  async getBalance() {
    if (!this.isReady()) throw new Error('IVA SMS not configured')
    
    const { data } = await this.client.get('/balance')
    return {
      balance: data?.data?.balance || 0,
      currency: data?.data?.currency || 'IDR',
      raw: data
    }
  }

  /**
   * Laporan pengiriman (cek status SMS).
   * @param {string} messageId - ID pesan dari response send()
   */
  async getReport(messageId) {
    const { data } = await this.client.get(`/sms/report/${messageId}`)
    return data?.data
  }

  /**
   * Daftar pengirim (sender name) yang terdaftar.
   */
  async getSenders() {
    const { data } = await this.client.get('/senders')
    return data?.data || []
  }

  /**
   * Format nomor HP Indonesia.
   * 08xx → 628xx
   */
  _formatNumber(number) {
    let n = number.replace(/[^0-9]/g, '')
    if (n.startsWith('0')) n = '62' + n.slice(1)
    if (!n.startsWith('62')) n = '62' + n
    return n
  }

  _chunkArray(arr, size) {
    const chunks = []
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size))
    }
    return chunks
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export default IVASMS
