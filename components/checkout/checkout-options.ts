export const paymentOptions = [
  { id: "cod", label: "Cash on Delivery", disabled: false },
  { id: "bank", label: "Bank Transfer", disabled: true },
  { id: "card", label: "Credit/Debit Card", disabled: true },
  { id: "raast", label: "RAAST", disabled: true },
] as const;
