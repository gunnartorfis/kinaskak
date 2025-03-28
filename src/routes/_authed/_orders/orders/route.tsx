import { fetchOrders } from "@/serverFns/orders";
import {
  Link,
  Outlet,
  createFileRoute,
  redirect,
} from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/_orders/orders")({
  loader: () => fetchOrders(),
  component: OrdersComponent,
});

function OrdersComponent() {
  const orders = Route.useLoaderData();

  return (
    <div className="p-2 flex gap-2">
      <ul className="list-disc pl-4">
        {orders.map((order) => {
          return (
            <li key={order.id} className="whitespace-nowrap">
              <Link
                to="/orders/$orderId"
                params={{
                  orderId: order.id,
                }}
                className="block py-1 text-blue-800 hover:text-blue-600"
                activeProps={{ className: "text-black font-bold" }}
              >
                <div>{order.id.substring(0, 20)}</div>
              </Link>
            </li>
          );
        })}
      </ul>
      <hr />
      <Outlet />
    </div>
  );
}
