import newsletter from '../Bridge/newsletter.js'
import { reelsvideo } from '../lib/reelsvideo.js'

export default {
    command: ['instagram', 'igdl', 'ig'],
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
                '*INSTAGRAM DOWNLOAD*\n\nUsage: .instagram <url>\nExample: .instagram https://www.instagram.com/reel/xxx', m
            )
        }
        
        if (!url.includes('instagram.com')) {
            return newsletter.sendText(sock, m.chat, 
                '*KNOX INFO*\n\nInvalid Instagram URL', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, '*INSTAGRAM DOWNLOAD*\n\nDownloading...', m)
        
        try {
            const result = await reelsvideo(url)
            
            if (result.type === 'video' && result.videos.length > 0) {
                await newsletter.sendVideo(sock, m.chat, { url: result.videos[0] }, '', m)
            } else if (result.type === 'photo' && result.images.length > 0) {
                const mediaList = result.images.map(img => ({
                    image: { url: img },
                    caption: ''
                }))
                
                if (mediaList.length === 1) {
                    const response = await axios.get(result.images[0], { responseType: 'arraybuffer' })
                    const imageBuffer = Buffer.from(response.data)
                    await newsletter.sendImage(sock, m.chat, imageBuffer, '', m)
                } else {
                    await newsletter.sendAlbum(sock, m.chat, mediaList, m)
                }
            } else {
                await newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nNo media found', m)
            }
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        }
    }
}