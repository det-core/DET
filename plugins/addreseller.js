import newsletter from '../Bridge/newsletter.js'
import det from '../Bridge/det.js'

export default {
    command: ['addreseller'],
    category: 'admin',
    owner: false,
    admin: true,
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
                '*ADD RESELLER*\n\nUsage: .addreseller @user or reply to user\'s message', m
            )
        }
        
        if (det.isReseller(target)) {
            return newsletter.sendText(sock, m.chat, 
                '*KNOX INFO*\n\nUser is already a reseller', m
            )
        }
        
        det.db.reseller.push(target)
        det.saveDB()
        
        await newsletter.sendText(sock, m.chat, 
            `*ADD RESELLER*\n\n✓ @${target} has been added as reseller`, 
            m
        )
    }
}