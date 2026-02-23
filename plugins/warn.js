import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['warn'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        let target = null
        let reason = ''
        
        if (m.quoted) {
            target = m.quoted.sender
            reason = text?.trim() || 'No reason provided'
        } else if (m.mentionedJid && m.mentionedJid.length > 0) {
            target = m.mentionedJid[0]
            reason = args.slice(1).join(' ') || 'No reason provided'
        }
        
        if (!target) {
            return newsletter.sendText(sock, m.chat, 
                '*KNOX INFO*\n\nUsage: .warn @user <reason> or reply to user\'s message', m
            )
        }
        
        const MAX_WARNINGS = 3
        
        try {
            const db = (await import('../Bridge/det.js')).default
            const groupData = db.getGroup(m.chat) || {}
            
            if (!groupData.warnings) groupData.warnings = {}
            if (!groupData.warnings[target]) groupData.warnings[target] = []
            
            groupData.warnings[target].push({
                reason: reason,
                by: m.sender,
                time: Date.now()
            })
            
            const warnCount = groupData.warnings[target].length
            
            if (warnCount >= MAX_WARNINGS) {
                await sock.groupParticipantsUpdate(m.chat, [target], 'remove')
                delete groupData.warnings[target]
                
                const targetNum = target.split('@')[0]
                await newsletter.sendText(sock, m.chat, 
                    `*WARN*\n\n⚠️ @${targetNum} has been kicked for reaching ${MAX_WARNINGS} warnings`, 
                    m
                )
            } else {
                const targetNum = target.split('@')[0]
                await newsletter.sendText(sock, m.chat, 
                    `*WARN*\n\n⚠️ @${targetNum} warned (${warnCount}/${MAX_WARNINGS})\nReason: ${reason}`, 
                    m
                )
            }
            
            db.setGroup(m.chat, groupData)
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}