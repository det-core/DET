import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['facebook', 'fb', 'fbdl'],
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
                '*FACEBOOK DOWNLOAD*\n\nUsage: .facebook <url>\nExample: .facebook https://www.facebook.com/watch?v=xxx', m
            )
        }
        
        if (!url.includes('facebook.com') && !url.includes('fb.watch')) {
            return newsletter.sendText(sock, m.chat, 
                '*KNOX INFO*\n\nInvalid Facebook URL', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, '*FACEBOOK DOWNLOAD*\n\nDownloading video...', m)
        
        try {
            const { data } = await axios.get(
                `https://api.nexray.web.id/api/download/fb?url=${encodeURIComponent(url)}`,
                { timeout: 30000 }
            )
            
            if (!data?.status || !data?.data?.hd) {
                return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nFailed to download video', m)
            }
            
            const videoUrl = data.data.hd || data.data.sd
            
            await newsletter.sendVideo(sock, m.chat, { url: videoUrl }, '', m)
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        }
    }
}