import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['antitagsw'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        const option = args[0]?.toLowerCase()
        
        if (!option || (option !== 'on' && option !== 'off')) {
            return newsletter.sendText(sock, m.chat, 
                '*ANTITAGSW SETTINGS*\n\nUsage: .antitagsw on / .antitagsw off', m
            )
        }
        
        try {
            const db = (await import('../Bridge/det.js')).default
            const groupData = db.getGroup(m.chat) || {}
            
            groupData.antitagsw = option === 'on'
            db.setGroup(m.chat, groupData)
            
            await newsletter.sendText(sock, m.chat, 
                `*ANTITAGSW*\n\n✓ Antitagsw has been turned ${option.toUpperCase()}`, 
                m
            )
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}