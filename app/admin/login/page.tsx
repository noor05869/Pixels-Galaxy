import { AdminLoginForm } from "../../../components/admin/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <main id="main-content" className="checkout-page">
      <section className="checkout-state" aria-labelledby="admin-login-title">
        <p className="checkout-kicker">Private order dashboard</p>
        <h1 id="admin-login-title">Admin sign in</h1>
        <p>Enter the administrator password to manage Cash on Delivery orders.</p>
        <AdminLoginForm />
      </section>
    </main>
  );
}
