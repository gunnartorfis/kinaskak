import { createFileRoute } from "@tanstack/react-router";
import { fetchOrder } from "@/serverFns/orders";

export const Route = createFileRoute("/_authed/_orders/orders/$orderId")({
  loader: ({ params }) =>
    fetchOrder({
      data: params.orderId,
    }),
  component: RouteComponent,
});

function RouteComponent() {
  const { orderId } = Route.useParams();
  const order = Route.useLoaderData();

  return (
    <div>
      <h1>Order {orderId}</h1>
      <pre>{JSON.stringify(order, null, 2)}</pre>
    </div>
  );
}
