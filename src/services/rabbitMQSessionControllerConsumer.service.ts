import * as amqplib from "amqplib";
import { RabbitMQConfig } from "../config/config";
import { setTimeout } from "timers/promises";
import { SessionControllerInterface } from "../interfaces/sessionController.interface";



interface RabbitMqSessionControllerConsumerInterface {
    messageConsumerFunc(msg: SessionControllerInterface): Promise<undefined|Error>
}

export class RabbitMQSessionControllerConsumer {
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
        console.log("Conectado ao rabbitMQ na file", RabbitMQConfig.rabbitMqSessionControllerQueueName)
    }

    private async assertQueue() {
        this.ch.assertQueue(RabbitMQConfig.rabbitMqSessionControllerQueueName, {durable: true})
    }

    async consumeMsg(input: RabbitMqSessionControllerConsumerInterface) {
        this.ch.consume(RabbitMQConfig.rabbitMqSessionControllerQueueName, async (msg)=>{
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