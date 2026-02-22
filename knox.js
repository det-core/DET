import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import chalk from 'chalk'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const plugins = new Map()
const pluginFiles = fs.readdirSync(path.join(__dirname, 'plugins')).filter(f => f.endsWith('.js'))

for (let file of pluginFiles) {
    try {
        const plugin = await import(`./plugins/${file}`)
        const module = plugin.default
        
        if (module && module.command) {
            const commands = Array.isArray(module.command) ? module.command : [module.command]
            for (let cmd of commands) {
                plugins.set(cmd, {
                    ...module,
                    file: file
                })
                console.log(chalk.green(`[PLUGIN] Loaded: ${cmd} from ${file}`))
            }
        }
    } catch (error) {
        console.log(chalk.red(`[ERROR] Failed to load ${file}:`, error.message))
    }
}

export const casesBot = async (sock, m, chatUpdate) => {
    try {
        if (!m.command) return
        
        const plugin = plugins.get(m.command)
        
        if (plugin) {
            if (plugin.owner && !m.isOwner) {
                return m.reply('*KNOX INFO*\n\nThis command is only for owner')
            }
            
            if (plugin.reseller && !m.isReseller && !m.isOwner) {
                return m.reply('*KNOX INFO*\n\nThis command is only for resellers')
            }
            
            if (plugin.group && !m.isGroup) {
                return m.reply('*KNOX INFO*\n\nThis command can only be used in groups')
            }
            
            if (plugin.private && m.isGroup) {
                return m.reply('*KNOX INFO*\n\nThis command can only be used in private chat')
            }
            
            await plugin.execute(sock, m, m.text, m.args)
        }
        
    } catch (error) {
        console.error('Error in casesBot:', error)
        m.reply('*KNOX INFO*\n\nAn error occurred')
    }
}

export const Feature = {
    public: true
}

console.log(chalk.green.bold('\n[✓] KNOX MD Bot Loaded'))
console.log(chalk.white(`[INFO] Total plugins: ${plugins.size}`))