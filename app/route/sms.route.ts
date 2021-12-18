/**
 * @description holds sms routes
 */

import { ResponseCode } from '@open-template-hub/common';
import { Request, Response } from 'express';
import Router from 'express-promise-router';
import { SmsController } from '../controller/sms.controller';
import { Sms } from '../interface/sms.interface';

const subRoutes = {
  root: '/',
  me: '/me',
  public: '/public',
};

export const publicRoutes = [subRoutes.public];

export const router = Router();

const smsController = new SmsController();

router.post(subRoutes.me, async (req: Request, res: Response) => {
  // Send Sms
  let sms = await smsController.sendSms(
    res.locals.ctx,
    req.body.payload as Sms
  );
  res.status(ResponseCode.CREATED).json({ sms });
});
