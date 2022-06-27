import { SmsService } from '../interface/sms-service.interface';
import { Sms } from '../interface/sms.interface';

class TwilioPackage {
  static Twilio: any;

  public static getInstance() {
    if ( !this.Twilio ) {
      const { Twilio } = require( 'twilio' );
      this.Twilio = Twilio;
      console.info( 'Initializing Twilio Package. Config: ', this.Twilio );
    }

    return this.Twilio;
  }
}

export class TwilioService implements SmsService {

  /**
   * initializes client
   * @param providerConfig provider config
   */
  async initializeClient( providerConfig: any ): Promise<any> {
    const Twilio: any = TwilioPackage.getInstance();

    return new Twilio( providerConfig.accountId, providerConfig.authToken );
  }

  /**
   * sends sms
   * @param client service client
   * @param sms sms
   */
  async send( client: any, sms: Sms ): Promise<Sms> {
    const response = await client.messages.create( {
      body: sms.message,
      from: sms.from,
      to: sms.to
    } );

    if ( response ) {
      sms.created_time = response.dateCreated;
      sms.status = response.status;
      sms.externalId = response.sid;
    }

    return sms;
  }

  /**
   * get from value
   * @param payload any payload
   * @returns string from
   */
  getFromValue( payload: any ): string | undefined {
    return payload?.twilio?.from;
  }
}
