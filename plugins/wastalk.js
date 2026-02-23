import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['wastalk', 'stalkwa'],
    category: 'stalker',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        let number = args[0]?.replace(/\D/g, '')
        
        if (!number && m.quoted) {
            number = m.quoted.sender.split('@')[0]
        }
        
        if (!number) {
            return newsletter.sendText(sock, m.chat, 
                '*WA STALK*\n\nUsage: .wastalk <number> or reply to user\'s message', m
            )
        }
        
        const jid = number + '@s.whatsapp.net'
        
        await newsletter.sendText(sock, m.chat, `*WA STALK*\n\nLooking up ${number}...`, m)
        
        try {
            const [onWhatsApp, profilePic, status] = await Promise.allSettled([
                sock.onWhatsApp(jid),
                sock.profilePictureUrl(jid, 'image').catch(() => null),
                sock.fetchStatus(jid).catch(() => null)
            ])
            
            const waInfo = onWhatsApp.status === 'fulfilled' ? onWhatsApp.value[0] : null
            
            if (!waInfo || !waInfo.exists) {
                return newsletter.sendText(sock, m.chat, 
                    `*KNOX INFO*\n\nNumber ${number} is not on WhatsApp`, m
                )
            }
            
            const name = await sock.getName(jid)
            
            const resultText = `*WHATSAPP STALK*

┏⧉ *Profile Info*
┣𖣠 Number: ${number}
┣𖣠 Name: ${name || '-'}
┣𖣠 Status: ${status.value?.status || '-'}
┣𖣠 Last Seen: ${status.value?.setAt ? new Date(status.value.setAt).toLocaleString() : '-'}
┗━━━━━━━━━

wa.me/${number}`

            if (profilePic.value) {
                const response = await axios.get(profilePic.value, { responseType: 'arraybuffer' })
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