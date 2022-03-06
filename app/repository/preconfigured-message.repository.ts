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
  getPreconfiguredMessage = async ( key: string, languageCode: string | undefined, defaultLangaugeCode: string ) => {
    try {
      let dataModel = await this.dataModel.aggregate([
        { $match: { key } },
        { $project: {
          payload: 1,
          messages: {
            $filter: {
              input: "$messages",
              as: "message",
              cond: {
                $or: [
                  { $eq: [ "$$message.language", languageCode ] },
                  { $eq: [ "$$message.language", defaultLangaugeCode ]}
                ]
              }
            }
          }
        } }
      ] );

      let newMessagesArray: string[] = [];
      if( dataModel.length > 0 && dataModel[0].messages?.length > 1 ) {
        for( const message of dataModel[0].messsages ) {
          if( message.language === languageCode ) {
            newMessagesArray.push( message );
          }
        }

        if( newMessagesArray.length > 0 ) {
          dataModel[0].messages = newMessagesArray;
        }
      }

      return dataModel
    } catch ( error ) {
      console.error( '> getPreconfiguredMessage error: ', error );
      throw error;
    }
  };
}
