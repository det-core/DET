import newsletter from '../Bridge/newsletter.js'
import dramaboxsearch from '../lib/dramabox.js'

export default {
    command: ['dramabox', 'drama'],
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
                '*DRAMABOX SEARCH*\n\nUsage: .dramabox <title>\nExample: .dramabox billionaire', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, `*DRAMABOX SEARCH*\n\nSearching for "${query}"...`, m)
        
        try {
            const data = await dramaboxsearch(query)
            
            if (data.status === 'eror' || !data.results?.length) {
                return newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nNo dramas found for "${query}"`, m)
            }
            
            const dramas = data.results.slice(0, 5)
            
            let resultText = `*DRAMABOX SEARCH RESULTS*\n\nFound ${data.total} results\n\n`
            
            dramas.forEach((drama, i) => {
                resultText += `*${i + 1}. ${drama.title}*\n`
                resultText += `Episodes: ${drama.episodes || '-'}\n`
                resultText += `${drama.description?.substring(0, 100)}${drama.description?.length > 100 ? '...' : ''}\n\n`
            })
            
            await newsletter.sendText(sock, m.chat, resultText, m)
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        }
    }
}