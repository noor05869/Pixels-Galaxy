"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartLine } from "@/lib/cart/types";
import { changeCartLineQuantity, reconcileCartLines, removeCartLine } from "@/lib/cart/cart-lines";

type CartValue = { lines: CartLine[]; totalQuantity: number; isOpen: boolean; isHydrated: boolean; addItem: (line: CartLine) => void; updateQuantity: (productId: string, bundleId: string, quantity: number) => void; removeItem: (productId: string, bundleId: string) => void; clearCart: () => void; openCart: () => void; closeCart: () => void };
const CartContext = createContext<CartValue | null>(null);
const key = "pixels-galaxy-cart-v2";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]); const [isOpen, setOpen] = useState(false); const [ready, setReady] = useState(false);
  useEffect(() => { try { setLines(reconcileCartLines(JSON.parse(localStorage.getItem(key) ?? "[]"))); } catch {} setReady(true); }, []);
  useEffect(() => { if (ready) try { if (lines.length === 0) localStorage.removeItem(key); else localStorage.setItem(key, JSON.stringify(lines)); } catch {} }, [lines, ready]);
  const value = useMemo<CartValue>(() => ({ lines, totalQuantity: lines.reduce((sum, line) => sum + line.quantity, 0), isOpen, isHydrated: ready,
    addItem: (line) => { setLines((current) => { const found = current.find((x) => x.productId === line.productId && x.bundleId === line.bundleId); return reconcileCartLines(found ? current.map((x) => x === found ? { ...x, quantity: x.quantity + line.quantity } : x) : [...current, line]); }); setOpen(true); },
    updateQuantity: (productId, bundleId, quantity) => setLines((current) => changeCartLineQuantity(current, productId, bundleId, quantity)), removeItem: (productId, bundleId) => setLines((current) => removeCartLine(current, productId, bundleId)), clearCart: () => { setLines([]); try { localStorage.removeItem(key); } catch {} }, openCart: () => setOpen(true), closeCart: () => setOpen(false),
  }), [lines, isOpen, ready]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() { const value = useContext(CartContext); if (!value) throw new Error("useCart must be used inside CartProvider"); return value; }
