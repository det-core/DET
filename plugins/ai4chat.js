import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['ai4chat', 'ai'],
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
                '*AI CHAT*\n\nUsage: .ai4chat <question>\nExample: .ai4chat What is JavaScript?', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, '*AI CHAT*\n\nThinking...', m)
        
        try {
            const { data } = await axios.get(
                `https://api.nexray.web.id/ai/ai4chat?query=${encodeURIComponent(query)}`,
                { timeout: 30000 }
            )
            
            const response = data.result || data.response || 'No response'
            
            await newsletter.sendText(sock, m.chat, 
                `*AI RESPONSE*\n\n${response}`, m
            )
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        }
    }
}