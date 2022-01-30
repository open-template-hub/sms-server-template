/**
 * @description holds sms service interface
 */

import { Sms } from "./sms.interface";

export interface SmsService {
  /**
   * initializes file service
   * @param providerConfig provider config
   */
  initializeClient( providerConfig: any ): Promise<any>;

  /**
   * sends sms
   * @param client service client
   * @param sms sms
   */
  send( client: any, sms: Sms, payload: any ): Promise<Sms>;

  /**
   * get from value from payload
   * @param payload 
   */
  getFromValue( payload: any ): string | undefined;
}