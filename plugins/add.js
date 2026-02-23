import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['add', 'addmember', 'invite'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        if (!m.isGroup) {
            return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nThis command can only be used in groups', m)
        }
        
        if (args.length === 0) {
            const helpMsg = `┏⧉ *Add Member Help*
┣𖣠 Usage: .add <number>
┣𖣠 Example: .add 2347030626048
┣𖣠 Multiple: .add 234701 234702 234703
┗━━━━━━━━━━━━━❖`
            return newsletter.sendText(sock, m.chat, helpMsg, m)
        }
        
        let numbers = []
        for (const arg of args) {
            let num = arg.replace(/[^0-9]/g, '')
            if (num.startsWith('0')) {
                num = '234' + num.slice(1)
            }
            if (num.length >= 10) {
                numbers.push(num + '@s.whatsapp.net')
            }
        }
        
        if (numbers.length === 0) {
            return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nInvalid number format', m)
        }
        
        try {
            const results = await sock.groupParticipantsUpdate(m.chat, numbers, 'add')
            
            let success = []
            let failed = []
            
            for (let i = 0; i < results.length; i++) {
                if (results[i].status === '200') {
                    success.push(numbers[i].split('@')[0])
                } else {
                    failed.push(numbers[i].split('@')[0])
                }
            }
            
            let resultMsg = `*ADD MEMBER RESULT*\n\n`
            if (success.length > 0) {
                resultMsg += `✓ Added: ${success.join(', ')}\n`
            }
            if (failed.length > 0) {
                resultMsg += `✗ Failed: ${failed.join(', ')}\n`
            }
            
            await newsletter.sendText(sock, m.chat, resultMsg, m)
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}