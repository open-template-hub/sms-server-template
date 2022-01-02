/**
 * @description holds sms interface
 */
import { LanguageEnum } from '../enum/language.enum';

export interface Sms {
  id?: string;
  message?: string;
  from?: string;
  created_time?: string;
  status?: string;
  messageKey: string; // TODO: nullable
  languageCode: LanguageEnum;
  to: string;
  payload: any;
}
