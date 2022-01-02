import { LanguageEnum } from '../enum/language.enum';
import { ProviderKeyEnum } from '../enum/provider-key.enum';

/**
 * @description holds service preconfigured message interface
 */

export interface PreconfiguredMessage {
  key: string,
  languageCode: LanguageEnum,
  message: string,
  from: string,
  providerKey: ProviderKeyEnum
}
