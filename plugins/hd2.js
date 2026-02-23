import newsletter from '../Bridge/newsletter.js'
import { upload, get } from '../lib/hd.js'
import fs from 'fs'
import path from 'path'
import { randomBytes } from 'crypto'

export default {
    command: ['hd2', 'enhance'],
    category: 'convert',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        let buffer = null
        
        if (m.quoted && (m.quoted.message?.imageMessage || m.quoted.message?.videoMessage)) {
            buffer = await m.quoted.download()
        } else if (m.message?.imageMessage || m.message?.videoMessage) {
            buffer = await m.download()
        }
        
        if (!buffer) {
            return newsletter.sendText(sock, m.chat, 
                '*HD ENHANCE*\n\nPlease reply to an image with .hd2', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, '*HD ENHANCE*\n\nProcessing image... This may take up to 1 minute', m)
        
        const tempDir = path.join(process.cwd(), 'temp')
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })
        
        const tempFile = path.join(tempDir, `hd2_${randomBytes(4).toString('hex')}.jpg`)
        
        try {
            fs.writeFileSync(tempFile, buffer)
            
            const codes = await upload(tempFile)
            const code = codes.code
            
            await new Promise(r => setTimeout(r, 5000))
            
            let result = await get(code)
            let attempts = 0
            
            while (result.status === 'waiting' && attempts < 30) {
                await new Promise(r => setTimeout(r, 3000))
                result = await get(code)
                attempts++
            }
            
            if (!result || !result.downloadUrls || !result.downloadUrls[0]) {
                throw new Error('Failed to process image')
            }
            
            const response = await axios.get(result.downloadUrls[0], { responseType: 'arraybuffer' })
            const enhancedBuffer = Buffer.from(response.data)
            
            await newsletter.sendImage(sock, m.chat, enhancedBuffer, '*HD ENHANCE*\n\nImage enhanced successfully!', m)
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        } finally {
            if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile)
        }
    }
}