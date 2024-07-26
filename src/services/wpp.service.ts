import makeWASocket, { DisconnectReason , AuthenticationState, useMultiFileAuthState, ConnectionState, WAMessage, MessageUpsertType} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import * as qrCode from 'qrcode-terminal'


interface MSGUpsertInterface {
    messages: WAMessage[];
    type: MessageUpsertType
}

export class BaiLeysWppApi {

    private sock: ReturnType<typeof makeWASocket>

    async start() {
        const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')

        this.sock =  makeWASocket({
            auth: state ,
            printQRInTerminal: true,
        })

        this.sock.ev.on('creds.update', saveCreds)
        this.sock.ev.on('connection.update', (arg)=>this.connUpdate(arg))
        this.sock.ev.on('messages.upsert', (arg)=>this.msgUpsert(arg))

    }

    private connUpdate(update: Partial<ConnectionState>) {
        const { connection, lastDisconnect } = update
        if(update.qr) {
            qrCode.generate(update.qr)
        }

        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
            // reconnect if not logged out
            if(shouldReconnect) {
                this.start()
            }
        } else if(connection === 'open') {
            console.log('opened connection')
        }
    }

    private msgUpsert(msg:MSGUpsertInterface) {
        console.log(msg.messages[0].key.id)
        console.log('replying to', msg.messages[0].key.remoteJid)
        //this.sock.sendMessage(msg.messages[0].key.remoteJid, {text: "Olaaa"})
    }

    private createWhatsIdWithPhoneNumber(phoneNumber: string) : string {

        let newNumber = ""

        if(!phoneNumber.replace("+","").startsWith("55")) newNumber+=55
        
        newNumber += phoneNumber.replace("+","")

        if(newNumber.length !== 12) {
            const firstPart = newNumber.substring(0,4)
            const secodPart = newNumber.substring(5, newNumber.length)
            newNumber = firstPart + secodPart
        }
        return newNumber+"@s.whatsapp.net"

    }

    async sendTextMessage(contact: string, textMessage: string) {
        try{
            const  id = this.createWhatsIdWithPhoneNumber(contact)
            const sendOrError = await this.sock.sendMessage(id, {text: textMessage})
        }catch(e) {
            console.log(e)
        }
    }
}

