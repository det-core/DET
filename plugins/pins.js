import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'
import { pinterest } from '../lib/pinterest.js'

export default {
    command: ['pins', 'pinterest'],
    category: 'search',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const query = text?.trim()
        
        if (!query) {
            return newsletter.sendText(sock, m.chat, 
                '*PINTEREST SEARCH*\n\nUsage: .pins <query>\nExample: .pins nature wallpaper', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, `*PINTEREST SEARCH*\n\nSearching for "${query}"...`, m)
        
        try {
            const data = await pinterest(query)
            
            if (!data || !data.length) {
                return newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nNo images found for "${query}"`, m)
            }
            
            const images = data.slice(0, 5)
            
            const mediaList = []
            
            for (const img of images) {
                try {
                    const response = await axios.get(img, { 
                        responseType: 'arraybuffer',
                        timeout: 30000
                    })
                    const imageBuffer = Buffer.from(response.data)
                    mediaList.push({
                        image: imageBuffer,
                        caption: ''
                    })
                } catch {}
            }
            
            if (mediaList.length === 1) {
                await newsletter.sendImage(sock, m.chat, mediaList[0].image, '', m)
            } else if (mediaList.length > 1) {
                await newsletter.sendAlbum(sock, m.chat, mediaList, m)
            } else {
                await newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nFailed to load images', m)
            }
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        }
    }
}