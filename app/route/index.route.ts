import {
  context,
  DebugLogUtil,
  EncryptionUtil,
  ErrorHandlerUtil,
  MessageQueueProvider,
  MongoDbProvider,
  PreloadUtil,
} from '@open-template-hub/common';
import { NextFunction, Request, Response } from 'express';
import { Environment } from '../../environment';
import { SmsQueueConsumer } from '../consumer/sms-queue.consumer';
import { router as smsRouter } from './sms.route';
import { router as monitorRouter } from './monitor.route';

const subRoutes = {
  root: '/',
  monitor: '/monitor',
  sms: '/sms',
};

export namespace Routes {
  var mongodb_provider: MongoDbProvider;
  var environment: Environment;
  var message_queue_provider: MessageQueueProvider;
  let errorHandlerUtil: ErrorHandlerUtil;
  const debugLogUtil = new DebugLogUtil();

  export const mount = (app: any) => {
    const preloadUtil = new PreloadUtil();
    environment = new Environment();
    errorHandlerUtil = new ErrorHandlerUtil(debugLogUtil, environment.args());
    mongodb_provider = new MongoDbProvider(environment.args());

    message_queue_provider = new MessageQueueProvider(environment.args());

    const channelTag = new Environment().args().mqArgs
      ?.smsServerMessageQueueChannel as string;
    message_queue_provider.getChannel(channelTag).then((channel: any) => {
      const smsQueueConsumer = new SmsQueueConsumer(channel, mongodb_provider);
      message_queue_provider.consume(
        channel,
        channelTag,
        smsQueueConsumer.onMessage,
        1
      );
    });

    preloadUtil
      .preload(mongodb_provider)
      .then(() => console.log('DB preloads are completed.'));

    const responseInterceptor = (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      let originalSend = res.send;
      const encryptionUtil = new EncryptionUtil(environment.args());
      res.send = function () {
        debugLogUtil.log('Starting Encryption: ', new Date());
        const encrypted_arguments = encryptionUtil.encrypt(arguments);
        debugLogUtil.log('Encryption Completed: ', new Date());

        originalSend.apply(res, encrypted_arguments as any);
      } as any;

      next();
    };

    // Use this interceptor before routes
    app.use(responseInterceptor);

    // INFO: Keep this method at top at all times
    app.all('/*', async (req: Request, res: Response, next: NextFunction) => {
      try {
        // create context
        res.locals.ctx = await context(
          req,
          environment.args(),
          mongodb_provider,
          undefined,
          message_queue_provider
        );

        next();
      } catch (err) {
        let error = errorHandlerUtil.handle(err);
        res.status(error.code).json({ message: error.message });
      }
    });

    // INFO: Add your routes here
    app.use(subRoutes.monitor, monitorRouter);
    app.use(subRoutes.sms, smsRouter);

    // Use for error handling
    app.use(function (
      err: Error,
      req: Request,
      res: Response,
      next: NextFunction
    ) {
      let error = errorHandlerUtil.handle(err);
      res.status(error.code).json({ message: error.message });
    });
  };
}
