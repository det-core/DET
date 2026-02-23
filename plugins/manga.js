import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['manga'],
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
                '*MANGA SEARCH*\n\nUsage: .manga <title>\nExample: .manga one piece', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, `*MANGA SEARCH*\n\nSearching for "${query}"...`, m)
        
        try {
            const { data } = await axios.get(
                `https://api.nexray.web.id/api/search/manga?q=${encodeURIComponent(query)}`,
                { timeout: 30000 }
            )
            
            if (!data?.status || !data?.data?.length) {
                return newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nNo manga found for "${query}"`, m)
            }
            
            const mangaList = data.data.slice(0, 5)
            
            let resultText = `*MANGA SEARCH RESULTS*\n\n`
            
            mangaList.forEach((manga, i) => {
                resultText += `*${i + 1}. ${manga.title}*\n`
                resultText += `Author: ${manga.author || '-'}\n`
                resultText += `Status: ${manga.status || '-'}\n`
                resultText += `Chapters: ${manga.chapters || '-'}\n\n`
            })
            
            await newsletter.sendText(sock, m.chat, resultText, m)
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        }
    }
}