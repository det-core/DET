import newsletter from '../Bridge/newsletter.js'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import { randomBytes } from 'crypto'

const execAsync = promisify(exec)

export default {
    command: ['tovideo', 'tovid', 'tomp4'],
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
                '*TO VIDEO*\n\nPlease reply to an animated sticker with .tovideo', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, '*TO VIDEO*\n\nConverting sticker to video...', m)
        
        const tempDir = path.join(process.cwd(), 'temp')
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })
        
        const inputPath = path.join(tempDir, `tovid_in_${randomBytes(4).toString('hex')}.webp`)
        const outputPath = path.join(tempDir, `tovid_out_${randomBytes(4).toString('hex')}.mp4`)
        
        try {
            fs.writeFileSync(inputPath, buffer)
            
            await execAsync(`ffmpeg -y -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=10" -c:v libx264 -pix_fmt yuv420p -t 10 "${outputPath}"`)
            
            const videoBuffer = fs.readFileSync(outputPath)
            
            await newsletter.sendVideo(sock, m.chat, videoBuffer, '', m)
            
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