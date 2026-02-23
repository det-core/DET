import newsletter from '../Bridge/newsletter.js'
import videoenhancer from '../lib/hdvid.js'
import fs from 'fs'
import path from 'path'
import { randomBytes } from 'crypto'

export default {
    command: ['videoenhancer', 'enhancevideo'],
    category: 'convert',
    owner: false,
    admin: false,
    reseller: true,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        let buffer = null
        let videoPath = null
        
        if (m.quoted && m.quoted.message?.videoMessage) {
            buffer = await m.quoted.download()
        } else if (m.message?.videoMessage) {
            buffer = await m.download()
        }
        
        if (!buffer) {
            return newsletter.sendText(sock, m.chat, 
                '*VIDEO ENHANCER*\n\nPlease reply to a video with .videoenhancer', m
            )
        }
        
        const resolution = args[0] || '4k'
        const validResolutions = ['2k', '4k', '8k']
        
        if (!validResolutions.includes(resolution)) {
            return newsletter.sendText(sock, m.chat, 
                '*KNOX INFO*\n\nInvalid resolution. Use: 2k, 4k, 8k', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, '*VIDEO ENHANCER*\n\nProcessing video... This may take several minutes', m)
        
        const tempDir = path.join(process.cwd(), 'temp')
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })
        
        videoPath = path.join(tempDir, `enhance_${randomBytes(4).toString('hex')}.mp4`)
        fs.writeFileSync(videoPath, buffer)
        
        try {
            const result = await videoenhancer(videoPath, resolution)
            
            if (!result || !result.output_url) {
                throw new Error('Failed to enhance video')
            }
            
            const response = await axios.get(result.output_url, { 
                responseType: 'arraybuffer',
                timeout: 300000
            })
            const enhancedBuffer = Buffer.from(response.data)
            
            await newsletter.sendVideo(sock, m.chat, enhancedBuffer, 
                `*VIDEO ENHANCER*\n\nResolution: ${resolution}\nJob ID: ${result.job_id}`, 
                m
            )
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        } finally {
            if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath)
        }
    }
}