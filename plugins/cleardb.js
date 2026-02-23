import newsletter from '../Bridge/newsletter.js'
import fs from 'fs'
import path from 'path'

export default {
    command: ['cleardb'],
    category: 'owner',
    owner: true,
    admin: false,
    reseller: false,
    group: false,
    private: true,
    execute: async (sock, m, text, args) => {
        const confirm = args[0]?.toLowerCase()
        
        if (confirm !== '--confirm') {
            return newsletter.sendText(sock, m.chat, 
                '*CLEAR DATABASE*\n\n⚠️ This will reset all bot data!\nUse .cleardb --confirm to proceed', m
            )
        }
        
        const dbFiles = [
            './database/owner.json',
            './database/admin.json',
            './database/reseller.json',
            './database/user.json'
        ]
        
        for (const file of dbFiles) {
            if (fs.existsSync(file)) {
                fs.writeFileSync(file, JSON.stringify([]))
            }
        }
        
        // Reset global owners from config
        if (global.owner) {
            const ownerFile = './database/owner.json'
            fs.writeFileSync(ownerFile, JSON.stringify(global.owner))
        }
        
        await newsletter.sendText(sock, m.chat, 
            '*CLEAR DATABASE*\n\n✓ Database has been reset successfully', m
        )
    }
}