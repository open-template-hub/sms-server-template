/**
 * @description holds file controller
 */

import { Context, MongoDbProvider } from '@open-template-hub/common';
import { Sms } from '../interface/sms.interface';
import { ServiceClient } from '../interface/service-client.interface';
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

    const serviceClient = await this.getServiceClient(
      context.mongodb_provider,
      context.serviceKey
    );

    return await serviceClient.service.send(serviceClient.client, sms);
  };

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
}
