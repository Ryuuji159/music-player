import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index('./routes/client.tsx'),
    route('/control', './routes/control.tsx'),
    route("/player", "./routes/player.tsx"),
] satisfies RouteConfig;
