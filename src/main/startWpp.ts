import { RabbitMQMessageSessionStateProducer } from "../services/rabbitMqSessionStateProducer.service";
import { TextMenssageInterface } from "../interfaces/message.interface";
import { RabbitMQMessageConsumer } from "../services/rabbitMQConsumer.service";
import { BaiLeysWppApi } from "../services/wpp.service";
import { RabbitMQSessionControllerConsumer } from "../services/rabbitMQSessionControllerConsumer.service";
import { SessionControllerInterface } from "../interfaces/sessionController.interface";
import { RedisService } from "../services/redis.service";

class StartWpp {
    constructor(
        private readonly rabitMqConsumer: RabbitMQMessageConsumer,
        private readonly rabitMqSessionControllerConsumer: RabbitMQSessionControllerConsumer,
        private readonly wppApi: BaiLeysWppApi,
        private readonly rabbitMqSessionProducer: RabbitMQMessageSessionStateProducer,

    ) {}

    private async messageConsumerFunc(msg: TextMenssageInterface): Promise<undefined|Error> {
        try{
            await this.wppApi.sendTextMessage(msg.contactNumber, msg.textMessage)
            return undefined
        }catch(e) {
            return e
        }

    }

    private async sessionControllerConsumerFunc(msg: SessionControllerInterface): Promise<undefined|Error> {
        try{
            if(msg.actionSession === "start")
                await this.wppApi.start()

        }catch(e) {
            return e
        }

    }

    async run() {


        await this.rabitMqConsumer.startConn()
        await this.rabitMqConsumer.consumeMsg({
            messageConsumerFunc: (msg)=> this.messageConsumerFunc(msg)
        })

        await this.rabitMqSessionControllerConsumer.startConn()
        await this.rabitMqSessionControllerConsumer.consumeMsg({
            messageConsumerFunc: (msg)=> this.sessionControllerConsumerFunc(msg)
        })

        await this.rabbitMqSessionProducer.startConn()

        
    }

}
const rabbitMqSessionProducer = new RabbitMQMessageSessionStateProducer()
const rabbitConsumer = new RabbitMQMessageConsumer()
const rabbitSessionControllerConsumer = new RabbitMQSessionControllerConsumer()

const redisService = new RedisService()

const wppApi = new BaiLeysWppApi(rabbitMqSessionProducer, redisService)


const app = new StartWpp(rabbitConsumer, rabbitSessionControllerConsumer,wppApi, rabbitMqSessionProducer)
app.run()