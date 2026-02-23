import newsletter from '../Bridge/newsletter.js'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import { randomBytes } from 'crypto'
import webp from '../lib/webp.js'
import exif from '../lib/exif.js'

const execAsync = promisify(exec)

export default {
    command: ['sticker', 's', 'stiker'],
    category: 'sticker',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        let buffer = null
        let isVideo = false
        let isAnimated = false
        
        // Check for quoted media
        if (m.quoted) {
            if (m.quoted.message?.imageMessage) {
                buffer = await m.quoted.download()
                isVideo = false
            } else if (m.quoted.message?.videoMessage) {
                buffer = await m.quoted.download()
                isVideo = true
                // Check video duration (max 10 seconds for animated sticker)
                const duration = m.quoted.message.videoMessage.seconds || 0
                if (duration > 10) {
                    return newsletter.sendText(sock, m.chat, 
                        '*STICKER*\n\nVideo too long. Maximum 10 seconds for animated sticker.', m
                    )
                }
                isAnimated = true
            }
        } else if (m.message?.imageMessage || m.message?.videoMessage) {
            if (m.message?.imageMessage) {
                buffer = await m.download()
                isVideo = false
            } else {
                buffer = await m.download()
                isVideo = true
                const duration = m.message.videoMessage.seconds || 0
                if (duration > 10) {
                    return newsletter.sendText(sock, m.chat, 
                        '*STICKER*\n\nVideo too long. Maximum 10 seconds for animated sticker.', m
                    )
                }
                isAnimated = true
            }
        }
        
        if (!buffer) {
            return newsletter.sendText(sock, m.chat, 
                '*STICKER*\n\nPlease reply to an image/video with .sticker', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, '*STICKER*\n\nCreating sticker...', m)
        
        const tempDir = path.join(process.cwd(), 'temp')
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })
        
        const inputPath = path.join(tempDir, `sticker_in_${randomBytes(4).toString('hex')}.${isVideo ? 'mp4' : 'jpg'}`)
        const outputPath = path.join(tempDir, `sticker_out_${randomBytes(4).toString('hex')}.webp`)
        
        try {
            fs.writeFileSync(inputPath, buffer)
            
            // Parse sticker metadata from args
            const argsText = text?.trim() || ''
            let packname = 'KNOX MD'
            let author = 'KNOX BOT'
            
            if (argsText.includes('|')) {
                const parts = argsText.split('|').map(p => p.trim())
                packname = parts[0] || packname
                author = parts[1] || author
            } else if (argsText) {
                packname = argsText
            }
            
            // Convert to webp
            let success = false
            if (isVideo) {
                success = await webp.videoToWebp(inputPath, outputPath, 10)
            } else {
                success = await webp.imageToWebp(inputPath, outputPath)
            }
            
            if (!success) {
                throw new Error('Failed to create sticker')
            }
            
            // Add metadata
            const finalPath = await webp.addMetadata(outputPath, packname, author)
            const stickerBuffer = fs.readFileSync(finalPath)
            
            await sock.sendMessage(m.chat, {
                sticker: stickerBuffer
            }, { quoted: m })
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        } finally {
            // Cleanup
            [inputPath, outputPath, outputPath + '.exif', outputPath.replace('.webp', '_with_meta.webp')].forEach(p => {
                if (fs.existsSync(p)) fs.unlinkSync(p)
            })
        }
    }
}