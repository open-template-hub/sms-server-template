/**
 * @description holds provider data model
 */

import mongoose from 'mongoose';

export class PreconfiguredMessageDataModel {
  private readonly collectionName: string = 'preconfigured_message';

  private productSchema: mongoose.Schema;

  constructor() {
    /**
     * Provider schema
     */
    const schema: mongoose.SchemaDefinition = {
      key: { type: String, unique: true, required: true, dropDups: true },
      messages: { type: Array, required: true },
      payload: { type: Object, required: true }
    };

    this.productSchema = new mongoose.Schema( schema );
  }

  /**
   * creates provider model
   * @returns provider model
   */
  getDataModel = async ( conn: mongoose.Connection ) => {
    return conn.model(
        this.collectionName,
        this.productSchema,
        this.collectionName
    );
  };
}
