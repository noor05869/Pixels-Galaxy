export default function OrdersLoading() {
  return (
    <main id="main-content" className="mx-auto w-[min(calc(100%_-_40px),1360px)] pb-[90px] pt-[clamp(42px,6vw,78px)] max-[760px]:w-[min(calc(100%_-_24px),1360px)] max-[760px]:pb-[60px] max-[760px]:pt-[34px]" aria-busy="true">
      <section className="mx-auto my-[clamp(20px,6vw,70px)] max-w-[780px] rounded-[18px] border border-[#d9e3ef] bg-white p-[clamp(34px,6vw,70px)] text-center shadow-[0_12px_35px_rgba(6,27,67,.07)] [&>p:nth-of-type(2)]:mb-0 [&>p:nth-of-type(2)]:mt-4 [&>p:nth-of-type(2)]:font-[700] [&>p:nth-of-type(2)]:leading-[1.6] [&>p:nth-of-type(2)]:text-[#5d718c] [&_h1]:m-0 [&_h1]:text-[clamp(42px,6vw,68px)] [&_h1]:leading-[.95] [&_h1]:uppercase [&_h1]:text-navy" role="status" aria-live="polite" aria-atomic="true">
        <p className="mb-2.5 mt-0 text-xs font-[1000] tracking-[.18em] text-[#087998]">Private order dashboard</p>
        <h1>Loading orders</h1>
        <p>Fetching the latest Cash on Delivery records.</p>
        <div className="mx-auto mt-8 grid max-w-[480px] gap-2.5 [&_span]:h-3 [&_span]:rounded-full [&_span]:bg-[#dce8f4] [&_span:nth-child(2)]:w-[82%] [&_span:nth-child(2)]:justify-self-center [&_span:nth-child(3)]:w-[62%] [&_span:nth-child(3)]:justify-self-center" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>
    </main>
  );
}
