import type { Route } from "./+types/login";
import { Login } from "@/pages/Login";

export function loader(_args: Route.LoaderArgs) {
  return {};
}

export default function Component() {
  return <Login />;
}
