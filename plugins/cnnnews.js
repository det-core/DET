import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'
import * as cheerio from 'cheerio'

export default {
    command: ['cnnnews', 'news'],
    category: 'search',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        await newsletter.sendText(sock, m.chat, '*CNN NEWS*\n\nFetching latest news...', m)
        
        try {
            const { data } = await axios.get('https://www.cnnindonesia.com/', {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            })
            
            const $ = cheerio.load(data)
            const news = []
            
            $('.nhl-list article').each((i, el) => {
                const link = $(el).find('a').first()
                const url = link.attr('href')
                const title = link.find('h2').text().trim()
                const image = $(el).find('img').attr('src')
                
                if (url && title && i < 5) {
                    news.push({
                        title: title,
                        url: url,
                        image: image
                    })
                }
            })
            
            if (news.length === 0) {
                return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nNo news found', m)
            }
            
            let resultText = `*CNN INDONESIA NEWS*\n\n`
            
            news.forEach((item, i) => {
                resultText += `*${i + 1}. ${item.title}*\n`
                resultText += `${item.url}\n\n`
            })
            
            await newsletter.sendText(sock, m.chat, resultText, m)
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        }
    }
}