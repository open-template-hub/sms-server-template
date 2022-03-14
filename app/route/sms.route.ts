/**
 * @description holds sms routes
 */

import {
  authorizedBy,
  ResponseCode,
  UserRole,
} from '@open-template-hub/common';
import { Request, Response } from 'express';
import Router from 'express-promise-router';
import { SmsController } from '../controller/sms.controller';
import { Sms } from '../interface/sms.interface';

const subRoutes = {
  root: '/',
  me: '/me',
};

export const router = Router();

const smsController = new SmsController();

router.post(
  subRoutes.me,
  authorizedBy([UserRole.ADMIN, UserRole.DEFAULT]),
  async (req: Request, res: Response) => {
    // Send Sms
    const context = res.locals.ctx;

    let sms = await smsController.sendSms(
      context.mongodb_provider,
      req.body as Sms
    );
    res.status(ResponseCode.CREATED).json({ sms });
  }
);
