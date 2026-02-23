import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['npm'],
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
                '*NPM SEARCH*\n\nUsage: .npm <package>\nExample: .npm axios', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, `*NPM SEARCH*\n\nSearching for "${query}"...`, m)
        
        try {
            const { data } = await axios.get(
                `https://registry.npmjs.com/-/v1/search?text=${encodeURIComponent(query)}&size=10`,
                { timeout: 30000 }
            )
            
            if (!data.objects || data.objects.length === 0) {
                return newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nNo packages found for "${query}"`, m)
            }
            
            const packages = data.objects.slice(0, 5)
            
            let resultText = `*NPM SEARCH RESULTS*\n\n`
            
            packages.forEach((pkg, i) => {
                const item = pkg.package
                resultText += `*${i + 1}. ${item.name}* v${item.version}\n`
                resultText += `${item.description?.substring(0, 80)}${item.description?.length > 80 ? '...' : ''}\n`
                resultText += `Publisher: ${item.publisher?.username || '-'}\n\n`
            })
            
            resultText += `https://www.npmjs.com/search?q=${encodeURIComponent(query)}`
            
            await newsletter.sendText(sock, m.chat, resultText, m)
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        }
    }
}