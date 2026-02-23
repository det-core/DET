import { exec } from 'child_process'
import { promisify } from 'util'
import newsletter from '../Bridge/newsletter.js'

const execAsync = promisify(exec)

export default {
    command: ['gitpull'],
    category: 'owner',
    owner: true,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        await newsletter.sendText(sock, m.chat, '*GIT PULL*\n\nPulling latest changes...', m)
        
        try {
            const { stdout, stderr } = await execAsync('git pull', { timeout: 60000 })
            
            const output = stdout || stderr
            
            await newsletter.sendText(sock, m.chat, 
                `*GIT PULL RESULT*\n\n\`\`\`${output.substring(0, 1000)}\`\`\``, 
                m
            )
            
            if (output.includes('Already up to date')) {
                return
            }
            
            await newsletter.sendText(sock, m.chat, '*GIT PULL*\n\nInstalling dependencies...', m)
            
            const npmOutput = await execAsync('npm install', { timeout: 120000 })
            
            await newsletter.sendText(sock, m.chat, 
                `*NPM INSTALL*\n\n\`\`\`${(npmOutput.stdout || npmOutput.stderr).substring(0, 500)}\`\`\``, 
                m
            )
            
            await newsletter.sendText(sock, m.chat, 
                '*GIT PULL*\n\nUpdate complete! Restarting in 3 seconds...', 
                m
            )
            
            setTimeout(() => {
                process.exit(0)
            }, 3000)
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*GIT PULL*\n\nError: ${error.message}`, 
                m
            )
        }
    }
}