import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['pintereststalk', 'pinstalk'],
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
                '*PINTEREST STALK*\n\nUsage: .pintereststalk <username>\nExample: .pintereststalk shiroko', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, `*PINTEREST STALK*\n\nSearching for ${username}...`, m)
        
        try {
            const { data } = await axios.get(
                `https://api.nexray.web.id/api/stalk/pinterest?username=${encodeURIComponent(username)}`,
                { timeout: 30000 }
            )
            
            if (!data?.status || !data?.data) {
                return newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nUser ${username} not found`, m)
            }
            
            const user = data.data
            
            const resultText = `*PINTEREST STALK*

┏⧉ *Profile Info*
┣𖣠 Username: ${user.username || '-'}
┣𖣠 Full Name: ${user.full_name || '-'}
┣𖣠 Bio: ${user.bio || '-'}
┗━━━━━━━━━

┏⧉ *Stats*
┣𖣠 Pins: ${user.stats?.pins || 0}
┣𖣠 Followers: ${user.stats?.followers || 0}
┣𖣠 Following: ${user.stats?.following || 0}
┣𖣠 Boards: ${user.stats?.boards || 0}
┗━━━━━━━━━

${user.profile_url || `https://pinterest.com/${username}/`}`

            if (user.image?.original) {
                const response = await axios.get(user.image.original, { responseType: 'arraybuffer' })
                const imageBuffer = Buffer.from(response.data)
                await newsletter.sendImage(sock, m.chat, imageBuffer, resultText, m)
            } else {
                await newsletter.sendText(sock, m.chat, resultText, m)
            }
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        }
    }
}