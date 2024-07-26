import * as dotenv from 'dotenv'

dotenv.config()

export const RabbitMQConfig = {
    rabbitMQURL:  process.env.RMQ_URL_CONN,
    rabbitMQMessageQueueName: process.env.RMQ_MESSAGE_QUEUE
}