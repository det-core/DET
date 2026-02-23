import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'

export default {
    command: ['txt2vid', 'txt2video'],
    category: 'ai',
    owner: false,
    admin: false,
    reseller: true,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const prompt = text?.trim()
        
        if (!prompt) {
            return newsletter.sendText(sock, m.chat, 
                '*TEXT TO VIDEO*\n\nUsage: .txt2vid <prompt>\nExample: .txt2vid cat eating banana', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, 
            '*TEXT TO VIDEO*\n\nGenerating video... This may take 1-2 minutes', m
        )
        
        try {
            const { data } = await axios.get(
                `https://api.neoxr.eu/api/txt2vid?prompt=${encodeURIComponent(prompt)}&apikey=Milik-Bot-OurinMD`,
                { timeout: 180000 }
            )
            
            if (!data?.status || !data?.data?.length) {
                return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nFailed to generate video', m)
            }
            
            const videos = data.data
            
            for (let i = 0; i < videos.length; i++) {
                const response = await axios.get(videos[i].url, { 
                    responseType: 'arraybuffer',
                    timeout: 60000
                })
                const videoBuffer = Buffer.from(response.data)
                
                const caption = `*TEXT TO VIDEO RESULT* [${i + 1}/${videos.length}]

Prompt: ${prompt}`

                await newsletter.sendVideo(sock, m.chat, videoBuffer, caption, m)
            }
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        }
    }
}