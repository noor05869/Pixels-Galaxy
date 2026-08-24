"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartLine } from "@/lib/cart/types";

type CartValue = { lines: CartLine[]; totalQuantity: number; isOpen: boolean; addItem: (line: CartLine) => void; updateQuantity: (id: string, quantity: number) => void; removeItem: (id: string) => void; openCart: () => void; closeCart: () => void };
const CartContext = createContext<CartValue | null>(null);
const key = "pixels-galaxy-cart-v2";
const clamp = (n: number) => Math.max(1, Math.min(99, Math.round(n)));

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]); const [isOpen, setOpen] = useState(false); const [ready, setReady] = useState(false);
  useEffect(() => { try { const value = JSON.parse(localStorage.getItem(key) ?? "[]"); if (Array.isArray(value)) setLines(value.filter((x) => x && typeof x.productId === "string" && Number.isFinite(x.quantity)).map((x) => ({ ...x, quantity: clamp(x.quantity) }))); } catch {} setReady(true); }, []);
  useEffect(() => { if (ready) try { localStorage.setItem(key, JSON.stringify(lines)); } catch {} }, [lines, ready]);
  const value = useMemo<CartValue>(() => ({ lines, totalQuantity: lines.reduce((sum, line) => sum + line.quantity, 0), isOpen,
    addItem: (line) => { setLines((current) => { const found = current.find((x) => x.productId === line.productId && x.bundleId === line.bundleId); return found ? current.map((x) => x === found ? { ...x, quantity: clamp(x.quantity + line.quantity) } : x) : [...current, { ...line, quantity: clamp(line.quantity) }]; }); setOpen(true); },
    updateQuantity: (id, quantity) => setLines((current) => current.map((x) => x.productId === id ? { ...x, quantity: clamp(quantity) } : x)), removeItem: (id) => setLines((current) => current.filter((x) => x.productId !== id)), openCart: () => setOpen(true), closeCart: () => setOpen(false),
  }), [lines, isOpen]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() { const value = useContext(CartContext); if (!value) throw new Error("useCart must be used inside CartProvider"); return value; }
