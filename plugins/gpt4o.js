import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['gpt4o', 'gpt4'],
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
                '*GPT-4O*\n\nUsage: .gpt4o <question>\nExample: .gpt4o What is machine learning?', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, '*GPT-4O*\n\nThinking...', m)
        
        try {
            const { data } = await axios.get(
                `https://api.nexray.web.id/ai/gpt4?text=${encodeURIComponent(query)}`,
                { timeout: 30000 }
            )
            
            const response = data.result || data.response || 'No response'
            
            await newsletter.sendText(sock, m.chat, 
                `*GPT-4O RESPONSE*\n\n${response}`, m
            )
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        }
    }
}