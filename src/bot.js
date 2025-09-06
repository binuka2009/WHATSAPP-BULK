import { default as makeWASocket, useSingleFileAuthState } from "@whiskeysockets/baileys"
import Papa from "papaparse"
import fs from "fs"

const SESSION_FILE = 'session.json'

// Load session.json if exists
const { state, saveCreds } = useSingleFileAuthState(SESSION_FILE)

const sock = makeWASocket({
    auth: state,
})

sock.ev.on('creds.update', saveCreds)
sock.ev.on('connection.update', (update) => {
    if (update.connection === 'open') console.log("✅ Connected with session ID!")
})

// Send message function
export async function sendMessage(number, msg) {
    const jid = number.replace(/^0/, '94') + "@s.whatsapp.net"
    try {
        await sock.sendMessage(jid, { text: msg })
        console.log(`✅ Sent to ${number}`)
    } catch (err) {
        console.error(`❌ Failed ${number}`, err)
    }
}

// Auto send CSV/VCF contacts
export async function startBot(csvText, message) {
    const contacts = Papa.parse(csvText, { header: false }).data.flat().filter(Boolean)
    for (let number of contacts) {
        await sendMessage(number, message)
        await new Promise(res => setTimeout(res, 10000)) // 10 sec delay
    }
}
