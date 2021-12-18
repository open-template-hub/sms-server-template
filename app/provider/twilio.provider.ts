import { SmsService } from '../interface/sms-service.interface';
import { Sms } from '../interface/sms.interface';

export class TwilioService implements SmsService {
  constructor(private payload: any = null) {}

  /**
   * initializes client
   * @param providerConfig provider config
   */
  async initializeClient(providerConfig: any): Promise<any> {}

  /**
   * sends sms
   * @param client service client
   * @param sms sms
   */
  async send(client: any, sms: Sms): Promise<Sms> {
    // Send SMS here
    return {} as Sms;
  }
}
