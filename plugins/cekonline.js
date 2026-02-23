import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['cekonline', 'online'],
    category: 'group',
    owner: false,
    admin: false,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        await newsletter.sendText(sock, m.chat, '*CHECK ONLINE*\n\nChecking online members...', m)
        
        try {
            const groupMetadata = await sock.groupMetadata(m.chat)
            const participants = groupMetadata.participants || []
            
            const presences = {}
            
            const presenceHandler = (update) => {
                if (update.id === m.chat && update.presences) {
                    for (const [jid, presence] of Object.entries(update.presences)) {
                        if (presence.lastKnownPresence === 'available' || 
                            presence.lastKnownPresence === 'composing' || 
                            presence.lastKnownPresence === 'recording') {
                            presences[jid] = presence.lastKnownPresence
                        }
                    }
                }
            }
            
            sock.ev.on('presence.update', presenceHandler)
            
            for (let i = 0; i < participants.length; i += 10) {
                const batch = participants.slice(i, i + 10)
                await Promise.all(batch.map(p => sock.presenceSubscribe(p.id).catch(() => {})))
                await new Promise(r => setTimeout(r, 500))
            }
            
            await new Promise(r => setTimeout(r, 5000))
            
            sock.ev.off('presence.update', presenceHandler)
            
            const onlineMembers = Object.keys(presences)
            
            let resultMsg = `*ONLINE MEMBERS*\n\n`
            resultMsg += `Total: ${onlineMembers.length} online\n\n`
            
            if (onlineMembers.length > 0) {
                onlineMembers.slice(0, 30).forEach((jid, i) => {
                    const number = jid.split('@')[0]
                    let status = ''
                    if (presences[jid] === 'composing') status = ' (typing)'
                    if (presences[jid] === 'recording') status = ' (recording)'
                    resultMsg += `${i + 1}. @${number}${status}\n`
                })
                
                if (onlineMembers.length > 30) {
                    resultMsg += `\n... and ${onlineMembers.length - 30} more`
                }
                
                await sock.sendMessage(m.chat, {
                    text: resultMsg,
                    mentions: onlineMembers.slice(0, 30)
                }, { quoted: m })
            } else {
                resultMsg += 'No members online at the moment'
                await newsletter.sendText(sock, m.chat, resultMsg, m)
            }
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}