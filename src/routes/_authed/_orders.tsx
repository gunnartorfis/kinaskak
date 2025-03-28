import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/_orders")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    console.log("_ORDERS", context.user);
    if (!context.user) {
      throw redirect({ to: "/login" });
    }

    if (context.user.profile.role !== "admin") {
      throw redirect({ to: "/" });
    }
  },
});

function RouteComponent() {
  return <div>Hello "/_authed/_orders"!</div>;
}
