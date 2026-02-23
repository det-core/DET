import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['ipwho', 'ipinfo'],
    category: 'stalker',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const ip = args[0]
        
        if (!ip) {
            return newsletter.sendText(sock, m.chat, 
                '*IP LOOKUP*\n\nUsage: .ipwho <ip>\nExample: .ipwho 8.8.8.8', m
            )
        }
        
        const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
        if (!ipRegex.test(ip)) {
            return newsletter.sendText(sock, m.chat, 
                '*KNOX INFO*\n\nInvalid IP address format', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, `*IP LOOKUP*\n\nLooking up ${ip}...`, m)
        
        try {
            const { data } = await axios.get(`https://ipwho.is/${ip}`, { timeout: 10000 })
            
            if (!data.success) {
                return newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nIP ${ip} not found`, m)
            }
            
            const infoText = `*IP LOOKUP RESULT*

┏⧉ *Location*
┣𖣠 IP: ${data.ip}
┣𖣠 Country: ${data.country} (${data.country_code})
┣𖣠 City: ${data.city || '-'}
┣𖣠 Region: ${data.region || '-'}
┣𖣠 Continent: ${data.continent || '-'}
┣𖣠 Postal: ${data.postal || '-'}
┣𖣠 Timezone: ${data.timezone?.id || '-'}
┗━━━━━━━━━

┏⧉ *Connection*
┣𖣠 ISP: ${data.connection?.isp || '-'}
┣𖣠 Organization: ${data.connection?.org || '-'}
┣𖣠 ASN: ${data.connection?.asn || '-'}
┗━━━━━━━━━

┏⧉ *Security*
┣𖣠 VPN: ${data.security?.vpn ? 'Yes' : 'No'}
┣𖣠 Proxy: ${data.security?.proxy ? 'Yes' : 'No'}
┣𖣠 Tor: ${data.security?.tor ? 'Yes' : 'No'}
┗━━━━━━━━━`

            if (data.latitude && data.longitude) {
                await sock.sendMessage(m.chat, {
                    location: {
                        degreesLatitude: data.latitude,
                        degreesLongitude: data.longitude
                    }
                }, { quoted: m })
            }
            
            await newsletter.sendText(sock, m.chat, infoText, m)
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        }
    }
}