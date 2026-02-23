import newsletter from '../Bridge/newsletter.js'
import ttdown from '../lib/tiktok.js'

export default {
    command: ['ttmp3', 'tiktokmp3'],
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
                '*TIKTOK MP3*\n\nUsage: .ttmp3 <url>\nExample: .ttmp3 https://vt.tiktok.com/xxx', m
            )
        }
        
        if (!url.includes('tiktok.com') && !url.includes('vt.tiktok')) {
            return newsletter.sendText(sock, m.chat, 
                '*KNOX INFO*\n\nInvalid TikTok URL', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, '*TIKTOK MP3*\n\nExtracting audio...', m)
        
        try {
            const result = await ttdown(url)
            
            const audioItem = result.downloads.find(d => d.type === 'mp3')
            
            if (!audioItem) {
                return newsletter.sendText(sock, m.chat, 
                    '*KNOX INFO*\n\nNo audio found', m
                )
            }
            
            await newsletter.sendAudio(sock, m.chat, { url: audioItem.url }, false, m)
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        }
    }
}