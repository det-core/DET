import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['gita'],
    category: 'ai',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const query = text?.trim()
        
        if (!query) {
            return newsletter.sendText(sock, m.chat, 
                '*GITA GPT*\n\nUsage: .gita <question>\nExample: .gita What is dharma?', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, '*GITA GPT*\n\nThinking...', m)
        
        try {
            const { data } = await axios.get(
                `https://api.nexray.web.id/ai/gitagpt?text=${encodeURIComponent(query)}`,
                { timeout: 30000 }
            )
            
            const response = data.result || data.response || 'No response'
            
            await newsletter.sendText(sock, m.chat, 
                `*GITA GPT RESPONSE*\n\n${response}`, m
            )
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        }
    }
}