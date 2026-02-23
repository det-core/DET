import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['unblock'],
    category: 'owner',
    owner: true,
    admin: false,
    reseller: false,
    group: false,
    private: true,
    execute: async (sock, m, text, args) => {
        let target = null
        
        if (m.quoted) {
            target = m.quoted.sender
        } else if (m.mentionedJid && m.mentionedJid.length > 0) {
            target = m.mentionedJid[0]
        } else if (args[0]) {
            let num = args[0].replace(/\D/g, '')
            if (num.startsWith('0')) num = '234' + num.slice(1)
            target = num + '@s.whatsapp.net'
        }
        
        if (!target) {
            return newsletter.sendText(sock, m.chat, 
                '*UNBLOCK USER*\n\nUsage: .unblock @user or reply to user\'s message', m
            )
        }
        
        try {
            await sock.updateBlockStatus(target, 'unblock')
            
            const targetNum = target.split('@')[0]
            await newsletter.sendText(sock, m.chat, 
                `*UNBLOCK USER*\n\n✓ @${targetNum} has been unblocked`, 
                m
            )
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        }
    }
}