import newsletter from '../Bridge/newsletter.js'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import { randomBytes } from 'crypto'

const execAsync = promisify(exec)

export default {
    command: ['echo'],
    category: 'convert',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        let buffer = null
        let ext = 'mp3'
        
        if (m.quoted && (m.quoted.message?.audioMessage || m.quoted.message?.videoMessage)) {
            buffer = await m.quoted.download()
            ext = m.quoted.message?.videoMessage ? 'mp4' : 'mp3'
        } else if (m.message?.audioMessage || m.message?.videoMessage) {
            buffer = await m.download()
            ext = m.message?.videoMessage ? 'mp4' : 'mp3'
        }
        
        if (!buffer) {
            return newsletter.sendText(sock, m.chat, 
                '*ECHO*\n\nPlease reply to an audio/video with .echo', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, '*ECHO*\n\nProcessing audio...', m)
        
        const tempDir = path.join(process.cwd(), 'temp')
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })
        
        const inputPath = path.join(tempDir, `echo_in_${randomBytes(4).toString('hex')}.${ext}`)
        const outputPath = path.join(tempDir, `echo_out_${randomBytes(4).toString('hex')}.mp3`)
        
        try {
            fs.writeFileSync(inputPath, buffer)
            
            await execAsync(`ffmpeg -y -i "${inputPath}" -af "aecho=0.8:0.88:60:0.4" -vn "${outputPath}"`)
            
            const resultBuffer = fs.readFileSync(outputPath)
            
            await newsletter.sendAudio(sock, m.chat, resultBuffer, false, m)
            
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