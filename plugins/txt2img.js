import newsletter from '../Bridge/newsletter.js'
import { unrestrictedai } from '../lib/txt2img.js'
import axios from 'axios'

export default {
    command: ['txt2img', 'imagine'],
    category: 'ai',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        const prompt = text?.trim()
        
        if (!prompt) {
            const helpMsg = `*TEXT TO IMAGE*

┏⧉ *Usage*
┣𖣠 .txt2img <prompt> | <style>
┣𖣠 .txt2img <prompt>
┗━━━━━━━━━

┏⧉ *Styles*
┣𖣠 photorealistic
┣𖣠 digital-art
┣𖣠 impressionist
┣𖣠 anime
┣𖣠 fantasy
┣𖣠 sci-fi
┣𖣠 vintage
┗━━━━━━━━━

Example: .txt2img beautiful sunset | anime`
            return newsletter.sendText(sock, m.chat, helpMsg, m)
        }
        
        const [promptText, styleInput] = prompt.split('|').map(s => s.trim())
        const styles = ['photorealistic', 'digital-art', 'impressionist', 'anime', 'fantasy', 'sci-fi', 'vintage']
        const style = styles.includes(styleInput) ? styleInput : 'anime'
        
        await newsletter.sendText(sock, m.chat, '*TEXT TO IMAGE*\n\nGenerating image... This may take a moment', m)
        
        try {
            const imageUrl = await unrestrictedai(promptText, style)
            
            if (!imageUrl) {
                return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nFailed to generate image', m)
            }
            
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' })
            const imageBuffer = Buffer.from(response.data)
            
            const caption = `*TEXT TO IMAGE RESULT*

Prompt: ${promptText}
Style: ${style}`

            await newsletter.sendImage(sock, m.chat, imageBuffer, caption, m)
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        }
    }
}