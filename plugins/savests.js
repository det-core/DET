import newsletter from '../Bridge/newsletter.js'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import fs from 'fs'
import path from 'path'
import { randomBytes } from 'crypto'

export default {
    command: ['savests', 'save', 'ss', 'sw'],
    category: 'tools',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        // Check if replying to a message
        if (!m.quoted) {
            return newsletter.sendText(sock, m.chat, 
                '*SAVE STATUS*\n\nUsage: Reply to a status (image/video/audio) with .savests', m
            )
        }

        // Check if the quoted message is from status broadcast
        const isStatus = m.quoted.key?.remoteJid === 'status@broadcast'
        
        if (!isStatus) {
            return newsletter.sendText(sock, m.chat, 
                '*KNOX INFO*\n\nThis is not a status message. Reply to a status (from status@broadcast) to save it.', m
            )
        }

        await newsletter.sendText(sock, m.chat, '*SAVE STATUS*\n\nDownloading status...', m)

        try {
            const quotedMsg = m.quoted.message
            const type = Object.keys(quotedMsg)[0]
            
            // Determine media type
            let mediaType = null
            let fileExtension = ''
            let fileName = ''
            
            if (type === 'imageMessage') {
                mediaType = 'image'
                fileExtension = 'jpg'
                fileName = `status_image_${Date.now()}.jpg`
            } else if (type === 'videoMessage') {
                mediaType = 'video'
                fileExtension = 'mp4'
                fileName = `status_video_${Date.now()}.mp4`
            } else if (type === 'audioMessage') {
                mediaType = 'audio'
                fileExtension = 'mp3'
                fileName = `status_audio_${Date.now()}.mp3`
            } else {
                return newsletter.sendText(sock, m.chat, 
                    '*KNOX INFO*\n\nUnsupported media type. Only images, videos, and audio can be saved.', m
                )
            }

            // Download the media
            const stream = await downloadContentFromMessage(quotedMsg[type], mediaType)
            let buffer = Buffer.from([])
            
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk])
            }

            if (buffer.length === 0) {
                throw new Error('Failed to download media')
            }

            // Create temp directory if it doesn't exist
            const tempDir = path.join(process.cwd(), 'temp')
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true })
            }

            // Get sender info
            const sender = m.quoted.key?.participant || m.quoted.sender
            const senderNumber = sender?.split('@')[0] || 'unknown'

            // Get caption/text if available
            let caption = ''
            if (type === 'imageMessage' && quotedMsg[type].caption) {
                caption = quotedMsg[type].caption
            } else if (type === 'videoMessage' && quotedMsg[type].caption) {
                caption = quotedMsg[type].caption
            }

            // Save to temp file (optional - can send directly)
            const filePath = path.join(tempDir, fileName)
            fs.writeFileSync(filePath, buffer)

            // Prepare success message
            const successMsg = `*STATUS SAVED*

┏⧉ *Details*
┣𖣠 Type: ${mediaType.toUpperCase()}
┣𖣠 Size: ${(buffer.length / 1024).toFixed(2)} KB
┣𖣠 From: @${senderNumber}
┣𖣠 Time: ${new Date().toLocaleString()}
┗━━━━━━━━━`

            // Send back the saved media based on type
            if (mediaType === 'image') {
                await sock.sendMessage(m.chat, {
                    image: buffer,
                    caption: successMsg + (caption ? `\n\nCaption: ${caption}` : '')
                }, { quoted: m })
                
            } else if (mediaType === 'video') {
                await sock.sendMessage(m.chat, {
                    video: buffer,
                    caption: successMsg + (caption ? `\n\nCaption: ${caption}` : ''),
                    mimetype: 'video/mp4'
                }, { quoted: m })
                
            } else if (mediaType === 'audio') {
                // Check if it's a voice note or music
                const isPtt = quotedMsg[type].ptt || false
                
                await sock.sendMessage(m.chat, {
                    audio: buffer,
                    mimetype: isPtt ? 'audio/ogg; codecs=opus' : 'audio/mpeg',
                    ptt: isPtt
                }, { quoted: m })
                
                // Also send the text info
                await newsletter.sendText(sock, m.chat, successMsg, m)
            }

            // Clean up temp file
            fs.unlinkSync(filePath)

        } catch (error) {
            console.error('Save Status Error:', error)
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError saving status: ${error.message}`, m
            )
        }
    }
}