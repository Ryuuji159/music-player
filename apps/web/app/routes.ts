import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('./routes/home.tsx'),
  route('/admin', './routes/admin.tsx'),
  route('/join/:token', './routes/join.tsx'),
  route('/:slug', './routes/client.tsx'),
  route('/:slug/control', './routes/control.tsx'),
  route('/:slug/player', './routes/player.tsx'),
] satisfies RouteConfig;
