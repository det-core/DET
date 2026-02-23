import newsletter from '../Bridge/newsletter.js'
import fs from 'fs'
import path from 'path'
import { randomBytes } from 'crypto'

export default {
    command: ['vcf', 'savecontacts', 'getvcf'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        try {
            await newsletter.sendText(sock, m.chat, '*VCF GENERATOR*\n\nFetching group members...', m)
            
            const groupMetadata = await sock.groupMetadata(m.chat)
            const participants = groupMetadata.participants || []
            
            if (participants.length === 0) {
                return newsletter.sendText(sock, m.chat, '*KNOX INFO*\n\nNo members found in this group', m)
            }
            
            await newsletter.sendText(sock, m.chat, `*VCF GENERATOR*\n\nFound ${participants.length} members. Generating VCF file...`, m)
            
            let vcfContent = ''
            let successCount = 0
            
            for (let i = 0; i < participants.length; i++) {
                const participant = participants[i]
                const jid = participant.id
                const number = jid.split('@')[0]
                
                try {
                    // Get contact name
                    let name = await sock.getName(jid)
                    
                    // Fallback if no name found
                    if (!name || name === '') {
                        name = `Contact ${number}`
                    }
                    
                    // Clean name for VCF (remove special characters)
                    const cleanName = name.replace(/[^\w\s]/gi, '').trim()
                    
                    // Create VCF entry
                    vcfContent += 'BEGIN:VCARD\n'
                    vcfContent += 'VERSION:3.0\n'
                    vcfContent += `FN:${cleanName}\n`
                    vcfContent += `TEL;type=CELL;type=VOICE;waid=${number}:+${number}\n`
                    
                    // Add group info as note
                    vcfContent += `NOTE:Group: ${groupMetadata.subject}\n`
                    
                    // Add timestamp
                    vcfContent += `REV:${new Date().toISOString().split('T')[0]}\n`
                    vcfContent += 'END:VCARD\n\n'
                    
                    successCount++
                    
                } catch (error) {
                    // If name fetch fails, use number as name
                    vcfContent += 'BEGIN:VCARD\n'
                    vcfContent += 'VERSION:3.0\n'
                    vcfContent += `FN:Contact ${number}\n`
                    vcfContent += `TEL;type=CELL;type=VOICE;waid=${number}:+${number}\n`
                    vcfContent += `NOTE:Group: ${groupMetadata.subject}\n`
                    vcfContent += `REV:${new Date().toISOString().split('T')[0]}\n`
                    vcfContent += 'END:VCARD\n\n'
                    
                    successCount++
                }
                
                // Small delay every 10 contacts to avoid rate limiting
                if (i % 10 === 0 && i > 0) {
                    await new Promise(resolve => setTimeout(resolve, 200))
                }
            }
            
            // Create temp directory if it doesn't exist
            const tempDir = path.join(process.cwd(), 'temp')
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true })
            }
            
            // Generate filename with group name and date
            const safeGroupName = groupMetadata.subject
                .replace(/[^\w\s]/gi, '')
                .replace(/\s+/g, '_')
                .substring(0, 20)
            const date = new Date().toISOString().split('T')[0]
            const filename = `${safeGroupName}_contacts_${date}.vcf`
            const filePath = path.join(tempDir, filename)
            
            // Write VCF file
            fs.writeFileSync(filePath, vcfContent)
            
            // Read file buffer
            const fileBuffer = fs.readFileSync(filePath)
            
            // Send the VCF file directly
            await sock.sendMessage(m.chat, {
                document: fileBuffer,
                mimetype: 'text/vcard',
                fileName: filename,
                caption: `*GROUP CONTACTS*

┏⧉ *Group Info*
┣𖣠 Name: ${groupMetadata.subject}
┣𖣠 Total Members: ${participants.length}
┣𖣠 Contacts Saved: ${successCount}
┣𖣠 File: ${filename}
┣𖣠 Size: ${(fileBuffer.length / 1024).toFixed(2)} KB
┗━━━━━━━━━

Import this file to save all group contacts.`
            }, { quoted: m })
            
            // Clean up - delete file after sending
            fs.unlinkSync(filePath)
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, 
                `*KNOX INFO*\n\nError: ${error.message}`, m
            )
        }
    }
}