import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['apkmodget'],
    category: 'search',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const sessions = global.apkmodSessions || {}
        const session = sessions[m.sender]
        
        const no = parseInt(args[0])
        const query = args.slice(1).join(' ')
        
        if (!no || (!query && !session)) {
            return newsletter.sendText(sock, m.chat, 
                '*APKMOD GET*\n\nUsage: .apkmodget <number> <query>', m
            )
        }
        
        if (!session && !query) {
            return newsletter.sendText(sock, m.chat, 
                '*KNOX INFO*\n\nNo search session. Use .apkmod first', m
            )
        }
        
        const searchQuery = query || session.query
        
        await newsletter.sendText(sock, m.chat, `*APKMOD GET*\n\nDownloading...`, m)
        
        try {
            const { data } = await axios.get(
                `https://api.nexray.web.id/api/search/apkmod-get?q=${encodeURIComponent(searchQuery)}&no=${no}`,
                { timeout: 60000 }
            )
            
            if (!data?.status || !data?.data) {
                return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nFailed to download APK', m)
            }
            
            const apk = data.data
            
            let infoText = `*APKMOD DETAILS*

Name: ${apk.name}
Version: ${apk.version}
Size: ${apk.size}
Mod: ${apk.mod}
Author: ${apk.author}
Category: ${apk.category}

Downloading APK...`

            await newsletter.sendText(sock, m.chat, infoText, m)
            
            if (data.file?.url) {
                const response = await axios.get(data.file.url, { 
                    responseType: 'arraybuffer',
                    timeout: 120000
                })
                const fileBuffer = Buffer.from(response.data)
                
                await newsletter.sendDocument(sock, m.chat, fileBuffer, `${apk.name}.apk`, '', m)
            } else {
                await newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nDownload link not available', m)
            }
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        }
    }
}