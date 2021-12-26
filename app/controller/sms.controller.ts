/**
 * @description holds file controller
 */

import { Context, MongoDbProvider } from '@open-template-hub/common';
import { Sms } from '../interface/sms.interface';
import { ServiceClient } from '../interface/service-client.interface';
import { ServiceProviderRepository } from '../repository/service-provider.repository';
import { SmsServiceWrapper } from '../wrapper/sms-service.wrapper';

export class SmsController {
  /**
   * Sends sms
   * @param context context
   * @param sms sms
   */
  sendSms = async (context: Context, sms: Sms): Promise<any> => {
    const serviceClient = await this.getServiceClient(
      context.mongodb_provider,
      context.serviceKey
    );

    const smsResponse = await serviceClient.service.send(serviceClient.client, sms);

    return smsResponse;
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
