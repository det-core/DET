import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['gemini3', 'gemini'],
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
                '*GEMINI 3*\n\nUsage: .gemini3 <question>\nExample: .gemini3 Tell me about AI', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, '*GEMINI 3*\n\nThinking...', m)
        
        try {
            const { data } = await axios.get(
                `https://api.nexray.web.id/ai/gemini?text=${encodeURIComponent(query)}`,
                { timeout: 30000 }
            )
            
            const response = data.result || data.response || 'No response'
            
            await newsletter.sendText(sock, m.chat, 
                `*GEMINI 3 RESPONSE*\n\n${response}`, m
            )
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        }
    }
}