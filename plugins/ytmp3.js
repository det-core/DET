import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['ytmp3', 'ytaudio'],
    category: 'download',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const url = text?.trim()
        
        if (!url) {
            return newsletter.sendText(sock, m.chat, 
                '*YOUTUBE MP3*\n\nUsage: .ytmp3 <url>\nExample: .ytmp3 https://youtube.com/watch?v=xxx', m
            )
        }
        
        if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
            return newsletter.sendText(sock, m.chat, 
                '*KNOX INFO*\n\nInvalid YouTube URL', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, '*YOUTUBE MP3*\n\nDownloading audio...', m)
        
        try {
            const { data } = await axios.get(
                `https://api.nexray.web.id/api/download/ytmp3?url=${encodeURIComponent(url)}`,
                { timeout: 60000 }
            )
            
            if (!data?.status || !data?.data?.download) {
                return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nFailed to download audio', m)
            }
            
            const info = data.data
            
            await newsletter.sendAudio(sock, m.chat, { url: info.download }, false, m)
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        }
    }
}