export default {
    command: ['ytmp4'],
    category: 'download',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        if (!text) {
            return m.reply('*KNOX INFO*\n\nUsage: .ytmp4 <youtube url>')
        }
        m.reply('*KNOX INFO*\n\nYouTube MP4 downloader coming soon!')
    }
}