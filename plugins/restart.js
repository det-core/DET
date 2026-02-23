import newsletter from '../Bridge/newsletter.js'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export default {
    command: ['restart'],
    category: 'owner',
    owner: true,
    admin: false,
    reseller: false,
    group: false,
    private: true,
    execute: async (sock, m, text, args) => {
        await newsletter.sendText(sock, m.chat, 
            '*RESTART*\n\nRestarting bot in 3 seconds...', m
        )
        
        setTimeout(() => {
            process.exit(0)
        }, 3000)
    }
}