import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['ffstalk', 'freefire'],
    category: 'stalker',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const id = args[0]
        
        if (!id) {
            return newsletter.sendText(sock, m.chat, 
                '*FREE FIRE STALK*\n\nUsage: .ffstalk <id>\nExample: .ffstalk 775417067', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, `*FREE FIRE STALK*\n\nLooking up ID ${id}...`, m)
        
        try {
            const { data } = await axios.get(
                `https://api.nexray.web.id/api/stalk/ff?id=${id}`,
                { timeout: 30000 }
            )
            
            if (!data?.status || !data?.data) {
                return newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nID ${id} not found`, m)
            }
            
            const player = data.data
            
            const resultText = `*FREE FIRE STALK*

┏⧉ *Player Info*
┣𖣠 Nickname: ${player.nickname || '-'}
┣𖣠 User ID: ${player.userId || id}
┣𖣠 Game: ${player.game || 'Free Fire'}
┗━━━━━━━━━`

            if (player.image) {
                const response = await axios.get(player.image, { responseType: 'arraybuffer' })
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