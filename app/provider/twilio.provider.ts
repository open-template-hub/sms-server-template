import { Twilio } from 'twilio';
import { SmsService } from '../interface/sms-service.interface';
import { Sms } from '../interface/sms.interface';

export class TwilioService implements SmsService {
  private client?: Twilio

  constructor(private payload: any = null) {}

  /**
   * initializes client
   * @param providerConfig provider config
   */
  async initializeClient(providerConfig: any): Promise<any> {
    let client: Twilio
    client = new Twilio( providerConfig.accountId, providerConfig.authToken )

    this.client = client
    return client
  }

  /**
   * sends sms
   * @param client service client
   * @param sms sms
   */
  async send(client: any, sms: Sms): Promise<Sms> {
    const response = await this.client?.messages.create( {
      body: sms.message,
      from: sms.from,
      to: sms.to
    } );

    if( response ) {
      sms.created_time = response.dateCreated
      sms.status = response.status
    }

    return sms
  }
}
