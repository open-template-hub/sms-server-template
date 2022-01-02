/**
 * @description holds file controller
 */

import { Context, MongoDbProvider } from '@open-template-hub/common';
import { PreconfiguredMessage } from '../interface/preconfigured-message-interface';
import { Sms } from '../interface/sms.interface';
import { ServiceClient } from '../interface/service-client.interface';
import { PreconfiguredMessageRepository } from '../repository/preconfigured-message.repository';
import { ServiceProviderRepository } from '../repository/service-provider.repository';
import { SmsServiceWrapper } from '../wrapper/sms-service.wrapper';
import { v4 as uuidv4 } from 'uuid';

export class SmsController {
  /**
   * Sends sms
   * @param context context
   * @param sms sms
   */
  sendSms = async (context: Context, sms: Sms): Promise<any> => {
    sms.id = uuidv4()

    const preconfiguredMessage = await this.getPreconfiguredMessage(context.mongodb_provider, sms.messageKey);

    const serviceClient = await this.getServiceClient(
      context.mongodb_provider,
      preconfiguredMessage.providerKey
    );

    // TODO: check if preconfmessage null

    // TODO: Build from 'common' library, add func to builder
    let keyString = preconfiguredMessage.message;
    Object.keys(sms.payload).forEach( (key, index) => {
      keyString = keyString.replace('{{' + key + '}}', sms.payload[key]);
    })

    sms.message = keyString
    sms.from = preconfiguredMessage.from

    return await serviceClient.service.send(serviceClient.client, sms);
  };

  /**
   * Creates preconfigured message
   * @param context context
   * @param sms preconfiguredMessage
   */
  createPreconfiguredMessage = async (context: Context, preconfiguredMessage: PreconfiguredMessage): Promise<any> => {
    const conn = context.mongodb_provider.getConnection()
    const preconfiguredMessageRepository = await new PreconfiguredMessageRepository().initialize(conn);
    return await preconfiguredMessageRepository.createPreconfiguredMessage(preconfiguredMessage)
  }

  /**
   * gets service client
   * @param provider service provider
   * @param serviceKey service key
   */
  private getServiceClient = async (
    provider: MongoDbProvider,
    serviceKey: string
  ): Promise<ServiceClient> => {
    const serviceConfig = await this.getServiceConfig(provider, serviceKey);

    const service = new SmsServiceWrapper(serviceConfig.key);

    const client = await service.initializeClient(serviceConfig.payload);

    if (client === undefined)
      throw new Error('Client is not initialized correctly');

    return { client, service } as ServiceClient;
  };

  /**
   * gets service config
   * @param provider service provider
   * @param serviceKey service key
   */
  private getServiceConfig = async (
    provider: MongoDbProvider,
    serviceKey: string
  ): Promise<any> => {
    const conn = provider.getConnection();

    const serviceProviderRepository =
      await new ServiceProviderRepository().initialize(conn);

    let serviceConfig: any =
      await serviceProviderRepository.getServiceProviderByKey(serviceKey);

    if (serviceConfig === null)
      throw new Error('Upload service can not be found');

    return serviceConfig;
  };

  private getPreconfiguredMessage = async (
      provider: MongoDbProvider,
      messageKey: string
  ): Promise<PreconfiguredMessage> => {
    const conn = provider.getConnection();

    const preconfiguredMessageRepository = await new PreconfiguredMessageRepository().initialize(conn);

    let preconfiguredMessage: PreconfiguredMessage =
        await preconfiguredMessageRepository.getPreconfiguredMessage(messageKey);

    if (preconfiguredMessage === null) {
      throw new Error('Preconfigured message not found');
    }

    return preconfiguredMessage;
  }
}
