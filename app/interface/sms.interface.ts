/**
 * @description holds sms interface
 */

export interface Sms {
  id?: string;
  externalId?: string;
  message?: string;
  from?: string;
  created_time?: string;
  status?: string;
  providerKey: string;
  messageKey?: string;
  languageCode?: string;
  to: string;
  payload: any;
}
