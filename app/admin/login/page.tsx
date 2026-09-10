import { AdminLoginForm } from "../../../components/admin/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <main id="main-content" className="mx-auto w-[min(calc(100%_-_40px),1240px)] pb-[90px] pt-[clamp(44px,7vw,84px)] max-[560px]:w-[min(calc(100%_-_24px),1240px)] max-[560px]:pb-[60px] max-[560px]:pt-[34px]">
      <section className="mx-auto my-[clamp(20px,6vw,70px)] max-w-[780px] rounded-[20px] border border-[#d9e3ef] bg-white p-[clamp(34px,6vw,70px)] text-center shadow-[0_12px_35px_rgba(6,27,67,.08)] max-[560px]:px-5 max-[560px]:py-9" aria-labelledby="admin-login-title">
        <p className="mb-[15px] mt-0 text-xs font-[1000] tracking-[.18em] text-[#087998]">Private order dashboard</p>
        <h1 className="m-0 text-[clamp(46px,7vw,78px)] leading-[.92] tracking-[-.045em] uppercase max-[560px]:text-[42px]" id="admin-login-title">Admin sign in</h1>
        <p className="mx-auto mt-[18px] max-w-[620px] font-[700] leading-[1.65] text-[#486080]">Enter the administrator password to manage Cash on Delivery orders.</p>
        <AdminLoginForm />
      </section>
    </main>
  );
}
