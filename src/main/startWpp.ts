import { TextMenssageInterface } from "../interfaces/message.interface";
import { RabbitMQMessageConsumer } from "../services/rabbitMQConsumer.service";
import { BaiLeysWppApi } from "../services/wpp.service";

class StartWpp {
    constructor(
        private readonly rabitMqConsumer: RabbitMQMessageConsumer,
        private readonly wppApi: BaiLeysWppApi
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

        await this.wppApi.start()
    }

}

const rabbitConsumer = new RabbitMQMessageConsumer()
const wppApi = new BaiLeysWppApi()


const app = new StartWpp(rabbitConsumer, wppApi)
app.run()