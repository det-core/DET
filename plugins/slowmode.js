import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['slowmode'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        const option = args[0]?.toLowerCase()
        
        if (!option) {
            return newsletter.sendText(sock, m.chat, 
                '*SLOWMODE*\n\nUsage: .slowmode on <seconds> / .slowmode off', m
            )
        }
        
        try {
            const db = (await import('../Bridge/det.js')).default
            const groupData = db.getGroup(m.chat) || {}
            
            if (!groupData.slowmode) groupData.slowmode = {}
            
            if (option === 'on') {
                const seconds = parseInt(args[1]) || 30
                if (seconds < 5 || seconds > 300) {
                    return newsletter.sendText(sock, m.chat, 
                        '*KNOX INFO*\n\nSlowmode must be between 5-300 seconds', m
                    )
                }
                groupData.slowmode.enabled = true
                groupData.slowmode.delay = seconds
                
                await newsletter.sendText(sock, m.chat, 
                    `*SLOWMODE*\n\n✓ Slowmode enabled with ${seconds} second delay`, 
                    m
                )
            } else if (option === 'off') {
                groupData.slowmode.enabled = false
                
                await newsletter.sendText(sock, m.chat, 
                    '*SLOWMODE*\n\n✓ Slowmode disabled', 
                    m
                )
            }
            
            db.setGroup(m.chat, groupData)
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}