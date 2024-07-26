import { RabbitMQMessageSessionStateProducer } from "../services/rabbitMqSessionStateProducer.service";
import { TextMenssageInterface } from "../interfaces/message.interface";
import { RabbitMQMessageConsumer } from "../services/rabbitMQConsumer.service";
import { BaiLeysWppApi } from "../services/wpp.service";

class StartWpp {
    constructor(
        private readonly rabitMqConsumer: RabbitMQMessageConsumer,
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

    async run() {


        await this.rabitMqConsumer.startConn()
        await this.rabitMqConsumer.consumeMsg({
            messageConsumerFunc: (msg)=> this.messageConsumerFunc(msg)
        })

        await this.rabbitMqSessionProducer.startConn()


        await this.wppApi.start()
    }

}
const rabbitMqSessionProducer = new RabbitMQMessageSessionStateProducer()
const rabbitConsumer = new RabbitMQMessageConsumer()
const wppApi = new BaiLeysWppApi(rabbitMqSessionProducer)


const app = new StartWpp(rabbitConsumer, wppApi, rabbitMqSessionProducer)
app.run()