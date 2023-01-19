import {
  ContextArgs,
  MessageQueueChannelType,
  MongoDbProvider,
  QueueConsumer,
  QueueMessage,
  SmsActionType,
} from '@open-template-hub/common';
import { SmsController } from '../controller/sms.controller';
import { Sms } from '../interface/sms.interface';

export class SmsQueueConsumer implements QueueConsumer {
  private channel: any;
  private ctxArgs: ContextArgs = {} as ContextArgs;
  private smsController: SmsController;

  constructor() {
    this.smsController = new SmsController();
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

  private operate = async (
    msg: any,
    msgObj: any,
    requeue: boolean,
    hook: Function
  ) => {
    try {
      console.log(
        'Message Received with deliveryTag: ' + msg.fields.deliveryTag,
        msgObj
      );
      await hook();
      await this.channel.ack(msg);
      console.log(
        'Message Processed with deliveryTag: ' + msg.fields.deliveryTag,
        msgObj
      );
    } catch (e) {
      console.log(
        'Error with processing deliveryTag: ' + msg.fields.deliveryTag,
        msgObj,
        e
      );

      await this.moveToDLQ(msg, requeue);
    }
  };

  private moveToDLQ = async (msg: any, requeue: boolean) => {
    try {
      const orchestrationChannelTag =
        this.ctxArgs.envArgs.mqArgs?.orchestrationServerMessageQueueChannel;

      const message = {
        sender: MessageQueueChannelType.SMS,
        receiver: MessageQueueChannelType.DLQ,
        message: {
          owner: MessageQueueChannelType.SMS,
          msg,
        },
      } as QueueMessage;

      await this.ctxArgs.message_queue_provider?.publish(
        message,
        orchestrationChannelTag as string
      );

      this.channel.reject(msg, false);
    } catch (e) {
      console.log('Error while moving message to DLQ: ', msg);
      this.channel.nack(msg, false, requeue);
    }
  };
}
