import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['teraboxget', 'tbget'],
    category: 'download',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const index = parseInt(args[0]) - 1
        
        if (isNaN(index) || index < 0) {
            return newsletter.sendText(sock, m.chat, 
                '*TERABOX GET*\n\nUsage: .teraboxget <number>\nExample: .teraboxget 1', m
            )
        }
        
        const sessions = global.teraboxSessions || {}
        const files = sessions[m.sender]
        
        if (!files || !files[index]) {
            return newsletter.sendText(sock, m.chat, 
                '*KNOX INFO*\n\nNo session found. Use .terabox first', m
            )
        }
        
        const file = files[index]
        
        await newsletter.sendText(sock, m.chat, `*TERABOX DOWNLOAD*\n\nDownloading ${file.name}...`, m)
        
        try {
            const { data } = await axios.get(file.url, { responseType: 'arraybuffer' })
            const fileBuffer = Buffer.from(data)
            
            await newsletter.sendDocument(sock, m.chat, fileBuffer, file.name, '', m)
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        }
    }
}