export type PublicRoute = 'login' | 'register';
export type InternalRoute =
  | 'devices'
  | 'history'
  | 'device-detail'
  | 'alerts';
export type AppRoute = PublicRoute | InternalRoute;
