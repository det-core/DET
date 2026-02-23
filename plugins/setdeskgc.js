import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['setdeskgc', 'setdesc'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        const newDesc = text?.trim()
        
        if (newDesc === undefined) {
            return newsletter.sendText(sock, m.chat, 
                '*KNOX INFO*\n\nUsage: .setdeskgc New group description\nUse .setdeskgc clear to remove description', m
            )
        }
        
        const descToSet = newDesc.toLowerCase() === 'clear' ? '' : newDesc
        
        try {
            await sock.groupUpdateDescription(m.chat, descToSet)
            
            await newsletter.sendText(sock, m.chat, 
                descToSet 
                    ? '*UPDATE DESCRIPTION*\n\n✓ Group description has been updated'
                    : '*UPDATE DESCRIPTION*\n\n✓ Group description has been removed', 
                m
            )
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}