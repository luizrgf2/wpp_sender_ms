import * as dotenv from 'dotenv'

dotenv.config()

export const RabbitMQConfig = {
    rabbitMQURL:  process.env.RMQ_URL_CONN,
    rabbitMQMessageQueueName: process.env.RMQ_MESSAGE_QUEUE,
    rabbitMqSessionStateQueueName: process.env.RMQ_SESSION_STATE_QUEUE,
    rabbitMqSessionControllerQueueName: process.env.RMQ_SESSION_CONTROLLER_QUEUE,
}

export const RedisConfig = {
    redisHost: process.env.REDIS_HOST,
    redisPort: process.env.REDIS_PORT,
}