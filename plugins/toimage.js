import newsletter from '../Bridge/newsletter.js'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import { randomBytes } from 'crypto'

const execAsync = promisify(exec)

export default {
    command: ['toimage', 'toimg'],
    category: 'sticker',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        let buffer = null
        
        if (m.quoted && m.quoted.message?.stickerMessage) {
            buffer = await m.quoted.download()
        } else if (m.message?.stickerMessage) {
            buffer = await m.download()
        }
        
        if (!buffer) {
            return newsletter.sendText(sock, m.chat, 
                '*TO IMAGE*\n\nPlease reply to a sticker with .toimage', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, '*TO IMAGE*\n\nConverting sticker to image...', m)
        
        const tempDir = path.join(process.cwd(), 'temp')
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })
        
        const inputPath = path.join(tempDir, `toimg_in_${randomBytes(4).toString('hex')}.webp`)
        const outputPath = path.join(tempDir, `toimg_out_${randomBytes(4).toString('hex')}.png`)
        
        try {
            fs.writeFileSync(inputPath, buffer)
            
            await execAsync(`ffmpeg -y -i "${inputPath}" -vframes 1 "${outputPath}"`)
            
            const imageBuffer = fs.readFileSync(outputPath)
            
            await newsletter.sendImage(sock, m.chat, imageBuffer, '', m)
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        } finally {
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath)
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath)
        }
    }
}