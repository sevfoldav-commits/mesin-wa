import { command } from '../../utils/command-builder.js'
import { sendList } from '../../lib/interactive.js'

export default command({
  name: 'listmenu',
  aliases: ['lmenu'],
  type: 'main',
  desc: 'Send interactive list message',
  execute: async ({ hisoka, m }) => {
    await sendList(hisoka, m.from, {
      text: '📋 Pilih menu dibawah ini:',
      footer: 'Hisoka-Morou',
      title: 'Main Menu',
      buttonText: 'Lihat Menu',
      sections: [
        {
          title: '📁 Download',
          rows: [
            { title: 'YouTube Audio', rowId: 'yta', description: 'Download audio YouTube' },
            { title: 'YouTube Video', rowId: 'ytv', description: 'Download video YouTube' },
            { title: 'TikTok', rowId: 'tiktok', description: 'Download TikTok tanpa watermark' }
          ]
        },
        {
          title: '🛠 Tools',
          rows: [
            { title: 'Sticker', rowId: 'sticker', description: 'Buat sticker dari gambar/video' },
            { title: 'Carbon', rowId: 'carbon', description: 'Buat code screenshot' },
            { title: 'Gempa BMKG', rowId: 'bmkg', description: 'Info gempa terbaru' }
          ]
        },
        {
          title: '👥 Group',
          rows: [
            { title: 'Tag All', rowId: 'tagall', description: 'Tag semua anggota grup' },
            { title: 'Add', rowId: 'add', description: 'Tambah anggota grup' },
            { title: 'Kick', rowId: 'kick', description: 'Keluarkan anggota grup' }
          ]
        }
      ]
    }, m)
  }
})
