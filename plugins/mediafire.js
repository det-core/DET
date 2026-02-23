import newsletter from '../Bridge/newsletter.js'
import { mediafiredl } from '../lib/mediafire.js'

export default {
    command: ['mediafire', 'mf'],
    category: 'download',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        if (!text) {
            return newsletter.sendText(sock, m.chat, 
                '*KNOX INFO*\n\nUsage: .mediafire <url>\nExample: .mediafire https://www.mediafire.com/file/xxx/file.zip', 
                m
            )
        }
        
        if (!text.includes('mediafire.com')) {
            return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nInvalid Mediafire URL', m)
        }
        
        await newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nDownloading...', m)
        
        try {
            const result = await mediafiredl(text)
            
            if (!result || !result.download) {
                return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nFailed to get download link', m)
            }
            
            const caption = `*MEDIAFIRE DOWNLOAD*
            
Filename: ${result.filename}
Size: ${result.filesize}
Uploaded: ${result.uploaded}

Link: ${result.download}`

            await newsletter.sendText(sock, m.chat, caption, m)
            
        } catch (error) {
            newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nError downloading file', m)
        }
    }
}