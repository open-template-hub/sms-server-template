import { PreconfiguredMessageDataModel } from '../data/preconfigured-message.data';
import { PreconfiguredMessage } from '../interface/preconfigured-message-interface';

export class PreconfiguredMessageRepository {
  private dataModel: any = null;

  /**
   * initializes preconfigured message repository
   * @param connection db connection
   */
  initialize = async ( connection: any ) => {
    this.dataModel = await new PreconfiguredMessageDataModel().getDataModel(
        connection
    );
    return this;
  };

  /**
   * creates service provider
   * @param provider service provider
   * @returns created service provider
   */
  createPreconfiguredMessage = async ( message: PreconfiguredMessage ) => {
    try {
      return await this.dataModel.create( message );
    } catch ( error ) {
      console.error( '> createPreconfiguredMessage error: ', error );
      throw error;
    }
  };

  /**
   * gets service provider by key
   * @param key key
   * @returns service provider
   */
  getPreconfiguredMessage = async ( key: string, providerKey: string, languageCode: string ) => {
    try {
      // TODO: key && languageCode && providerKey - Done
      return await this.dataModel.findOne( 
        { key },
        { 
          messages: { $elemMatch: { language: "en" } }, 
          payload: { $elemMatch: { provider: providerKey } } 
        }
      );
    } catch ( error ) {
      console.error( '> getPreconfiguredMessage error: ', error );
      throw error;
    }
  };
}
