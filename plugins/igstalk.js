import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['igstalk', 'instagramstalk'],
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
                '*INSTAGRAM STALK*\n\nUsage: .igstalk <username>\nExample: .igstalk cristiano', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, `*INSTAGRAM STALK*\n\nSearching for @${username}...`, m)
        
        try {
            const { data } = await axios.get(
                `https://api.nexray.web.id/api/stalk/ig?username=${encodeURIComponent(username)}`,
                { timeout: 30000 }
            )
            
            if (!data?.status || !data?.data) {
                return newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nUser @${username} not found`, m)
            }
            
            const user = data.data
            
            const profileText = `*INSTAGRAM STALK*

┏⧉ *Profile Info*
┣𖣠 Username: @${user.username}
┣𖣠 Full Name: ${user.full_name || '-'}
┣𖣠 Bio: ${user.biography || '-'}
┣𖣠 Verified: ${user.is_verified ? 'Yes' : 'No'}
┣𖣠 Private: ${user.is_private ? 'Yes' : 'No'}
┗━━━━━━━━━

┏⧉ *Stats*
┣𖣠 Posts: ${user.media_count || 0}
┣𖣠 Followers: ${user.follower_count || 0}
┣𖣠 Following: ${user.following_count || 0}
┗━━━━━━━━━

https://instagram.com/${user.username}`

            if (user.profile_pic_url_hd) {
                const response = await axios.get(user.profile_pic_url_hd, { responseType: 'arraybuffer' })
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