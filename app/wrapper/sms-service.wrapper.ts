/**
 * @description holds file service wrapper
 */

import { SmsServiceEnum } from '../enum/sms-service.enum';
import { SmsService } from '../interface/sms-service.interface';
import { Sms } from '../interface/sms.interface';
import { TwilioService } from '../provider/twilio.provider';

export class SmsServiceWrapper implements SmsService {
  smsService: SmsService | undefined;

  constructor(uploadService: SmsServiceEnum) {
    if (uploadService === SmsServiceEnum.Twilio) {
      this.smsService = new TwilioService();
    } else {
      this.smsService = undefined;
    }
  }

  /**
   * initializes client
   * @param providerConfig provider config
   */
  initializeClient = async (providerConfig: any): Promise<any> => {
    if (this.smsService === undefined) {
      return null;
    }

    return this.smsService.initializeClient(providerConfig);
  };

  /**
   * uploads file
   * @param client client
   * @param file file
   */
  send = async (client: any, sms: Sms, payload: any): Promise<Sms> => {
    if (this.smsService === undefined) {
      return sms;
    }

    return this.smsService.send(client, sms, payload);
  };

  getFromValue( payload: any ): string | undefined {
    if ( this.smsService === undefined ) {
      return undefined;
    }

    return this.smsService.getFromValue(payload);
  } 
}
