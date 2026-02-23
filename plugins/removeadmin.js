import newsletter from '../Bridge/newsletter.js'
import det from '../Bridge/det.js'

export default {
    command: ['removeadmin', 'deladmin'],
    category: 'admin',
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
                '*REMOVE ADMIN*\n\nUsage: .removeadmin @user or reply to user\'s message', m
            )
        }
        
        if (!det.isAdmin(target)) {
            return newsletter.sendText(sock, m.chat, 
                '*KNOX INFO*\n\nUser is not an admin', m
            )
        }
        
        const index = det.db.admin.indexOf(target)
        if (index > -1) {
            det.db.admin.splice(index, 1)
            det.saveDB()
        }
        
        await newsletter.sendText(sock, m.chat, 
            `*REMOVE ADMIN*\n\n✓ @${target} has been removed from admins`, 
            m
        )
    }
}