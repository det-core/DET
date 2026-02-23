import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['terabox', 'tb'],
    category: 'download',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const url = text?.trim()
        
        if (!url) {
            return newsletter.sendText(sock, m.chat, 
                '*TERABOX DOWNLOAD*\n\nUsage: .terabox <url>\nExample: .terabox https://1024terabox.com/s/xxx', m
            )
        }
        
        if (!url.includes('terabox') && !url.includes('1024terabox')) {
            return newsletter.sendText(sock, m.chat, 
                '*KNOX INFO*\n\nInvalid Terabox URL', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, '*TERABOX DOWNLOAD*\n\nFetching files...', m)
        
        try {
            const { data } = await axios.get(
                `https://api.nexray.web.id/api/download/terabox?url=${encodeURIComponent(url)}`,
                { timeout: 60000 }
            )
            
            if (!data?.status || !data?.data?.length) {
                return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nNo files found', m)
            }
            
            const files = data.data
            
            let resultText = `*TERABOX FILES*\n\nFound ${files.length} file(s):\n\n`
            
            files.forEach((file, i) => {
                resultText += `${i + 1}. ${file.name || 'File'} (${file.size || 'Unknown'})\n`
            })
            
            resultText += `\nUse .teraboxget <number> to download a file`
            
            await newsletter.sendText(sock, m.chat, resultText, m)
            
            global.teraboxSessions = global.teraboxSessions || {}
            global.teraboxSessions[m.sender] = files
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        }
    }
}