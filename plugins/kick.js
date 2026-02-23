import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['kick', 'remove', 'tendang'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        if (!m.isGroup) {
            return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nThis command can only be used in groups', m)
        }
        
        let target = null
        
        if (m.quoted) {
            target = m.quoted.sender
        } else if (m.mentionedJid && m.mentionedJid.length > 0) {
            target = m.mentionedJid[0]
        } else if (args[0]) {
            let num = args[0].replace(/[^0-9]/g, '')
            if (num.startsWith('0')) num = '234' + num.slice(1)
            target = num + '@s.whatsapp.net'
        }
        
        if (!target) {
            return newsletter.sendText(sock, m.chat, 
                '*KNOX INFO*\n\nUsage: .kick @user or reply to user\'s message', m
            )
        }
        
        if (target === m.sender) {
            return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nCannot kick yourself', m)
        }
        
        try {
            await sock.groupParticipantsUpdate(m.chat, [target], 'remove')
            
            const targetNum = target.split('@')[0]
            await newsletter.sendText(sock, m.chat, 
                `*KICK RESULT*\n\n✓ User @${targetNum} has been removed from the group`, 
                m
            )
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}