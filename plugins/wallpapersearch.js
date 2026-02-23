import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'
import * as cheerio from 'cheerio'

export default {
    command: ['wallpaper', 'wp'],
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
                '*WALLPAPER SEARCH*\n\nUsage: .wallpaper <query>\nExample: .wallpaper mountains', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, `*WALLPAPER SEARCH*\n\nSearching for "${query}"...`, m)
        
        try {
            const url = `https://www.wallpaperflare.com/search?wallpaper=${encodeURIComponent(query)}`
            
            const { data } = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            })
            
            const $ = cheerio.load(data)
            const results = []
            
            $('li[itemprop="associatedMedia"]').each((i, el) => {
                const image = $(el).find('img').attr('data-src')
                const page = $(el).find('a[itemprop="url"]').attr('href')
                const resolution = $(el).find('.res').text().trim()
                
                if (image && page && i < 10) {
                    results.push({
                        image: image,
                        page: `https://www.wallpaperflare.com${page}`,
                        resolution: resolution
                    })
                }
            })
            
            if (results.length === 0) {
                return newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nNo wallpapers found for "${query}"`, m)
            }
            
            const mediaList = []
            
            for (let i = 0; i < Math.min(results.length, 5); i++) {
                try {
                    const response = await axios.get(results[i].image, { 
                        responseType: 'arraybuffer',
                        timeout: 30000
                    })
                    const imageBuffer = Buffer.from(response.data)
                    mediaList.push({
                        image: imageBuffer,
                        caption: `Resolution: ${results[i].resolution}`
                    })
                } catch {}
            }
            
            if (mediaList.length === 1) {
                await newsletter.sendImage(sock, m.chat, mediaList[0].image, mediaList[0].caption, m)
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