import fs from 'fs'
import path from 'path'
import axios from 'axios'
import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['autoupdate'],
    category: 'owner',
    owner: true,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const option = args[0]?.toLowerCase()
        
        // GitHub repo configuration - CHANGE THESE TO YOUR REPO
        const GITHUB_USER = 'det-core'
        const GITHUB_REPO = 'yourbotrepo'
        const GITHUB_BRANCH = 'main'
        
        // Load auto-update config
        const configPath = path.join(process.cwd(), 'autoupdate.json')
        let autoUpdateConfig = {
            enabled: false,
            checkInterval: 3600000, // 1 hour
            lastCheck: 0,
            lastUpdate: 0,
            autoRestart: true
        }
        
        if (fs.existsSync(configPath)) {
            try {
                autoUpdateConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'))
            } catch {}
        }
        
        if (!option) {
            const status = autoUpdateConfig.enabled ? 'ON' : 'OFF'
            const menu = `*AUTO UPDATE SETTINGS*

┏⧉ *Current Settings*
┣𖣠 Status: *${status}*
┣𖣠 Check Interval: ${autoUpdateConfig.checkInterval / 3600000} hours
┣𖣠 Auto Restart: ${autoUpdateConfig.autoRestart ? 'Yes' : 'No'}
┣𖣠 Last Check: ${autoUpdateConfig.lastCheck ? new Date(autoUpdateConfig.lastCheck).toLocaleString() : 'Never'}
┣𖣠 Last Update: ${autoUpdateConfig.lastUpdate ? new Date(autoUpdateConfig.lastUpdate).toLocaleString() : 'Never'}
┗━━━━━━━━━

┏⧉ *Commands*
┣𖣠 .autoupdate on
┣𖣠 .autoupdate off
┣𖣠 .autoupdate interval <hours>
┣𖣠 .autoupdate restart on/off
┣𖣠 .autoupdate checknow
┗━━━━━━━━━`

            return newsletter.sendText(sock, m.chat, menu, m)
        }
        
        if (option === 'on') {
            autoUpdateConfig.enabled = true
            fs.writeFileSync(configPath, JSON.stringify(autoUpdateConfig, null, 2))
            return newsletter.sendText(sock, m.chat, '*AUTO UPDATE*\n\nAuto update has been ENABLED', m)
        }
        
        if (option === 'off') {
            autoUpdateConfig.enabled = false
            fs.writeFileSync(configPath, JSON.stringify(autoUpdateConfig, null, 2))
            return newsletter.sendText(sock, m.chat, '*AUTO UPDATE*\n\nAuto update has been DISABLED', m)
        }
        
        if (option === 'interval') {
            const hours = parseInt(args[1])
            if (!hours || hours < 1 || hours > 24) {
                return newsletter.sendText(sock, m.chat, '*AUTO UPDATE*\n\nInvalid interval. Use 1-24 hours', m)
            }
            
            autoUpdateConfig.checkInterval = hours * 3600000
            fs.writeFileSync(configPath, JSON.stringify(autoUpdateConfig, null, 2))
            return newsletter.sendText(sock, m.chat, `*AUTO UPDATE*\n\nCheck interval set to ${hours} hours`, m)
        }
        
        if (option === 'restart') {
            const restartOption = args[1]?.toLowerCase()
            if (restartOption === 'on') {
                autoUpdateConfig.autoRestart = true
            } else if (restartOption === 'off') {
                autoUpdateConfig.autoRestart = false
            } else {
                return newsletter.sendText(sock, m.chat, '*AUTO UPDATE*\n\nUsage: .autoupdate restart on/off', m)
            }
            
            fs.writeFileSync(configPath, JSON.stringify(autoUpdateConfig, null, 2))
            return newsletter.sendText(sock, m.chat, 
                `*AUTO UPDATE*\n\nAuto restart ${autoUpdateConfig.autoRestart ? 'ENABLED' : 'DISABLED'}`, 
                m
            )
        }
        
        if (option === 'checknow') {
            await newsletter.sendText(sock, m.chat, '*AUTO UPDATE*\n\nChecking for updates...', m)
            
            try {
                const { data: commits } = await axios.get(
                    `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/commits/${GITHUB_BRANCH}`,
                    { timeout: 10000 }
                )
                
                const latestCommit = commits.sha
                
                // Check current version
                let currentVersion = 'unknown'
                const versionFile = path.join(process.cwd(), 'version.json')
                if (fs.existsSync(versionFile)) {
                    try {
                        const ver = JSON.parse(fs.readFileSync(versionFile, 'utf8'))
                        currentVersion = ver.commit || ver.version || 'unknown'
                    } catch {}
                }
                
                const isUpdateAvailable = latestCommit !== currentVersion
                
                autoUpdateConfig.lastCheck = Date.now()
                if (isUpdateAvailable && autoUpdateConfig.enabled) {
                    autoUpdateConfig.lastUpdate = Date.now()
                    
                    await newsletter.sendText(sock, m.chat, 
                        '*AUTO UPDATE*\n\nUpdate available! Running update...', 
                        m
                    )
                    
                    // Trigger update
                    const updatePlugin = await import('./update.js')
                    await updatePlugin.default.execute(sock, m, 'now', ['now'])
                } else {
                    await newsletter.sendText(sock, m.chat, 
                        `*AUTO UPDATE*\n\n${isUpdateAvailable ? 'Update available' : 'Bot is up to date'}`, 
                        m
                    )
                }
                
                fs.writeFileSync(configPath, JSON.stringify(autoUpdateConfig, null, 2))
                
            } catch (error) {
                await newsletter.sendText(sock, m.chat, 
                    `*AUTO UPDATE*\n\nCheck failed: ${error.message}`, 
                    m
                )
            }
            return
        }
        
        await newsletter.sendText(sock, m.chat, 'Unknown command. Use .autoupdate for help', m)
    }
}