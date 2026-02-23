import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['poll', 'vote'],
    category: 'group',
    owner: false,
    admin: false,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        if (!text || !text.includes('|')) {
            const helpMsg = `*POLL CREATOR*

┏⧉ *Usage*
┣𖣠 .poll Question | Option1, Option2, Option3
┣𖣠 .poll multi | Question | Option1, Option2 (multiple choice)
┗━━━━━━━━━

Example: .poll What to eat? | Rice, Noodles, Bread`
            return newsletter.sendText(sock, m.chat, helpMsg, m)
        }
        
        let isMultiple = false
        let parts = text.split('|').map(p => p.trim())
        
        if (parts[0].toLowerCase() === 'multi') {
            isMultiple = true
            parts = parts.slice(1)
        }
        
        if (parts.length < 2) {
            return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nInvalid format. Use: Question | Option1, Option2', m)
        }
        
        const question = parts[0]
        const options = parts[1].split(',').map(o => o.trim()).filter(o => o)
        
        if (options.length < 2) {
            return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nAt least 2 options are required', m)
        }
        
        if (options.length > 12) {
            return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nMaximum 12 options allowed', m)
        }
        
        try {
            const pollMsg = `*POLL CREATED*
            
Question: ${question}
Options: ${options.length}
Type: ${isMultiple ? 'Multiple Choice' : 'Single Choice'}
Created by: @${m.sender.split('@')[0]}`

            await newsletter.sendText(sock, m.chat, pollMsg, m)
            
            await sock.sendMessage(m.chat, {
                poll: {
                    name: question,
                    values: options,
                    selectableCount: isMultiple ? options.length : 1
                }
            })
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}