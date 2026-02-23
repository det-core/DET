import newsletter from '../Bridge/newsletter.js'
import imgtoprompt from '../lib/img2prompt.js'
import fs from 'fs'
import path from 'path'
import { randomBytes } from 'crypto'

export default {
    command: ['img2prompt'],
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
                '*IMAGE TO PROMPT*\n\nPlease reply to an image with .img2prompt', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, '*IMAGE TO PROMPT*\n\nAnalyzing image...', m)
        
        const tempDir = path.join(process.cwd(), 'temp')
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })
        
        const tempFile = path.join(tempDir, `img2prompt_${randomBytes(4).toString('hex')}.jpg`)
        
        try {
            fs.writeFileSync(tempFile, buffer)
            
            const result = await imgtoprompt(tempFile)
            
            if (result.status === 'eror') {
                throw new Error(result.msg)
            }
            
            const resultText = `*IMAGE TO PROMPT RESULT*

Prompt: ${result.prompt}

Generated: ${result.generatedAt || new Date().toLocaleString()}`

            await newsletter.sendText(sock, m.chat, resultText, m)
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        } finally {
            if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile)
        }
    }
}