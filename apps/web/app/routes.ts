import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    route("/player", "./routes/player.tsx"),
] satisfies RouteConfig;
