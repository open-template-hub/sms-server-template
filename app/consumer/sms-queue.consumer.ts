import {
  AbstractQueueConsumer,
  ContextArgs,
  MessageQueueChannelType,
  MongoDbProvider,
  QueueConsumer,
  SmsActionType,
} from '@open-template-hub/common';
import { SmsController } from '../controller/sms.controller';
import { Sms } from '../interface/sms.interface';

export class SmsQueueConsumer
  extends AbstractQueueConsumer
  implements QueueConsumer
{
  private smsController: SmsController;

  constructor() {
    super();
    this.smsController = new SmsController();
    this.ownerChannelType = MessageQueueChannelType.SMS;
  }

  init = (channel: string, ctxArgs: ContextArgs) => {
    this.channel = channel;
    this.ctxArgs = ctxArgs;
    return this;
  };

  onMessage = async (msg: any) => {
    if (msg !== null) {
      const msgStr = msg.content.toString();
      const msgObj = JSON.parse(msgStr);

      const message: SmsActionType = msgObj.message;

      // Decide requeue in the error handling
      let requeue = false;

      let messageKey: string | undefined;
      let phoneNumber: string | undefined;
      let params: any | undefined;

      if (message?.smsType && Object.keys(message.smsType)?.length > 0) {
        messageKey = Object.keys(message.smsType)[0];
        phoneNumber = (message.smsType as any)[messageKey].params.phoneNumber;
        params = (message.smsType as any)[messageKey].params;
      } else {
        console.log('Message will be rejected: ', msgObj);
        this.channel.reject(msg, false);
        return;
      }

      if (messageKey && phoneNumber && params) {
        let hook = async () => {
          await this.smsController.sendSms(
            this.ctxArgs.mongodb_provider as MongoDbProvider,
            {
              messageKey,
              providerKey: 'Twilio',
              to: phoneNumber,
              payload: params,
              languageCode: message.language,
            } as Sms
          );
        };

        await this.operate(msg, msgObj, requeue, hook);
      }
    }
  };
}
