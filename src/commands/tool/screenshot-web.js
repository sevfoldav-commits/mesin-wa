import playwright from 'playwright-chromium'
import { command } from '../../utils/command-builder.js'

export default command({
  name: 'ssweb',
  aliases: ['screenshotweb', 'screenshot'],
  type: 'tool',
  desc: 'Screenshot website\nExample: %prefix%command https://google.com',
  example: 'No Urls!?\n\nExample %prefix%command https://google.com',
  execute: async ({ hisoka, m }) => {
    const url = Func.isUrl(m.text)[0]
    if (!url) return m.reply('Masukkan URL!')

    await m.reply('⏱ Membuka halaman...')

    try {
      const browser = await getBrowser()
      const page = await browser.newPage()
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })

      if (/full/i.test(m.text)) {
        await page.waitForTimeout(5000)
      }

      const media = await page.screenshot({
        fullPage: /full/i.test(m.text.toLowerCase())
      })

      await hisoka.sendMessage(m.from, { image: media, caption: `🖼 *${url}*` }, { quoted: m })
      await page.close()
      await browser.close()
    } catch (e) {
      m.reply(`❌ Error: ${e.message}`)
    }
  }
})

async function getBrowser(opts = {}) {
  const chrome = {
    headless: true,
    args: [
      '--no-sandbox',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-setuid-sandbox',
      '--disable-accelerated-2d-canvas',
      '--disable-session-crashed-bubble',
      '--start-maximied'
    ],
    ...opts
  }
  return await playwright.chromium.launch(chrome)
}
