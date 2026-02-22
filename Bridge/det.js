import fs from "fs"

const det = {}

det.db = {
    owner: JSON.parse(fs.readFileSync("./database/owner.json")),
    admin: JSON.parse(fs.readFileSync("./database/admin.json")),
    reseller: JSON.parse(fs.readFileSync("./database/reseller.json")),
    user: JSON.parse(fs.readFileSync("./database/user.json"))
}

det.saveDB = () => {
    fs.writeFileSync("./database/owner.json", JSON.stringify(det.db.owner, null, 2))
    fs.writeFileSync("./database/admin.json", JSON.stringify(det.db.admin, null, 2))
    fs.writeFileSync("./database/reseller.json", JSON.stringify(det.db.reseller, null, 2))
    fs.writeFileSync("./database/user.json", JSON.stringify(det.db.user, null, 2))
}

det.getPrefix = (text = "") => {
    return global.prefixes?.find(p => text.startsWith(p))
}

det.parseCommand = (text = "") => {
    const prefix = det.getPrefix(text)
    if (!prefix) return null
    const body = text.slice(prefix.length).trim()
    const command = body.split(" ")[0].toLowerCase()
    return { prefix, command, body }
}

det.isOwner = (id) => det.db.owner.includes(id)
det.isAdmin = (id) => det.db.admin.includes(id)
det.isReseller = (id) => det.db.reseller.includes(id)

export default det