import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['filmget', 'movieget'],
    category: 'search',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const sessions = global.filmSessions || {}
        const films = sessions[m.sender]
        
        let index = parseInt(args[0]) - 1
        
        if (isNaN(index) && text && text.includes('http')) {
            index = -1
        }
        
        if (index >= 0 && films && films[index]) {
            const film = films[index]
            const url = film.url
            
            await newsletter.sendText(sock, m.chat, `*FILM DETAILS*\n\nFetching details...`, m)
            
            try {
                const { data } = await axios.get(
                    `https://api.nexray.web.id/api/search/filmget?url=${encodeURIComponent(url)}`,
                    { timeout: 30000 }
                )
                
                if (!data?.status || !data?.data) {
                    return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nFailed to get film details', m)
                }
                
                const filmData = data.data
                
                let resultText = `*${filmData.title || film.title}*\n\n`
                resultText += `Rating: ${filmData.rating || '-'}\n`
                resultText += `Duration: ${filmData.duration || '-'}\n`
                resultText += `Genre: ${filmData.genre || '-'}\n`
                resultText += `Director: ${filmData.director || '-'}\n`
                resultText += `Actors: ${filmData.actors || '-'}\n\n`
                resultText += `Synopsis:\n${filmData.synopsis || '-'}\n\n`
                
                if (filmData.streams?.length > 0) {
                    resultText += `Streaming links available.`
                }
                
                await newsletter.sendText(sock, m.chat, resultText, m)
                
            } catch (error) {
                await newsletter.sendText(sock, m.chat, 
                    `*KNOX INFO*\n\nError: ${error.message}`, m
                )
            }
        } else if (text && text.includes('http')) {
            const url = text.trim()
            
            try {
                const { data } = await axios.get(
                    `https://api.nexray.web.id/api/search/filmget?url=${encodeURIComponent(url)}`,
                    { timeout: 30000 }
                )
                
                if (!data?.status || !data?.data) {
                    return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nFailed to get film details', m)
                }
                
                const filmData = data.data
                
                let resultText = `*${filmData.title}*\n\n`
                resultText += `Rating: ${filmData.rating || '-'}\n`
                resultText += `Duration: ${filmData.duration || '-'}\n`
                resultText += `Genre: ${filmData.genre || '-'}\n`
                resultText += `Director: ${filmData.director || '-'}\n`
                resultText += `Actors: ${filmData.actors || '-'}\n\n`
                resultText += `Synopsis:\n${filmData.synopsis || '-'}`
                
                await newsletter.sendText(sock, m.chat, resultText, m)
                
            } catch (error) {
                await newsletter.sendText(sock, m.chat, 
                    `*KNOX INFO*\n\nError: ${error.message}`, m
                )
            }
        } else {
            return newsletter.sendText(sock, m.chat, 
                '*FILM GET*\n\nUsage: .filmget <number> or .filmget <url>', m
            )
        }
    }
}