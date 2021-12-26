/**
 * @description holds sms interface
 */

export interface Sms {
  id: string;
  message: string;
  from: string;
  to: string;
  created_time?: Date;
  status?: string;
}
