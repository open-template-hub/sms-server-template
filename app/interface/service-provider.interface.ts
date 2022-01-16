/**
 * @description holds service provider interface
 */

export interface ServiceProvider {
  key: string;
  description: string;
  payload: any; // TODO: add from: default to send direct message - Done
}
