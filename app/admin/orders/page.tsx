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
      <main id="main-content" className="mx-auto w-[min(calc(100%_-_40px),1360px)] pb-[90px] pt-[clamp(42px,6vw,78px)] max-[760px]:w-[min(calc(100%_-_24px),1360px)] max-[760px]:pb-[60px] max-[760px]:pt-[34px]">
        <AdminDashboardHeader
          eyebrow="Private order dashboard"
          title="COD orders"
          description="Review delivery details and keep fulfilment status current."
        />
        <section className="rounded-[18px] border border-[#d9e3ef] border-t-[6px] border-t-[#c8323e] bg-white p-[clamp(28px,5vw,54px)] text-center shadow-[0_12px_35px_rgba(6,27,67,.07)] [&_h2]:m-0 [&_h2]:text-[clamp(27px,4vw,38px)] [&_h2]:uppercase [&_h2]:text-navy [&_p]:mx-auto [&_p]:mb-0 [&_p]:mt-3 [&_p]:max-w-[600px] [&_p]:font-[700] [&_p]:leading-[1.6] [&_p]:text-[#5d718c]" role="alert" aria-labelledby="orders-error-title">
          <h2 id="orders-error-title">Orders unavailable</h2>
          <p>The order service could not be reached. Refresh the page to try again.</p>
        </section>
      </main>
    );
  }

  return (
    <main id="main-content" className="mx-auto w-[min(calc(100%_-_40px),1360px)] pb-[90px] pt-[clamp(42px,6vw,78px)] max-[760px]:w-[min(calc(100%_-_24px),1360px)] max-[760px]:pb-[60px] max-[760px]:pt-[34px]">
      <AdminDashboardHeader
        eyebrow="Private order dashboard"
        title="COD orders"
        description="Review delivery details and keep fulfilment status current."
      />
      <OrdersTable orders={orders} />
    </main>
  );
}
