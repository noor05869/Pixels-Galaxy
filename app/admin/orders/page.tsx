import { AdminDashboardHeader } from "../../../components/admin/AdminDashboardHeader";
import { OrdersTable } from "../../../components/admin/OrdersTable";
import { requireAdmin } from "../../../lib/admin/auth";
import { listOrders } from "../../../lib/orders/repository";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  await requireAdmin();

  let orders;
  try {
    orders = await listOrders();
  } catch {
    return (
      <main className="admin-page">
        <AdminDashboardHeader
          eyebrow="Private order dashboard"
          title="COD orders"
          description="Review delivery details and keep fulfilment status current."
        />
        <section className="admin-provider-error" role="alert" aria-labelledby="orders-error-title">
          <h2 id="orders-error-title">Orders unavailable</h2>
          <p>The order service could not be reached. Refresh the page to try again.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <AdminDashboardHeader
        eyebrow="Private order dashboard"
        title="COD orders"
        description="Review delivery details and keep fulfilment status current."
      />
      <OrdersTable orders={orders} />
    </main>
  );
}
