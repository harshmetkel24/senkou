import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/profile")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = Route.useRouteContext();
  return <div>Hello "/_authed/profile"! {user.displayName}</div>;
}
