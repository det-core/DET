import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['githubdl', 'gitdl'],
    category: 'download',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        let repo = text?.trim()
        
        if (!repo) {
            return newsletter.sendText(sock, m.chat, 
                '*GITHUB DOWNLOAD*\n\nUsage: .githubdl <user>/<repo>\nExample: .githubdl torvalds/linux', m
            )
        }
        
        if (repo.includes('github.com')) {
            const match = repo.match(/github\.com\/([^\/]+\/[^\/]+)/)
            if (match) repo = match[1]
        }
        
        repo = repo.replace(/\.git$/, '')
        
        await newsletter.sendText(sock, m.chat, `*GITHUB DOWNLOAD*\n\nFetching ${repo}...`, m)
        
        try {
            const [user, repoName] = repo.split('/')
            
            const { data } = await axios.get(
                `https://api.github.com/repos/${user}/${repoName}`,
                { timeout: 30000 }
            )
            
            const zipUrl = `https://github.com/${user}/${repoName}/archive/refs/heads/${data.default_branch}.zip`
            
            const resultText = `*GITHUB REPOSITORY*

┏⧉ *Info*
┣𖣠 Name: ${data.full_name}
┣𖣠 Description: ${data.description || '-'}
┣𖣠 Stars: ${data.stargazers_count}
┣𖣠 Forks: ${data.forks_count}
┣𖣠 Language: ${data.language || '-'}
┣𖣠 Branch: ${data.default_branch}
┗━━━━━━━━━

Downloading repository as ZIP...`

            await newsletter.sendText(sock, m.chat, resultText, m)
            
            const zipResponse = await axios.get(zipUrl, { 
                responseType: 'arraybuffer',
                timeout: 120000
            })
            const zipBuffer = Buffer.from(zipResponse.data)
            
            const fileName = `${repoName}-${data.default_branch}.zip`
            
            await newsletter.sendDocument(sock, m.chat, zipBuffer, fileName, '', m)
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        }
    }
}