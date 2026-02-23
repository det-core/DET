import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['apkmod', 'modapk'],
    category: 'search',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const query = text?.trim()
        
        if (!query) {
            return newsletter.sendText(sock, m.chat, 
                '*APKMOD SEARCH*\n\nUsage: .apkmod <app>\nExample: .apkmod whatsapp', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, `*APKMOD SEARCH*\n\nSearching for "${query}"...`, m)
        
        try {
            const { data } = await axios.get(
                `https://api.nexray.web.id/api/search/apkmod?q=${encodeURIComponent(query)}`,
                { timeout: 30000 }
            )
            
            if (!data?.status || !data?.data?.length) {
                return newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nNo APK found for "${query}"`, m)
            }
            
            const apks = data.data.slice(0, 5)
            
            let resultText = `*APKMOD SEARCH RESULTS*\n\n`
            
            apks.forEach((apk, i) => {
                resultText += `*${i + 1}. ${apk.name}*\n`
                resultText += `Version: ${apk.version || '-'}\n`
                resultText += `Size: ${apk.size || '-'}\n`
                resultText += `Mod: ${apk.mod || 'Original'}\n\n`
            })
            
            resultText += `Use .apkmodget <number> <query> to download`
            
            await newsletter.sendText(sock, m.chat, resultText, m)
            
            global.apkmodSessions = global.apkmodSessions || {}
            global.apkmodSessions[m.sender] = { results: apks, query }
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        }
    }
}