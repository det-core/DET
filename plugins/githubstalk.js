import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['ghstalk', 'githubstalk'],
    category: 'stalker',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const username = args[0]
        
        if (!username) {
            return newsletter.sendText(sock, m.chat, 
                '*GITHUB STALK*\n\nUsage: .ghstalk <username>\nExample: .ghstalk torvalds', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, `*GITHUB STALK*\n\nSearching for ${username}...`, m)
        
        try {
            const { data } = await axios.get(
                `https://api.github.com/users/${username}`,
                { timeout: 30000 }
            )
            
            if (!data || !data.id) {
                return newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nUser ${username} not found`, m)
            }
            
            const profileText = `*GITHUB STALK*

┏⧉ *Profile Info*
┣𖣠 Username: ${data.login}
┣𖣠 Name: ${data.name || '-'}
┣𖣠 Bio: ${data.bio || '-'}
┣𖣠 Company: ${data.company || '-'}
┣𖣠 Location: ${data.location || '-'}
┣𖣠 Blog: ${data.blog || '-'}
┣𖣠 Twitter: ${data.twitter_username || '-'}
┗━━━━━━━━━

┏⧉ *Stats*
┣𖣠 Public Repos: ${data.public_repos}
┣𖣠 Public Gists: ${data.public_gists}
┣𖣠 Followers: ${data.followers}
┣𖣠 Following: ${data.following}
┣𖣠 Created: ${new Date(data.created_at).toLocaleDateString()}
┗━━━━━━━━━

${data.html_url}`

            if (data.avatar_url) {
                const response = await axios.get(data.avatar_url, { responseType: 'arraybuffer' })
                const imageBuffer = Buffer.from(response.data)
                await newsletter.sendImage(sock, m.chat, imageBuffer, profileText, m)
            } else {
                await newsletter.sendText(sock, m.chat, profileText, m)
            }
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        }
    }
}