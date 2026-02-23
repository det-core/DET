import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import axios from 'axios'
import AdmZip from 'adm-zip'
import newsletter from '../Bridge/newsletter.js'

const execAsync = promisify(exec)

export default {
    command: ['update', 'gitpull', 'upgrade'],
    category: 'owner',
    owner: true,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        // GitHub repo configuration - CHANGE THESE TO YOUR REPO
        const GITHUB_USER = 'yourusername'
        const GITHUB_REPO = 'yourbotrepo'
        const GITHUB_BRANCH = 'main'
        
        const menu = `┏⧉ *Update Menu*
┣𖣠 .update check
┣𖣠 .update now
┣𖣠 .update force
┣𖣠 .update status
┗━━━━━━━━━━━━━❖`

        const option = args[0]?.toLowerCase()
        
        if (!option || option === 'help') {
            return newsletter.sendText(sock, m.chat, menu, m)
        }
        
        if (option === 'check') {
            await newsletter.sendText(sock, m.chat, '*KNOX UPDATE*\n\nChecking for updates...', m)
            
            try {
                // Get latest commit from GitHub
                const { data: commits } = await axios.get(
                    `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/commits/${GITHUB_BRANCH}`,
                    { timeout: 10000 }
                )
                
                const latestCommit = commits.sha
                const latestMessage = commits.commit.message
                const latestDate = new Date(commits.commit.committer.date).toLocaleString()
                
                // Check current local version
                let currentVersion = 'unknown'
                const versionFile = path.join(process.cwd(), 'version.json')
                if (fs.existsSync(versionFile)) {
                    try {
                        const ver = JSON.parse(fs.readFileSync(versionFile, 'utf8'))
                        currentVersion = ver.commit || ver.version || 'unknown'
                    } catch {}
                }
                
                const isUpdateAvailable = latestCommit !== currentVersion
                
                const statusMsg = `*KNOX UPDATE CHECK*

┏⧉ *Current Version*
┣𖣠 Commit: ${currentVersion.substring(0, 7)}
┗━━━━━━━━━

┏⧉ *Latest Version*
┣𖣠 Commit: ${latestCommit.substring(0, 7)}
┣𖣠 Message: ${latestMessage}
┣𖣠 Date: ${latestDate}
┗━━━━━━━━━

┏⧉ *Status*
┣𖣠 Update ${isUpdateAvailable ? 'AVAILABLE' : 'UP TO DATE'}
┗━━━━━━━━━

${isUpdateAvailable ? 'Use .update now to update' : ''}`

                await newsletter.sendText(sock, m.chat, statusMsg, m)
                
            } catch (error) {
                await newsletter.sendText(sock, m.chat, 
                    `*KNOX UPDATE*\n\nError checking updates: ${error.message}`, 
                    m
                )
            }
            return
        }
        
        if (option === 'status') {
            try {
                const { stdout } = await execAsync('git status')
                await newsletter.sendText(sock, m.chat, 
                    `*KNOX UPDATE STATUS*\n\n\`\`\`${stdout}\`\`\``, 
                    m
                )
            } catch (error) {
                await newsletter.sendText(sock, m.chat, 
                    `*KNOX UPDATE*\n\nGit not initialized or error: ${error.message}`, 
                    m
                )
            }
            return
        }
        
        if (option === 'now' || option === 'force') {
            const isForce = option === 'force'
            
            await newsletter.sendText(sock, m.chat, 
                `*KNOX UPDATE*\n\n${isForce ? 'Force update' : 'Update'} started...\nBot will restart after completion.`, 
                m
            )
            
            try {
                // Create backup directory
                const backupDir = path.join(process.cwd(), 'backup_' + Date.now())
                fs.mkdirSync(backupDir, { recursive: true })
                
                // Backup important files
                const backupItems = ['database', 'KnoxSession', 'config.js']
                for (const item of backupItems) {
                    const sourcePath = path.join(process.cwd(), item)
                    if (fs.existsSync(sourcePath)) {
                        const destPath = path.join(backupDir, item)
                        if (fs.lstatSync(sourcePath).isDirectory()) {
                            fs.cpSync(sourcePath, destPath, { recursive: true })
                        } else {
                            fs.copyFileSync(sourcePath, destPath)
                        }
                    }
                }
                
                await newsletter.sendText(sock, m.chat, '*KNOX UPDATE*\n\nBackup created successfully', m)
                
                // Download latest code
                const zipUrl = `https://github.com/${GITHUB_USER}/${GITHUB_REPO}/archive/refs/heads/${GITHUB_BRANCH}.zip`
                const zipPath = path.join(process.cwd(), 'update.zip')
                
                await newsletter.sendText(sock, m.chat, '*KNOX UPDATE*\n\nDownloading latest version...', m)
                
                const response = await axios({
                    method: 'GET',
                    url: zipUrl,
                    responseType: 'arraybuffer',
                    timeout: 300000
                })
                
                fs.writeFileSync(zipPath, response.data)
                
                await newsletter.sendText(sock, m.chat, '*KNOX UPDATE*\n\nExtracting files...', m)
                
                // Extract zip
                const zip = new AdmZip(zipPath)
                const extractPath = path.join(process.cwd(), 'temp_update')
                zip.extractAllTo(extractPath, true)
                
                // Get extracted folder name
                const extractedFolders = fs.readdirSync(extractPath)
                const sourceFolder = path.join(extractPath, extractedFolders[0])
                
                // Files/folders to exclude from update
                const excludeItems = ['database', 'KnoxSession', 'node_modules', '.env', 'config.js']
                
                // Copy new files
                const copyRecursive = (src, dest) => {
                    const entries = fs.readdirSync(src, { withFileTypes: true })
                    
                    for (const entry of entries) {
                        if (excludeItems.includes(entry.name)) continue
                        
                        const srcPath = path.join(src, entry.name)
                        const destPath = path.join(dest, entry.name)
                        
                        if (entry.isDirectory()) {
                            if (!fs.existsSync(destPath)) {
                                fs.mkdirSync(destPath, { recursive: true })
                            }
                            copyRecursive(srcPath, destPath)
                        } else {
                            fs.copyFileSync(srcPath, destPath)
                        }
                    }
                }
                
                copyRecursive(sourceFolder, process.cwd())
                
                // Clean up temp files
                fs.rmSync(extractPath, { recursive: true, force: true })
                fs.unlinkSync(zipPath)
                
                await newsletter.sendText(sock, m.chat, '*KNOX UPDATE*\n\nInstalling dependencies...', m)
                
                // Run npm install
                const { stdout, stderr } = await execAsync('npm install', { 
                    cwd: process.cwd(),
                    timeout: 300000 
                })
                
                if (stderr && !stderr.includes('npm WARN')) {
                    console.error('NPM Install Error:', stderr)
                }
                
                await newsletter.sendText(sock, m.chat, 
                    `*KNOX UPDATE*\n\n✅ Update completed successfully!\n\nRestarting bot in 3 seconds...`, 
                    m
                )
                
                // Save update info
                try {
                    const { data: commits } = await axios.get(
                        `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/commits/${GITHUB_BRANCH}`
                    )
                    fs.writeFileSync('version.json', JSON.stringify({
                        commit: commits.sha,
                        updatedAt: new Date().toISOString(),
                        message: commits.commit.message
                    }, null, 2))
                } catch {}
                
                // Restart bot
                setTimeout(() => {
                    process.exit(0)
                }, 3000)
                
            } catch (error) {
                console.error('Update Error:', error)
                
                await newsletter.sendText(sock, m.chat, 
                    `*KNOX UPDATE*\n\n❌ Update failed!\nError: ${error.message}\n\nCheck backup folder for recovery.`, 
                    m
                )
                
                // Try to restore from backup if update failed
                const backupDirs = fs.readdirSync(process.cwd()).filter(f => f.startsWith('backup_'))
                if (backupDirs.length > 0) {
                    const latestBackup = backupDirs.sort().reverse()[0]
                    await newsletter.sendText(sock, m.chat, 
                        `*KNOX UPDATE*\n\nBackup available: ${latestBackup}\nManual restore may be needed.`, 
                        m
                    )
                }
            }
            return
        }
        
        // Default: show menu
        await newsletter.sendText(sock, m.chat, menu, m)
    }
}