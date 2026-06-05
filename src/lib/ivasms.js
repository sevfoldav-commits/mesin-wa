/**
 * IVASMS API module — SMS virtual untuk verifikasi OTP
 * Website: https://ivasms.com
 */
import axios from 'axios'
import config from '../../config.js'
import logger from '../utils/logger.js'

const BASE_URL = 'https://api.ivasms.com/api/v1'

class IVASMS {
  constructor(apiKey) {
    this.apiKey = apiKey || config.APIs?.ivasms?.Key || ''
    this.client = axios.create({
      baseURL: BASE_URL,
      params: { api_key: this.apiKey }
    })
  }

  /**
   * Check balance
   * @returns {{ status, saldo }}
   */
  async balance() {
    try {
      const { data } = await this.client.get('/balance')
      return {
        success: true,
        balance: data?.saldo || data?.balance || 0,
        raw: data
      }
    } catch (e) {
      return { success: false, error: e.response?.data?.message || e.message }
    }
  }

  /**
   * Search available numbers
   * @param {object} opts
   * @param {string} opts.country - Country code (e.g. 'id' for Indonesia)
   * @param {string} opts.service - Service (e.g. 'whatsapp')
   * @param {string} opts.operator - Operator (e.g. 'telkomsel', 'xl')
   * @returns {{ success, data }}
   */
  async search(opts = {}) {
    const { country = 'id', service = 'whatsapp', operator = '' } = opts
    try {
      const { data } = await this.client.get('/order', {
        params: { country, service, operator: operator || undefined }
      })
      return {
        success: true,
        data: data?.data || data?.orders || data,
        raw: data
      }
    } catch (e) {
      return { success: false, error: e.response?.data?.message || e.message }
    }
  }

  /**
   * Buy a number
   * @param {object} opts
   * @param {string} opts.service - Service (whatsapp, google, etc)
   * @param {string} opts.country - Country code
   * @param {string} opts.operator - Operator
   * @returns {{ success, orderId, phoneNumber }}
   */
  async buy(opts = {}) {
    const { service = 'whatsapp', country = 'id', operator = '' } = opts
    try {
      const { data } = await this.client.post('/order', {
        service,
        country,
        operator: operator || undefined
      })
      return {
        success: true,
        orderId: data?.order_id || data?.id || data?.data?.id,
        phoneNumber: data?.phone || data?.number || data?.data?.phone,
        raw: data
      }
    } catch (e) {
      return { success: false, error: e.response?.data?.message || e.message }
    }
  }

  /**
   * Get SMS/OTP for an order
   * @param {string} orderId - Order ID
   * @returns {{ success, sms: [{from, text, date}], otp }}
   */
  async getSms(orderId) {
    if (!orderId) return { success: false, error: 'Order ID required' }
    try {
      const { data } = await this.client.get('/sms', {
        params: { order_id: orderId }
      })
      // Parse SMS list & extract OTP
      const smsList = data?.data?.sms || data?.sms || []
      const sms = smsList.map((s) => ({
        from: s.from || s.sender || '',
        text: s.text || s.message || '',
        date: s.date || s.created_at || ''
      }))
      // Try to find OTP (6 digit code)
      const otpMatch = sms.find((s) => {
        const match = s.text.match(/\b(\d{4,8})\b/)
        return match
      })
      const otp = otpMatch ? otpMatch.text.match(/\b(\d{4,8})\b/)[1] : null

      return { success: true, sms, otp, raw: data }
    } catch (e) {
      return { success: false, error: e.response?.data?.message || e.message }
    }
  }

  /**
   * Cancel an order
   * @param {string} orderId - Order ID
   * @returns {{ success }}
   */
  async cancel(orderId) {
    if (!orderId) return { success: false, error: 'Order ID required' }
    try {
      const { data } = await this.client.post('/order/cancel', {
        order_id: orderId
      })
      return { success: true, raw: data }
    } catch (e) {
      return { success: false, error: e.response?.data?.message || e.message }
    }
  }

  /**
   * Get list of orders
   * @returns {{ success, orders }}
   */
  async orders() {
    try {
      const { data } = await this.client.get('/order/list')
      return {
        success: true,
        orders: data?.data?.orders || data?.orders || [],
        raw: data
      }
    } catch (e) {
      return { success: false, error: e.response?.data?.message || e.message }
    }
  }

  /**
   * Wait for OTP (poll every 5s, max 2 minutes)
   * @param {string} orderId
   * @returns {{ success, otp, sms }}
   */
  async waitForOtp(orderId, timeoutMs = 120000) {
    const start = Date.now()
    while (Date.now() - start < timeoutMs) {
      const result = await this.getSms(orderId)
      if (result.success && result.otp) {
        return result
      }
      await new Promise((r) => setTimeout(r, 5000))
    }
    return { success: false, error: 'Timeout menunggu OTP', sms: [] }
  }
}

export default IVASMS
