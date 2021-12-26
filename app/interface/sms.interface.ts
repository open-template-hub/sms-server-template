/**
 * @description holds sms interface
 */

export interface Sms {
  id: number;
  message: string;
  from: string;
  to: string;
  created_time?: Date;
  status?: string;
}
