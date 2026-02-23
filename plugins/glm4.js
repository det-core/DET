import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['glm4', 'glm'],
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
                '*GLM-4*\n\nUsage: .glm4 <question>\nExample: .glm4 What is artificial intelligence?', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, '*GLM-4*\n\nThinking...', m)
        
        try {
            const { data } = await axios.get(
                `https://api.nexray.web.id/ai/glm?text=${encodeURIComponent(query)}`,
                { timeout: 30000 }
            )
            
            const response = data.result || data.response || 'No response'
            
            await newsletter.sendText(sock, m.chat, 
                `*GLM-4 RESPONSE*\n\n${response}`, m
            )
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        }
    }
}