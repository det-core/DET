import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['ytmp4', 'ytvideo'],
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
                '*YOUTUBE MP4*\n\nUsage: .ytmp4 <url>\nExample: .ytmp4 https://youtube.com/watch?v=xxx', m
            )
        }
        
        if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
            return newsletter.sendText(sock, m.chat, 
                '*KNOX INFO*\n\nInvalid YouTube URL', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, '*YOUTUBE MP4*\n\nDownloading video...', m)
        
        try {
            const { data } = await axios.get(
                `https://api.nexray.web.id/api/download/ytmp4?url=${encodeURIComponent(url)}`,
                { timeout: 60000 }
            )
            
            if (!data?.status || !data?.data?.download) {
                return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nFailed to download video', m)
            }
            
            const info = data.data
            
            const caption = `*YOUTUBE VIDEO*

Title: ${info.title || '-'}
Quality: ${info.quality || 'Unknown'}`

            await newsletter.sendVideo(sock, m.chat, { url: info.download }, caption, m)
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        }
    }
}