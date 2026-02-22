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
        const { reply } = m
        
        if (!text) {
            return reply('*KNOX INFO*\n\nUsage: .mediafire <url>\nExample: .mediafire https://www.mediafire.com/file/xxx/file.zip')
        }
        
        if (!text.includes('mediafire.com')) {
            return reply('*KNOX INFO*\n\nInvalid Mediafire URL')
        }
        
        await reply('*KNOX INFO*\n\nDownloading...')
        
        try {
            const result = await mediafiredl(text)
            
            if (!result || !result.download) {
                return reply('*KNOX INFO*\n\nFailed to get download link')
            }
            
            const caption = `*MEDIAFIRE DOWNLOAD*
            
Filename: ${result.filename}
Size: ${result.filesize}
Uploaded: ${result.uploaded}

Link: ${result.download}`

            await reply(caption)
            
        } catch (error) {
            reply('*KNOX INFO*\n\nError downloading file')
        }
    }
}