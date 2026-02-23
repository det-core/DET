import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['discordstalk', 'dcstalk'],
    category: 'stalker',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const userId = args[0]
        
        if (!userId || !/^\d+$/.test(userId)) {
            return newsletter.sendText(sock, m.chat, 
                '*DISCORD STALK*\n\nUsage: .discordstalk <userid>\nExample: .discordstalk 297574907510784000', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, `*DISCORD STALK*\n\nLooking up ${userId}...`, m)
        
        try {
            const { data } = await axios.get(
                `https://api.nexray.web.id/api/stalk/discord?id=${userId}`,
                { timeout: 30000 }
            )
            
            if (!data?.status || !data?.data) {
                return newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nUser ID ${userId} not found`, m)
            }
            
            const user = data.data
            
            const createdDate = user.created_at 
                ? new Date(user.created_at).toLocaleDateString()
                : '-'
            
            const resultText = `*DISCORD STALK*

┏⧉ *Profile Info*
┣𖣠 Username: ${user.username || '-'}
┣𖣠 Display Name: ${user.global_name || '-'}
┣𖣠 Discriminator: #${user.discriminator || '0'}
┣𖣠 User ID: ${user.id}
┣𖣠 Created: ${createdDate}
┗━━━━━━━━━`

            if (user.avatar_url) {
                const response = await axios.get(user.avatar_url, { responseType: 'arraybuffer' })
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