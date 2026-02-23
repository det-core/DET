import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['ttstalk', 'tiktokstalk'],
    category: 'stalker',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const username = args[0]?.replace('@', '')
        
        if (!username) {
            return newsletter.sendText(sock, m.chat, 
                '*TIKTOK STALK*\n\nUsage: .ttstalk <username>\nExample: .ttstalk mrbeast', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, `*TIKTOK STALK*\n\nSearching for @${username}...`, m)
        
        try {
            const { data } = await axios.get(
                `https://api.nexray.web.id/api/stalk/tt?username=${encodeURIComponent(username)}`,
                { timeout: 30000 }
            )
            
            if (!data?.status || !data?.data) {
                return newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nUser @${username} not found`, m)
            }
            
            const user = data.data.user
            const stats = data.data.stats
            
            const formatNumber = (num) => {
                if (!num) return '0'
                if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
                if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
                return num.toString()
            }
            
            const profileText = `*TIKTOK STALK*

┏⧉ *Profile Info*
┣𖣠 Username: @${user.uniqueId}
┣𖣠 Nickname: ${user.nickname}
┣𖣠 Bio: ${user.signature || '-'}
┣𖣠 Verified: ${user.verified ? 'Yes' : 'No'}
┣𖣠 Private: ${user.privateAccount ? 'Yes' : 'No'}
┗━━━━━━━━━

┏⧉ *Stats*
┣𖣠 Followers: ${formatNumber(stats.followerCount)}
┣𖣠 Following: ${formatNumber(stats.followingCount)}
┣𖣠 Likes: ${formatNumber(stats.heartCount)}
┣𖣠 Videos: ${formatNumber(stats.videoCount)}
┗━━━━━━━━━

https://tiktok.com/@${user.uniqueId}`

            if (user.avatarLarger) {
                const response = await axios.get(user.avatarLarger, { responseType: 'arraybuffer' })
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