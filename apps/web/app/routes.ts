import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('./routes/home.tsx'),
  route('/admin', './routes/admin.tsx', [
    index('./routes/admin.index.tsx'),
    route('venues', './routes/admin.venues.tsx'),
    route('users', './routes/admin.users.tsx'),
  ]),
  route('/select', './routes/select.tsx'),
  route('/join/:token', './routes/join.tsx'),
  route('/:slug', './routes/client.tsx'),
  route('/:slug/control', './routes/control.tsx'),
  route('/:slug/player', './routes/player.tsx'),
] satisfies RouteConfig;
