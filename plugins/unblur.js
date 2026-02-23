import newsletter from '../Bridge/newsletter.js'
import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'
import path from 'path'
import { randomBytes, randomUUID } from 'crypto'

export default {
    command: ['unblur'],
    category: 'convert',
    owner: false,
    admin: false,
    reseller: false,
    group: false,
    private: false,
    execute: async (sock, m, text, args) => {
        let buffer = null
        
        if (m.quoted && m.quoted.message?.imageMessage) {
            buffer = await m.quoted.download()
        } else if (m.message?.imageMessage) {
            buffer = await m.download()
        }
        
        if (!buffer) {
            return newsletter.sendText(sock, m.chat, 
                '*UNBLUR IMAGE*\n\nPlease reply to an image with .unblur', m
            )
        }
        
        const scale = args[0] || '2'
        const validScales = ['2', '4', '8', '16']
        
        if (!validScales.includes(scale)) {
            return newsletter.sendText(sock, m.chat, 
                '*KNOX INFO*\n\nInvalid scale. Use: 2, 4, 8, 16', m
            )
        }
        
        await newsletter.sendText(sock, m.chat, '*UNBLUR IMAGE*\n\nProcessing... This may take a moment', m)
        
        const tempDir = path.join(process.cwd(), 'temp')
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })
        
        const tempFile = path.join(tempDir, `unblur_${randomBytes(4).toString('hex')}.jpg`)
        fs.writeFileSync(tempFile, buffer)
        
        try {
            const filename = path.basename(tempFile)
            
            const uploadRes = await axios.post('https://api.unblurimage.ai/api/common/upload/upload-image',
                new URLSearchParams({ file_name: filename }).toString(),
                {
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded',
                        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36',
                        'Product-Serial': randomUUID()
                    }
                }
            )
            
            const { url, object_name } = uploadRes.data.result
            
            const fileBuffer = fs.readFileSync(tempFile)
            await axios.put(url, fileBuffer, {
                headers: {
                    'content-type': 'image/jpeg'
                }
            })
            
            const jobRes = await axios.post('https://api.unblurimage.ai/api/imgupscaler/v1/ai-image-upscaler-v2/create-job',
                new URLSearchParams({
                    original_image_url: `https://cdn.unblurimage.ai/${object_name}`,
                    upscale_type: scale
                }).toString(),
                {
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded',
                        'Product-Serial': randomUUID()
                    }
                }
            )
            
            const jobId = jobRes.data.result.job_id
            
            let result = null
            let attempts = 0
            
            while (!result && attempts < 30) {
                await new Promise(r => setTimeout(r, 5000))
                
                const checkRes = await axios.get(
                    `https://api.unblurimage.ai/api/imgupscaler/v1/ai-image-upscaler-v2/get-job/${jobId}`,
                    {
                        headers: {
                            'Product-Serial': randomUUID()
                        }
                    }
                )
                
                if (checkRes.data.code === 100000 && checkRes.data.result?.output_url) {
                    result = checkRes.data.result
                    break
                }
                
                attempts++
            }
            
            if (!result) {
                throw new Error('Processing timeout')
            }
            
            const response = await axios.get(result.output_url, { responseType: 'arraybuffer' })
            const resultBuffer = Buffer.from(response.data)
            
            await newsletter.sendImage(sock, m.chat, resultBuffer, `*UNBLUR IMAGE*\n\nScale: ${scale}x`, m)
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        } finally {
            if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile)
        }
    }
}