import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['film', 'movie'],
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
                '*FILM SEARCH*\n\nUsage: .film <title>\nExample: .film civil war', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, `*FILM SEARCH*\n\nSearching for "${query}"...`, m)
        
        try {
            const { data } = await axios.get(
                `https://api.nexray.web.id/api/search/film?q=${encodeURIComponent(query)}`,
                { timeout: 30000 }
            )
            
            if (!data?.status || !data?.data?.length) {
                return newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nNo films found for "${query}"`, m)
            }
            
            const films = data.data.slice(0, 5)
            
            let resultText = `*FILM SEARCH RESULTS*\n\nFound ${data.data.length} films\n\n`
            
            films.forEach((film, i) => {
                resultText += `*${i + 1}. ${film.title}*\n`
                resultText += `Rating: ${film.rating || '-'} | Year: ${film.year || '-'}\n`
                resultText += `Genre: ${film.genre || '-'}\n\n`
            })
            
            resultText += `Use .filmget <url> to get details`
            
            await newsletter.sendText(sock, m.chat, resultText, m)
            
            global.filmSessions = global.filmSessions || {}
            global.filmSessions[m.sender] = films
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        }
    }
}