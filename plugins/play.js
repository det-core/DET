import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { randomBytes } from 'crypto'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export default {
    command: ['play'],
    category: 'music',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const query = text?.trim()
        
        if (!query) {
            return newsletter.sendText(sock, m.chat, 
                '*PLAY MUSIC*\n\nUsage: .play <song name>\nExample: .play Believer', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, `*PLAY MUSIC*\n\nSearching for "${query}"...`, m)
        
        const tempDir = path.join(process.cwd(), 'temp')
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })
        
        const outputPath = path.join(tempDir, `play_${randomBytes(4).toString('hex')}.mp3`)
        
        try {
            // Search on YouTube
            const searchRes = await axios.get(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=1&key=YOUR_YOUTUBE_API_KEY`,
                { timeout: 10000 }
            )
            
            if (!searchRes.data.items || searchRes.data.items.length === 0) {
                return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nNo results found', m)
            }
            
            const video = searchRes.data.items[0]
            const videoId = video.id.videoId
            const title = video.snippet.title
            const channel = video.snippet.channelTitle
            const thumb = video.snippet.thumbnails.high.url
            
            await newsletter.sendText(sock, m.chat, `*PLAY MUSIC*\n\nDownloading: ${title}`, m)
            
            // Download audio using ytdl
            await execAsync(`yt-dlp -f bestaudio --extract-audio --audio-format mp3 -o "${outputPath}" https://youtube.com/watch?v=${videoId}`)
            
            const audioBuffer = fs.readFileSync(outputPath)
            
            // Try to send with image if available
            if (global.img && global.img.menu) {
                try {
                    const imgResponse = await axios.get(global.img.menu, { responseType: 'arraybuffer' })
                    const imageBuffer = Buffer.from(imgResponse.data)
                    
                    await sock.sendMessage(m.chat, {
                        image: imageBuffer,
                        caption: `*NOW PLAYING*\n\nTitle: ${title}\nChannel: ${channel}`
                    }, { quoted: m })
                } catch {
                    await newsletter.sendText(sock, m.chat, 
                        `*NOW PLAYING*\n\nTitle: ${title}\nChannel: ${channel}`, m
                    )
                }
            }
            
            await sock.sendMessage(m.chat, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                ptt: false,
                contextInfo: {
                    externalAdReply: {
                        title: title,
                        body: channel,
                        thumbnailUrl: thumb,
                        mediaType: 2
                    }
                }
            }, { quoted: m })
            
            fs.unlinkSync(outputPath)
            
        } catch (error) {
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath)
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        }
    }
}