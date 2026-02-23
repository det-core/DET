import newsletter from '../Bridge/newsletter.js'
import det from '../Bridge/det.js'

export default {
    command: ['removeowner', 'delowner'],
    category: 'owner',
    owner: true,
    admin: false,
    reseller: false,
    group: false,
    private: true,
    execute: async (sock, m, text, args) => {
        let target = null
        
        if (m.quoted) {
            target = m.quoted.sender.split('@')[0]
        } else if (args[0]) {
            target = args[0].replace(/\D/g, '')
        }
        
        if (!target) {
            return newsletter.sendText(sock, m.chat, 
                '*REMOVE OWNER*\n\nUsage: .removeowner @user or reply to user\'s message', m
            )
        }
        
        if (!det.isOwner(target)) {
            return newsletter.sendText(sock, m.chat, 
                '*KNOX INFO*\n\nUser is not an owner', m
            )
        }
        
        const index = det.db.owner.indexOf(target)
        if (index > -1) {
            det.db.owner.splice(index, 1)
            det.saveDB()
        }
        
        await newsletter.sendText(sock, m.chat, 
            `*REMOVE OWNER*\n\n✓ @${target} has been removed from owners`, 
            m
        )
    }
}