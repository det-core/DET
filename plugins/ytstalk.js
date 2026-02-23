import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['ytstalk', 'youtubestalk'],
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
                '*YOUTUBE STALK*\n\nUsage: .ytstalk <channel>\nExample: .ytstalk mrbeast', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, `*YOUTUBE STALK*\n\nSearching for ${username}...`, m)
        
        try {
            const { data } = await axios.get(
                `https://api.nexray.web.id/api/stalk/yt?username=${encodeURIComponent(username)}`,
                { timeout: 30000 }
            )
            
            if (!data?.status || !data?.data) {
                return newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nChannel ${username} not found`, m)
            }
            
            const channel = data.data.channelMetadata
            const videos = data.data.videoDataList || []
            
            const formatNumber = (num) => {
                if (!num) return '0'
                if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
                if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
                return num.toString()
            }
            
            let resultText = `*YOUTUBE STALK*

┏⧉ *Channel Info*
┣𖣠 Channel: ${channel.title || '-'}
┣𖣠 Username: @${channel.username || '-'}
┣𖣠 Subscribers: ${formatNumber(channel.subscriberCount)}
┣𖣠 Total Videos: ${formatNumber(channel.videoCount)}
┗━━━━━━━━━

┏⧉ *Latest Videos*
${videos.slice(0, 3).map((v, i) => `┣𖣠 ${i+1}. ${v.title}\n┃   Views: ${formatNumber(v.viewCount)}`).join('\n')}
┗━━━━━━━━━

${channel.description ? `┏⧉ *Description*\n┣𖣠 ${channel.description.substring(0, 100)}${channel.description.length > 100 ? '...' : ''}\n┗━━━━━━━━━` : ''}`

            if (channel.avatarUrl) {
                const response = await axios.get(channel.avatarUrl, { responseType: 'arraybuffer' })
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