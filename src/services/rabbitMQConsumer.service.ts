import * as amqplib from "amqplib";
import { RabbitMQConfig } from "../config/config";
import { TextMenssageInterface } from "../interfaces/message.interface";
import { setTimeout } from "timers/promises";

interface RabbitMqMessageConsumerInterface {
    messageConsumerFunc(msg: TextMenssageInterface): Promise<undefined|Error>
}

export class RabbitMQMessageConsumer {
    private conn: amqplib.Connection
    private ch: amqplib.Channel

    constructor() {
    }

    async startConn() {
        const url = RabbitMQConfig.rabbitMQURL

        this.conn = await amqplib.connect(url)
        this.ch = await this.conn.createChannel()
        this.ch.prefetch(1)
        await this.assertQueue()
        console.log("Conectado ao rabbitMQ na file", RabbitMQConfig.rabbitMQMessageQueueName)
    }

    private async assertQueue() {
        this.ch.assertQueue(RabbitMQConfig.rabbitMQMessageQueueName, {durable: true})
    }

    async consumeMsg(input: RabbitMqMessageConsumerInterface) {
        this.ch.consume(RabbitMQConfig.rabbitMQMessageQueueName, async (msg)=>{
            if(!msg) return
            const msgDecoded = JSON.parse(msg.content.toString())
            const consumeOrError = await input.messageConsumerFunc(msgDecoded)

            if(consumeOrError instanceof Error) {
                return this.ch.nack(msg,undefined, true)
            }

            await setTimeout(1000)
            this.ch.ack(msg)

        }, {
            noAck: false
        })
    }
}