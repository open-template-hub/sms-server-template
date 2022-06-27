/**
 * @description holds file controller
 */

import { Context, MongoDbProvider, BuilderUtil, HttpError, ResponseCode } from '@open-template-hub/common';
import { PreconfiguredMessage } from '../interface/preconfigured-message-interface';
import { Sms } from '../interface/sms.interface';
import { ServiceClient } from '../interface/service-client.interface';
import { PreconfiguredMessageRepository } from '../repository/preconfigured-message.repository';
import { ServiceProviderRepository } from '../repository/service-provider.repository';
import { SmsServiceWrapper } from '../wrapper/sms-service.wrapper';
import { v4 as uuidv4 } from 'uuid';
import { SmsServiceEnum } from '../enum/sms-service.enum';

export class SmsController {

  builderUtil: BuilderUtil;

  constructor() {
    this.builderUtil = new BuilderUtil();
  }

  /**
   * Sends sms
   * @param context context
   * @param sms sms
   */
  sendSms = async (
      mongodb_provider: MongoDbProvider,
      sms: Sms
  ): Promise<any> => {

    sms.id = uuidv4();

    const messageKey = sms.messageKey;

    const serviceProvider = await this.getServiceProvider(
        mongodb_provider,
        sms.providerKey.toUpperCase()
    );

    const serviceClient = await this.getServiceClient(
        serviceProvider.key,
        serviceProvider.payload
    );

    let message: string;
    let from: string | undefined;
    let preconfiguredMessagePayload: any;

    if ( messageKey ) {
      const defaultLanguageCode = process.env.LANGUAGE_CODE ?? 'en';

      const preconfiguredMessage = await this.getPreconfiguredMessage(
          mongodb_provider,
          messageKey,
          sms.languageCode,
          defaultLanguageCode
      );

      message = preconfiguredMessage.messages[ 0 ].message;
      preconfiguredMessagePayload = preconfiguredMessage.payload;
      from = serviceClient.service.getFromValue( preconfiguredMessagePayload );
    } else {
      message = sms.payload.message;
      from = serviceProvider.payload.from;
    }

    if ( from === undefined ) {
      let e = new Error( 'From not found' ) as HttpError;
      e.responseCode = ResponseCode.INTERNAL_SERVER_ERROR;
      throw e;
    }

    const messageParams = this.objectToMap( sms.payload );
    let messageBody = this.builderUtil.buildTemplateFromString( message, messageParams );

    sms.message = messageBody;
    sms.from = from;

    return serviceClient.service.send( serviceClient.client, sms, preconfiguredMessagePayload );
  };

  /**
   * Creates preconfigured message
   * @param context context
   * @param sms preconfiguredMessage
   */
  createPreconfiguredMessage = async ( context: Context, preconfiguredMessage: PreconfiguredMessage ): Promise<any> => {
    const conn = context.mongodb_provider.getConnection();
    const preconfiguredMessageRepository = await new PreconfiguredMessageRepository().initialize( conn );
    return preconfiguredMessageRepository.createPreconfiguredMessage( preconfiguredMessage );
  };

  /**
   * gets service client
   * @param serviceKey SmsServiceEnum
   * @param serviceConfigPayload any
   */
  private getServiceClient = async (
      serviceKey: SmsServiceEnum,
      serviceConfigPayload: any
  ): Promise<ServiceClient> => {
    const service = new SmsServiceWrapper( serviceKey );

    const client = await service.initializeClient( serviceConfigPayload );

    if ( client === undefined )
      throw new Error( 'Client is not initialized correctly' );

    return { client, service } as ServiceClient;
  };

  /**
   * gets service serviceProvider
   * @param provider service provider
   * @param serviceKey service key
   */
  private getServiceProvider = async (
      provider: MongoDbProvider,
      serviceKey: string
  ): Promise<any> => {
    const conn = provider.getConnection();

    const serviceProviderRepository =
        await new ServiceProviderRepository().initialize( conn );

    let serviceProvider: any =
        await serviceProviderRepository.getServiceProviderByKey( serviceKey );

    if ( serviceProvider === null )
      throw new Error( 'Upload service can not be found' );

    return serviceProvider;
  };

  private getPreconfiguredMessage = async (
      provider: MongoDbProvider,
      messageKey: string,
      languageCode: string | undefined,
      defaultLangaugeCode: string
  ): Promise<PreconfiguredMessage> => {
    const conn = provider.getConnection();

    const preconfiguredMessageRepository = await new PreconfiguredMessageRepository().initialize( conn );

    let preconfiguredMessage: PreconfiguredMessage[] =
        await preconfiguredMessageRepository.getPreconfiguredMessage( messageKey, languageCode, defaultLangaugeCode );

    if ( preconfiguredMessage.length === 0 || preconfiguredMessage[ 0 ].messages?.length < 1 ) {
      let e = new Error( 'preconfigured message not found' ) as HttpError;
      e.responseCode = ResponseCode.BAD_REQUEST;
      throw e;
    }

    return preconfiguredMessage[ 0 ];
  };

  private objectToMap = ( obj: object ) => {
    let m = new Map<string, string>();
    for ( const [ key, value ] of Object.entries( obj ) ) {
      m.set( '${' + key + '}', value.toString() );
    }
    return m;
  };
}
