// plugins/ytmp3.js
export default {
    command: ['ytmp3'],
    category: 'download',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const { reply } = m
        
        if (!text) {
            return reply('*KNOX INFO*\n\nUsage: .ytmp3 <youtube url>')
        }
        
        await reply('*KNOX INFO*\n\nDownloading audio...')
        
        // YouTube MP3 logic here
        reply('*KNOX INFO*\n\nFeature coming soon')
    }
}