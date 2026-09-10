import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export default function CheckoutPage() {
  return (
    <main id="main-content" className="mx-auto w-[min(calc(100%_-_40px),1240px)] pb-[90px] pt-[clamp(44px,7vw,84px)] max-[560px]:w-[min(calc(100%_-_24px),1240px)] max-[560px]:pb-[60px] max-[560px]:pt-[34px]">
      <CheckoutForm />
    </main>
  );
}
