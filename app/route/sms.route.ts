/**
 * @description holds sms routes
 */

import { ResponseCode } from '@open-template-hub/common';
import { Request, Response } from 'express';
import Router from 'express-promise-router';
import { SmsController } from '../controller/sms.controller';
import { PreconfiguredMessage } from '../interface/preconfigured-message-interface';
import { Sms } from '../interface/sms.interface';

const subRoutes = {
  root: '/',
  me: '/me',
  public: '/public',
  preconfiguredMessage: '/preconfigured-message'
};

export const publicRoutes = [subRoutes.public];
export const adminRoutes = [subRoutes.preconfiguredMessage]
// export const adminRoutes = [];

export const router = Router();

const smsController = new SmsController();

router.post(subRoutes.me, async (req: Request, res: Response) => {
  // Send Sms
  const context = res.locals.ctx

  let sms = await smsController.sendSms(
    context.mongodb_provider,
    req.body as Sms
  );
  res.status(ResponseCode.CREATED).json({ sms });
});

/*router.post(subRoutes.preconfiguredMessage, async (req: Request, res: Response) => {
  let response = await smsController.createPreconfiguredMessage(
      res.locals.ctx,
      req.body as PreconfiguredMessage
  )
  res.status(ResponseCode.CREATED).json({ response });
});*/
