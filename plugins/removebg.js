import newsletter from '../Bridge/newsletter.js'
import removebg from '../lib/removebackground.js'
import fs from 'fs'
import path from 'path'
import { randomBytes } from 'crypto'
import axios from 'axios'

export default {
    command: ['removebg', 'nobg'],
    category: 'convert',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        let buffer = null
        
        if (m.quoted && m.quoted.message?.imageMessage) {
            buffer = await m.quoted.download()
        } else if (m.message?.imageMessage) {
            buffer = await m.download()
        }
        
        if (!buffer) {
            return newsletter.sendText(sock, m.chat, 
                '*REMOVE BACKGROUND*\n\nPlease reply to an image with .removebg', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, '*REMOVE BACKGROUND*\n\nProcessing image...', m)
        
        const tempDir = path.join(process.cwd(), 'temp')
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })
        
        const tempFile = path.join(tempDir, `removebg_${randomBytes(4).toString('hex')}.jpg`)
        
        try {
            fs.writeFileSync(tempFile, buffer)
            
            const resultUrl = await removebg(tempFile)
            
            if (resultUrl.status === 'eror') {
                throw new Error(resultUrl.msg)
            }
            
            const response = await axios.get(resultUrl, { responseType: 'arraybuffer' })
            const processedBuffer = Buffer.from(response.data)
            
            await newsletter.sendImage(sock, m.chat, processedBuffer, '*REMOVE BACKGROUND*\n\nBackground removed successfully!', m)
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        } finally {
            if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile)
        }
    }
}