import { useRouteContext } from "@tanstack/react-router";

export function useAuth() {
  const context = useRouteContext({
    from: "__root__",
  });
  if (!context) {
    throw new Error("useAuth must be used within __root__ route only");
  }
  const { user } = context;
  return { user };
}
