import fs from "fs"

const det = {}

// Initialize database files if they don't exist
const initDB = () => {
    const dbDir = "./database"
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true })
    }
    
    const dbFiles = {
        owner: "./database/owner.json",
        admin: "./database/admin.json",
        reseller: "./database/reseller.json",
        user: "./database/user.json"
    }
    
    Object.values(dbFiles).forEach(file => {
        if (!fs.existsSync(file)) {
            fs.writeFileSync(file, JSON.stringify([]))
        }
    })
}

initDB()

// Load databases
det.db = {
    owner: JSON.parse(fs.readFileSync("./database/owner.json")),
    admin: JSON.parse(fs.readFileSync("./database/admin.json")),
    reseller: JSON.parse(fs.readFileSync("./database/reseller.json")),
    user: JSON.parse(fs.readFileSync("./database/user.json"))
}

// Save databases
det.saveDB = () => {
    fs.writeFileSync("./database/owner.json", JSON.stringify(det.db.owner, null, 2))
    fs.writeFileSync("./database/admin.json", JSON.stringify(det.db.admin, null, 2))
    fs.writeFileSync("./database/reseller.json", JSON.stringify(det.db.reseller, null, 2))
    fs.writeFileSync("./database/user.json", JSON.stringify(det.db.user, null, 2))
}

// Add global owners from config
if (global.owner && Array.isArray(global.owner)) {
    global.owner.forEach(ownerId => {
        if (!det.db.owner.includes(ownerId)) {
            det.db.owner.push(ownerId)
        }
    })
    det.saveDB()
}

// Check functions
det.isOwner = (id) => {
    const cleanId = id.split('@')[0] || id
    return det.db.owner.includes(cleanId) || global.owner?.includes(cleanId)
}

det.isAdmin = (id) => {
    const cleanId = id.split('@')[0] || id
    return det.db.admin.includes(cleanId)
}

det.isReseller = (id) => {
    const cleanId = id.split('@')[0] || id
    return det.db.reseller.includes(cleanId) || det.isOwner(cleanId)
}

det.isUser = (id) => {
    const cleanId = id.split('@')[0] || id
    return det.db.user.includes(cleanId)
}

// Add functions
det.addUser = (id) => {
    const cleanId = id.split('@')[0] || id
    if (!det.db.user.includes(cleanId)) {
        det.db.user.push(cleanId)
        det.saveDB()
    }
}

det.addAdmin = (id, adder) => {
    if (!det.isOwner(adder)) return { success: false, message: 'Only owners can add admins' }
    const cleanId = id.split('@')[0] || id
    if (!det.db.admin.includes(cleanId)) {
        det.db.admin.push(cleanId)
        det.saveDB()
        return { success: true, message: '✓ Admin added successfully' }
    }
    return { success: false, message: 'User is already an admin' }
}

det.addReseller = (id, adder) => {
    if (!det.isOwner(adder) && !det.isAdmin(adder)) return { success: false, message: 'Only owners and admins can add resellers' }
    const cleanId = id.split('@')[0] || id
    if (!det.db.reseller.includes(cleanId)) {
        det.db.reseller.push(cleanId)
        det.saveDB()
        return { success: true, message: '✓ Reseller added successfully' }
    }
    return { success: false, message: 'User is already a reseller' }
}

// Remove functions
det.removeAdmin = (id, remover) => {
    if (!det.isOwner(remover)) return { success: false, message: 'Only owners can remove admins' }
    const cleanId = id.split('@')[0] || id
    const index = det.db.admin.indexOf(cleanId)
    if (index > -1) {
        det.db.admin.splice(index, 1)
        det.saveDB()
        return { success: true, message: '✓ Admin removed successfully' }
    }
    return { success: false, message: 'User is not an admin' }
}

det.removeReseller = (id, remover) => {
    if (!det.isOwner(remover) && !det.isAdmin(remover)) return { success: false, message: 'Only owners and admins can remove resellers' }
    const cleanId = id.split('@')[0] || id
    const index = det.db.reseller.indexOf(cleanId)
    if (index > -1) {
        det.db.reseller.splice(index, 1)
        det.saveDB()
        return { success: true, message: '✓ Reseller removed successfully' }
    }
    return { success: false, message: 'User is not a reseller' }
}

// Get functions
det.getPrefix = (text = "") => {
    return global.prefixes?.find(p => text.startsWith(p))
}

det.parseCommand = (text = "") => {
    const prefix = det.getPrefix(text)
    if (!prefix) return null
    const body = text.slice(prefix.length).trim()
    const command = body.split(" ")[0].toLowerCase()
    const args = body.split(" ").slice(1)
    return { prefix, command, body, args }
}

det.getUserStatus = (id) => {
    const cleanId = id.split('@')[0] || id
    if (det.isOwner(cleanId)) return 'Owner'
    if (det.isAdmin(cleanId)) return 'Admin'
    if (det.isReseller(cleanId)) return 'Reseller'
    if (det.isUser(cleanId)) return 'User'
    return 'Guest'
}

det.getUserCount = () => {
    return {
        owners: det.db.owner.length,
        admins: det.db.admin.length,
        resellers: det.db.reseller.length,
        users: det.db.user.length,
        total: det.db.owner.length + det.db.admin.length + det.db.reseller.length + det.db.user.length
    }
}

det.runtime = (seconds) => {
    seconds = Number(seconds)
    const d = Math.floor(seconds / (3600 * 24))
    const h = Math.floor(seconds % (3600 * 24) / 3600)
    const m = Math.floor(seconds % 3600 / 60)
    const s = Math.floor(seconds % 60)
    return `${d}d ${h}h ${m}m ${s}s`
}

export default det