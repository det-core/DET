import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['robloxstalk', 'rbxstalk'],
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
                '*ROBLOX STALK*\n\nUsage: .robloxstalk <username>\nExample: .robloxstalk Linkmon99', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, `*ROBLOX STALK*\n\nSearching for ${username}...`, m)
        
        try {
            const { data } = await axios.get(
                `https://api.nexray.web.id/api/stalk/roblox?username=${encodeURIComponent(username)}`,
                { timeout: 30000 }
            )
            
            if (!data?.status || !data?.data) {
                return newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nUser ${username} not found`, m)
            }
            
            const user = data.data
            
            const formatNumber = (num) => {
                if (!num) return '0'
                if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
                if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
                return num.toString()
            }
            
            const resultText = `*ROBLOX STALK*

┏⧉ *Profile Info*
┣𖣠 Username: ${user.name || '-'}
┣𖣠 Display Name: ${user.displayName || '-'}
┣𖣠 User ID: ${user.id || '-'}
┣𖣠 Verified: ${user.hasVerifiedBadge ? 'Yes' : 'No'}
┣𖣠 Banned: ${user.isBanned ? 'Yes' : 'No'}
┗━━━━━━━━━

┏⧉ *Stats*
┣𖣠 Friends: ${formatNumber(user.friends)}
┣𖣠 Followers: ${formatNumber(user.followers)}
┣𖣠 Following: ${formatNumber(user.followings)}
┣𖣠 Badges: ${user.badges?.length || 0}
┣𖣠 Games: ${user.games?.length || 0}
┗━━━━━━━━━

┏⧉ *Bio*
┣𖣠 ${user.description?.substring(0, 100) || '-'}${user.description?.length > 100 ? '...' : ''}
┗━━━━━━━━━

https://roblox.com/users/${user.id}/profile`

            if (user.avatar) {
                const response = await axios.get(user.avatar, { responseType: 'arraybuffer' })
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