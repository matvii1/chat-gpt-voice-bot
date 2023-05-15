import installer from '@ffmpeg-installer/ffmpeg'
import axios from 'axios'
import ffmpeg from 'fluent-ffmpeg'
import { createWriteStream } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

class OggConverter {
  constructor() {
    ffmpeg.setFfmpegPath(installer.path)
  }

  toMp3(input, output) {
    try {
      const outputPath = resolve(dirname(input), `${output}.mp3`)

      return new Promise((resolve, reject) => {
        ffmpeg(input)
          .inputOption('-t 30')
          .output(outputPath)
          .on('end', () => {
            resolve(outputPath)
          })
          .on('error', (err) => reject(err.message))
          .run()
      })
    } catch (error) {}
  }

  async create(url, fileName) {
    try {
      const oggPath = resolve(__dirname, '../voices/', `${fileName}.ogg`)
      const res = await axios({
        method: 'get',
        url,
        responseType: 'stream',
      })

      return new Promise((resolve) => {
        const stream = createWriteStream(oggPath)
        res.data.pipe(stream)
        stream.on('finish', () => resolve(oggPath))
      })
    } catch (error) {}
  }
}

export const ogg = new OggConverter()
