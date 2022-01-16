/**
 * @description holds sms interface
 */
import { LanguageEnum } from '../enum/language.enum';

export interface Sms {
  id?: string;
  externalId?: string;
  message?: string;
  from?: string;
  created_time?: string;
  status?: string;
  providerKey: string;
  messageKey?: string; // TODO: nullable - Done
  languageCode: LanguageEnum;
  to: string;
  payload: any;
}
