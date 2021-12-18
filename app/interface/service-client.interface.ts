/**
 * @description holds service client interface
 */

import { SmsService } from './sms-service.interface';

export interface ServiceClient {
  client: any;
  service: SmsService;
}
