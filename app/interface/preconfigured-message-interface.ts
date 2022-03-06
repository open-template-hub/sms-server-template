import { ProviderKeyEnum } from '../enum/provider-key.enum';

/**
 * @description holds service preconfigured message interface
 */

export interface PreconfiguredMessage {
  key: string,
  messages: {
    language: string,
    message: string
  }[],
  payload: {
    provider: ProviderKeyEnum,
    from: string
  }[]
}
