import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("./routes/dashboard.tsx"),
  route("login", "./routes/login.tsx"),
  route("register", "./routes/register.tsx"),
  route("workout", "./routes/add-workout.tsx"),
  route("workout/:id", "./routes/workout.tsx"),

  // api POST routes
  route("api/login", "./api/actions/login.ts"),
  route("api/register", "./api/actions/register.ts"),
  route("api/add-workout", "./api/actions/add-workout.ts"),
  route("api/add-exercise", "./api/actions/add-exercise.ts"),
] satisfies RouteConfig;
