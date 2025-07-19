import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("./routes/dashboard.tsx"),
  route("login", "./routes/login.tsx"),
  route("register", "./routes/register.tsx"),

  // api routes
  route("api/login", "./api/actions/login.ts"),
  route("api/register", "./api/actions/register.ts"),
] satisfies RouteConfig;
