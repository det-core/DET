import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['report', 'bug'],
    category: 'utility',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const message = text?.trim()
        
        if (!message) {
            return newsletter.sendText(sock, m.chat, 
                '*REPORT*\n\nUsage: .report <issue description>', m
            )
        }
        
        // Send to owner
        for (const owner of global.owner) {
            try {
                const ownerJid = owner.includes('@') ? owner : owner + '@s.whatsapp.net'
                await newsletter.sendText(sock, ownerJid, 
                    `*BUG REPORT*\n\nFrom: @${m.sender.split('@')[0]}\nMessage: ${message}\n\nGroup: ${m.isGroup ? m.chat : 'Private'}`, 
                    null
                )
            } catch {}
        }
        
        await newsletter.sendText(sock, m.chat, 
            '*REPORT*\n\n✓ Your report has been sent to the owner', m
        )
    }
}