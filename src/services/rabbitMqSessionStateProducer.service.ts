import * as amqplib from "amqplib";
import { RabbitMQConfig } from "../config/config";
import { TextMenssageInterface } from "../interfaces/message.interface";

interface RabbitMqMessageSessionStateProducerInterface {
    messageConsumerFunc(msg: TextMenssageInterface): Promise<undefined|Error>
}

interface MessageSessionInterface {
    qr?: string,
    state: "logged" | "await" | "diconnected"
}

export class RabbitMQMessageSessionStateProducer {
    private conn: amqplib.Connection
    private ch: amqplib.Channel

    constructor() {
    }

    async startConn() {
        const url = RabbitMQConfig.rabbitMQURL

        this.conn = await amqplib.connect(url)
        this.ch = await this.conn.createChannel()
        await this.assertQueue()
        console.log("Conectado ao rabbitMQ na file", RabbitMQConfig.rabbitMqSessionStateQueueName)
    }

    private async assertQueue() {
        this.ch.assertQueue(RabbitMQConfig.rabbitMqSessionStateQueueName, {durable: true})
    }

    async sendStateOfSession(message: MessageSessionInterface) {
        const messageToSend = Buffer.from(JSON.stringify(message))
        const sendOrError = this.ch.sendToQueue(RabbitMQConfig.rabbitMqSessionStateQueueName, messageToSend, {
            expiration: 10000,
        })
        if(!sendOrError) {
            console.error("Erro para enviar estado da sessão para fila!")
        }
        console.log("Mensagem do estado da sessão enviada com sucesso!")
    }

}