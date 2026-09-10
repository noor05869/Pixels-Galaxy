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
      <main id="main-content" className="mx-auto w-[min(calc(100%_-_40px),1360px)] pb-[90px] pt-[clamp(42px,6vw,78px)] max-[760px]:w-[min(calc(100%_-_24px),1360px)] max-[760px]:pb-[60px] max-[760px]:pt-[34px]">
        <AdminDashboardHeader
          eyebrow="Order record"
          title={orderNumber}
          description="Delivery, notification, and fulfilment information."
          backHref="/admin/orders"
          backLabel="All orders"
        />
        <section className="rounded-[18px] border border-[#d9e3ef] border-t-[6px] border-t-[#c8323e] bg-white p-[clamp(28px,5vw,54px)] text-center shadow-[0_12px_35px_rgba(6,27,67,.07)] [&_h2]:m-0 [&_h2]:text-[clamp(27px,4vw,38px)] [&_h2]:uppercase [&_h2]:text-navy [&_p]:mx-auto [&_p]:mb-0 [&_p]:mt-3 [&_p]:max-w-[600px] [&_p]:font-[700] [&_p]:leading-[1.6] [&_p]:text-[#5d718c]" role="alert" aria-labelledby="order-error-title">
          <h2 id="order-error-title">Order unavailable</h2>
          <p>The order service could not be reached. Refresh the page to try again.</p>
        </section>
      </main>
    );
  }

  if (!order) notFound();

  return (
    <main id="main-content" className="mx-auto w-[min(calc(100%_-_40px),1360px)] pb-[90px] pt-[clamp(42px,6vw,78px)] max-[760px]:w-[min(calc(100%_-_24px),1360px)] max-[760px]:pb-[60px] max-[760px]:pt-[34px]">
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
