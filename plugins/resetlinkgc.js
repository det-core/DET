import newsletter from '../Bridge/newsletter.js'

export default {
    command: ['resetlinkgc', 'revokelink'],
    category: 'group',
    owner: false,
    admin: true,
    reseller: false,
    group: true,
    private: false,
    execute: async (sock, m, text, args) => {
        try {
            await sock.groupRevokeInvite(m.chat)
            
            await newsletter.sendText(sock, m.chat, 
                '*RESET LINK*\n\n✓ Group link has been reset\nUse .linkgc to get the new link', 
                m
            )
            
        } catch (error) {
            await newsletter.sendText(sock, m.chat, `*KNOX INFO*\n\nError: ${error.message}`, m)
        }
    }
}