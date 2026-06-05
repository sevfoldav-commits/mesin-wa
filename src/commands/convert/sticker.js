import sharp from 'sharp'
import axios from 'axios'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import { command } from '../../utils/command-builder.js'

export default command({
  name: 'sticker',
  aliases: ['s', 'stiker'],
  type: 'convert',
  desc: 'Convert Image, Gif, Video, and Url media to Sticker\n\nWith Options?\n1. --circle\n2. --round\n3. --gray\n3. --negate\n4. --pixel\n5. --flip\n6. --flop\n7. --rotate\n8. --nobg\n\nExample :\n1. --circle : %prefix%command --circle\n2. --rotate : %prefix%command --rotate=20 (max 360)',
  isMedia: { Image: true, Video: true, Sticker: true },
  execute: async ({ hisoka, m, quoted, config }) => {
    await m.reply('⏱')

    if (!quoted.message) return m.reply('Reply ke media yang ingin dijadikan sticker')

    // Download quoted media using Baileys downloadContentFromMessage
    const msgType = Object.keys(quoted.message).find(
      (t) => t.includes('Message') && t !== 'messageContextInfo'
    )
    if (!msgType) return m.reply('Tidak dapat mendownload media')

    const stream = await downloadContentFromMessage(
      quoted.message[msgType],
      msgType.replace('Message', '')
    )
    const chunks = []
    for await (const chunk of stream) chunks.push(chunk)
    const download = Buffer.concat(chunks)

    let media, exif = {}
    const text = m.text.toLowerCase()

    if (text.endsWith('circle')) {
      media = await crop(download, 'circle')
    } else if (text.endsWith('round')) {
      media = await crop(download, 'rounded')
    } else if (text.endsWith('gray')) {
      media = await processImage(download, 'grayscale')
    } else if (text.endsWith('negate')) {
      media = await processImage(download, 'negate')
    } else if (text.endsWith('pixel')) {
      media = await processImage(download, 'pixelate')
    } else if (text.endsWith('flip')) {
      media = await rotateImg(download, 'flip')
    } else if (text.endsWith('flop')) {
      media = await rotateImg(download, 'flop')
    } else if (text.endsWith('nobg')) {
      media = await removeBG(download)
    } else if (/rotate=/.test(text)) {
      const deg = text.split('rotate=')[1]
      if (isNaN(deg) || !Number(deg)) return m.reply('Value harus berupa angka')
      exif = { packName: config.Exif.packName }
      media = await rotateImg(download, Number(deg))
    } else {
      const [packname, author] = m.text.split('|')
      exif = {
        packName: packname || config.Exif.packName,
        packPublish: author || config.Exif.packPublish
      }
      media = download
    }

    await hisoka.sendMessage(m.from, { sticker: media }, { quoted: m, ...exif })
  }
})

function crop(input, type = 'circle') {
  return new Promise(async (resolve, reject) => {
    sharp(input)
      .toFormat('webp')
      .resize(512, 512)
      .composite([
        {
          input:
            type === 'circle'
              ? Buffer.from(
                  '<svg height="485" width="485"><circle cx="242.5" cy="242.5" r="242.5" fill="#3a4458"/></svg>'
                )
              : type === 'rounded'
                ? Buffer.from(
                    '<svg><rect x="0" y="0" width="450" height="450" rx="50" ry="50"/></svg>'
                  )
                : false,
          blend: 'dest-in',
          cutout: true
        }
      ])
      .toBuffer()
      .then(resolve)
      .catch(reject)
  })
}

async function processImage(input, type = 'pixelate') {
  input =
    type === 'pixelate'
      ? await sharp(input).resize(20, null, { kernel: 'nearest' }).toBuffer()
      : input

  return new Promise(async (resolve, reject) => {
    sharp(input)
      .negate(type === 'negate')
      .greyscale(type === 'grayscale')
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toColourspace(Func.random(['b-w', 'b-w', 'cmyk', 'srgb']))
      .toFormat('webp')
      .toBuffer()
      .then(resolve)
      .catch(reject)
  })
}

function rotateImg(input, type = 'flip') {
  return new Promise(async (resolve, reject) => {
    if (!isNaN(type) && type > 360) reject('max degress is 360')
    sharp(input)
      .flip(type === 'flip')
      .flop(type === 'flop')
      .rotate(/fl(o|i)p/i.test(type) ? 0 : parseInt(type))
      .toFormat('webp')
      .toBuffer()
      .then(resolve)
      .catch(reject)
  })
}

function removeBG(buffer) {
  return new Promise(async (resolve, reject) => {
    const file = await Func.getFile(buffer)
    const { data } = await axios.post(
      'https://bgremover.zyro.com/v1/ai/background-remover',
      { image_data: `data:image/jpeg;base64,${file.data.toString('base64')}` }
    )
    resolve(Buffer.from(data.result.split(',')[1], 'base64'))
  })
}
