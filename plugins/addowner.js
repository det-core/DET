import newsletter from '../Bridge/newsletter.js'
import det from '../Bridge/det.js'

export default {
    command: ['addowner'],
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
                '*ADD OWNER*\n\nUsage: .addowner @user or reply to user\'s message', m
            )
        }
        
        if (det.isOwner(target)) {
            return newsletter.sendText(sock, m.chat, 
                '*KNOX INFO*\n\nUser is already an owner', m
            )
        }
        
        det.db.owner.push(target)
        det.saveDB()
        
        await newsletter.sendText(sock, m.chat, 
            `*ADD OWNER*\n\n✓ @${target} has been added as owner`, 
            m
        )
    }
}