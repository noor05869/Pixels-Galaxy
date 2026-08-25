export default function OrdersLoading() {
  return (
    <main className="admin-page" aria-busy="true">
      <section className="admin-loading" role="status" aria-live="polite" aria-atomic="true">
        <p className="checkout-kicker">Private order dashboard</p>
        <h1>Loading orders</h1>
        <p>Fetching the latest Cash on Delivery records.</p>
        <div className="admin-loading-lines" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>
    </main>
  );
}
