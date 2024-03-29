import {
  ContextArgs,
  mount as mountApp,
  MountArgs,
  MountAssets,
  Route,
  RouteArgs,
} from '@open-template-hub/common';
import { Environment } from '../../environment';
import { SmsQueueConsumer } from '../consumer/sms-queue.consumer';
import { router as monitorRouter } from './monitor.route';
import { router as smsRouter } from './sms.route';

const subRoutes = {
  root: '/',
  monitor: '/monitor',
  sms: '/sms',
};

export namespace Routes {
  export const mount = (app: any) => {
    const envArgs = new Environment().args();

    const ctxArgs = {
      envArgs,
      providerAvailability: {
        mongo_enabled: true,
        postgre_enabled: false,
        mq_enabled: true,
        redis_enabled: false,
      },
    } as ContextArgs;

    const assets = {
      mqChannelTag: envArgs.mqArgs?.smsServerMessageQueueChannel as string,
      queueConsumer: new SmsQueueConsumer(),
      applicationName: 'SmsServer',
    } as MountAssets;

    const routes: Array<Route> = [];

    routes.push({ name: subRoutes.monitor, router: monitorRouter });
    routes.push({ name: subRoutes.sms, router: smsRouter });

    const routeArgs = { routes } as RouteArgs;

    const args = {
      app,
      ctxArgs,
      routeArgs,
      assets,
    } as MountArgs;

    mountApp(args);
  };
}
