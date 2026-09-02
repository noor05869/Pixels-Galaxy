export const kuStringColors = ["blue", "green", "pink"] as const;
export type KuStringColor = (typeof kuStringColors)[number];
export type CartLine = { productId: string; name: string; image: string; unitPrice: number; quantity: number; bundleId: string; bundleQuantity?: number; colors?: KuStringColor[] };
