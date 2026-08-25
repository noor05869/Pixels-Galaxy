import { notFound } from "next/navigation";

import { AdminDashboardHeader } from "../../../../components/admin/AdminDashboardHeader";
import { OrderDetail } from "../../../../components/admin/OrderDetail";
import { requireAdmin } from "../../../../lib/admin/auth";
import { getOrderByNumber } from "../../../../lib/orders/repository";

const ORDER_NUMBER = /^PG-[A-Z0-9]{6}$/;

type OrderPageProps = {
  params: Promise<{ orderNumber: string }>;
};

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: OrderPageProps) {
  await requireAdmin();

  const { orderNumber } = await params;
  if (!ORDER_NUMBER.test(orderNumber)) notFound();

  let order;
  try {
    order = await getOrderByNumber(orderNumber);
  } catch {
    return (
      <main id="main-content" className="admin-page">
        <AdminDashboardHeader
          eyebrow="Order record"
          title={orderNumber}
          description="Delivery, notification, and fulfilment information."
          backHref="/admin/orders"
          backLabel="All orders"
        />
        <section className="admin-provider-error" role="alert" aria-labelledby="order-error-title">
          <h2 id="order-error-title">Order unavailable</h2>
          <p>The order service could not be reached. Refresh the page to try again.</p>
        </section>
      </main>
    );
  }

  if (!order) notFound();

  return (
    <main id="main-content" className="admin-page">
      <AdminDashboardHeader
        eyebrow="Order record"
        title={order.orderNumber}
        description="Delivery, notification, and fulfilment information."
        backHref="/admin/orders"
        backLabel="All orders"
      />
      <OrderDetail order={order} />
    </main>
  );
}
