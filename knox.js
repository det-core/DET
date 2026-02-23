import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import chalk from 'chalk'
import det from './Bridge/det.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const plugins = new Map()
const pluginFiles = fs.readdirSync(path.join(__dirname, 'plugins')).filter(f => f.endsWith('.js'))

console.log(chalk.blue.bold('\n[LOADING] Loading plugins...'))

for (let file of pluginFiles) {
    try {
        const plugin = await import(`./plugins/${file}`)
        const module = plugin.default || plugin
        
        if (module && module.command) {
            const commands = Array.isArray(module.command) ? module.command : [module.command]
            for (let cmd of commands) {
                plugins.set(cmd, {
                    ...module,
                    file: file
                })
                console.log(chalk.green(`[PLUGIN] ✓ Loaded: ${cmd} from ${file}`))
            }
        }
    } catch (error) {
        console.log(chalk.red(`[ERROR] Failed to load ${file}:`, error.message))
    }
}

export const casesBot = async (sock, m, chatUpdate) => {
    try {
        if (!m || !m.command) return
        
        // Add user to database
        if (m.sender) {
            const senderId = m.sender.split('@')[0]
            det.addUser(senderId)
        }
        
        const plugin = plugins.get(m.command)
        
        if (plugin) {
            console.log(chalk.cyan(`[EXEC] ${m.command} from ${m.sender.split('@')[0]} (${det.getUserStatus(m.sender)})`))
            
            // Check owner only
            if (plugin.owner && !m.isOwner) {
                return m.reply('*KNOX INFO*\n\nThis command is only for owner')
            }
            
            // Check admin (owner also counts as admin)
            if (plugin.admin && !m.isOwner && !m.isAdmin) {
                return m.reply('*KNOX INFO*\n\nThis command is only for admins')
            }
            
            // Check reseller (owner and admin also count as reseller)
            if (plugin.reseller && !m.isOwner && !m.isAdmin && !m.isReseller) {
                return m.reply('*KNOX INFO*\n\nThis command is only for resellers')
            }
            
            // Check group only
            if (plugin.group && !m.isGroup) {
                return m.reply('*KNOX INFO*\n\nThis command can only be used in groups')
            }
            
            // Check private only
            if (plugin.private && m.isGroup) {
                return m.reply('*KNOX INFO*\n\nThis command can only be used in private chat')
            }
            
            // Execute the plugin
            await plugin.execute(sock, m, m.text, m.args, m.command)
        }
        
    } catch (error) {
        console.error('Error in casesBot:', error)
        if (m && m.reply) {
            m.reply('*KNOX INFO*\n\nAn error occurred while executing the command')
        }
    }
}

// Feature flags
export const Feature = {
    public: global.feature?.public ?? true
}

console.log(chalk.green.bold('\n[✓] KNOX MD Bot Loaded Successfully'))
console.log(chalk.white(`[INFO] Total plugins loaded: ${plugins.size}`))
console.log(chalk.white(`[INFO] Commands available: ${Array.from(plugins.keys()).join(', ')}\n`))