import newsletter from '../Bridge/newsletter.js'
import ttdown from '../lib/tiktok.js'
import axios from 'axios'

export default {
    command: ['tiktok', 'tt', 'tiktokdl'],
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
                '*TIKTOK DOWNLOAD*\n\nUsage: .tiktok <url>\nExample: .tiktok https://vt.tiktok.com/xxx', m
            )
        }
        
        if (!url.includes('tiktok.com') && !url.includes('vt.tiktok')) {
            return newsletter.sendText(sock, m.chat, 
                '*KNOX INFO*\n\nInvalid TikTok URL', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, '*TIKTOK DOWNLOAD*\n\nDownloading video...', m)
        
        try {
            const result = await ttdown(url)
            
            const videoItem = result.downloads.find(d => d.type === 'hd' || d.type === 'nowm')
            
            if (!videoItem) {
                return newsletter.sendText(sock, m.chat, 
                    '*KNOX INFO*\n\nNo video found. This might be a photo post.', m
                )
            }
            
            const caption = `*TIKTOK DOWNLOAD*

Title: ${result.title || '-'}
Author: @${result.author?.username || '-'}`

            await newsletter.sendVideo(sock, m.chat, { url: videoItem.url }, caption, m)
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        }
    }
}