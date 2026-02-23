import newsletter from '../Bridge/newsletter.js'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export default {
    command: ['lookup', 'dnslookup'],
    category: 'stalker',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        let domain = args[0]
        
        if (!domain) {
            return newsletter.sendText(sock, m.chat, 
                '*DNS LOOKUP*\n\nUsage: .lookup <domain>\nExample: .lookup google.com', m
            )
        }
        
        domain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]
        
        await newsletter.sendText(sock, m.chat, `*DNS LOOKUP*\n\nLooking up ${domain}...`, m)
        
        try {
            // Get A records
            const { stdout: aRecords } = await execAsync(`nslookup -type=A ${domain} | grep "Address:" | grep -v "#" | awk '{print $2}'`)
            
            // Get MX records
            const { stdout: mxRecords } = await execAsync(`nslookup -type=MX ${domain} | grep "mail exchanger" | awk '{print $5, $6}'`)
            
            // Get NS records
            const { stdout: nsRecords } = await execAsync(`nslookup -type=NS ${domain} | grep "nameserver" | awk '{print $3}'`)
            
            // Get TXT records
            const { stdout: txtRecords } = await execAsync(`nslookup -type=TXT ${domain} | grep "text" | awk -F'"' '{print $2}' | head -5`)
            
            let resultText = `*DNS LOOKUP RESULT*

Domain: ${domain}

┏⧉ *A Records*
${aRecords ? aRecords.split('\n').filter(l => l.trim()).map(ip => `┣𖣠 ${ip}`).join('\n') : '┣𖣠 No A records found'}
┗━━━━━━━━━

┏⧉ *MX Records*
${mxRecords ? mxRecords.split('\n').filter(l => l.trim()).map(mx => `┣𖣠 ${mx}`).join('\n') : '┣𖣠 No MX records found'}
┗━━━━━━━━━

┏⧉ *NS Records*
${nsRecords ? nsRecords.split('\n').filter(l => l.trim()).map(ns => `┣𖣠 ${ns}`).join('\n') : '┣𖣠 No NS records found'}
┗━━━━━━━━━

┏⧉ *TXT Records*
${txtRecords ? txtRecords.split('\n').filter(l => l.trim()).slice(0, 5).map(txt => `┣𖣠 ${txt.substring(0, 50)}${txt.length > 50 ? '...' : ''}`).join('\n') : '┣𖣠 No TXT records found'}
┗━━━━━━━━━`

            await newsletter.sendText(sock, m.chat, resultText, m)
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        }
    }
}