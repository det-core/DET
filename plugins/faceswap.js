import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'
import path from 'path'
import { randomBytes } from 'crypto'

const faceswapSessions = new Map()

export default {
    command: ['faceswap', 'swapface'],
    category: 'convert',
    owner: false,
    admin: false,
    reseller: true,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const session = faceswapSessions.get(m.sender)
        let imageBuffer = null
        
        if (m.quoted && m.quoted.message?.imageMessage) {
            imageBuffer = await m.quoted.download()
        } else if (m.message?.imageMessage) {
            imageBuffer = await m.download()
        }
        
        if (!session && !imageBuffer) {
            const helpMsg = `*FACESWAP*

┏⧉ *Usage*
┣𖣠 1. Send first image (source face)
┣𖣠 2. Send second image (target)
┗━━━━━━━━━

Step 1: Send image + caption .faceswap`
            return newsletter.sendText(sock, m.chat, helpMsg, m)
        }
        
        if (!session && imageBuffer) {
            // Step 1: Save source image
            const tempDir = path.join(process.cwd(), 'temp')
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })
            
            const tempFile = path.join(tempDir, `source_${randomBytes(4).toString('hex')}.jpg`)
            fs.writeFileSync(tempFile, imageBuffer)
            
            const form = new FormData()
            form.append('file', fs.createReadStream(tempFile))
            
            const uploadRes = await axios.post('https://tmpfiles.org/api/v1/upload', form, {
                headers: form.getHeaders()
            })
            
            const imageUrl = uploadRes.data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/')
            
            faceswapSessions.set(m.sender, {
                sourceUrl: imageUrl,
                timestamp: Date.now()
            })
            
            setTimeout(() => faceswapSessions.delete(m.sender), 300000)
            
            fs.unlinkSync(tempFile)
            
            return newsletter.sendText(sock, m.chat, 
                '*FACESWAP*\n\n✓ Source image saved!\nNow send the target image with .faceswap', m
            )
        }
        
        if (session && imageBuffer) {
            // Step 2: Process with target image
            await newsletter.sendText(sock, m.chat, '*FACESWAP*\n\nProcessing... This may take a moment', m)
            
            const tempDir = path.join(process.cwd(), 'temp')
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })
            
            const tempFile = path.join(tempDir, `target_${randomBytes(4).toString('hex')}.jpg`)
            fs.writeFileSync(tempFile, imageBuffer)
            
            try {
                const form = new FormData()
                form.append('file', fs.createReadStream(tempFile))
                
                const uploadRes = await axios.post('https://tmpfiles.org/api/v1/upload', form, {
                    headers: form.getHeaders()
                })
                
                const targetUrl = uploadRes.data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/')
                
                const { data } = await axios.get(
                    `https://api.neoxr.eu/api/faceswap?source=${encodeURIComponent(session.sourceUrl)}&target=${encodeURIComponent(targetUrl)}&apikey=Milik-Bot-OurinMD`,
                    { timeout: 120000 }
                )
                
                faceswapSessions.delete(m.sender)
                
                if (!data?.status || !data?.data?.url) {
                    throw new Error('Failed to swap faces')
                }
                
                const response = await axios.get(data.data.url, { responseType: 'arraybuffer' })
                const resultBuffer = Buffer.from(response.data)
                
                await newsletter.sendImage(sock, m.chat, resultBuffer, '*FACESWAP*\n\nFace swap completed!', m)
                
            } catch (error) {
                faceswapSessions.delete(m.sender)
                await newsletter.sendText(sock, m.chat, 
                    `*KNOX INFO*\n\nError: ${error.message}`, m
                )
            } finally {
                if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile)
            }
        }
    }
}