const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

export function getApiBase(): string {
  return API_URL;
}

export type CartLinePayload = { variantId: string; quantity: number };

export type CheckoutSessionResponse = {
  clientSecret: string;
  orderId: string;
  orderNumber: string;
  expiresAt: string;
};

export type InventoryChangedLine = {
  variantId: string;
  reason: string;
  available?: number;
};

export type AvailabilityItem = {
  variantId: string;
  sku: string;
  slug: string;
  name: string;
  color: string;
  size: string;
  unitAmount: number;
  available: number;
  soldOut: boolean;
  imageUrl: string | null;
};

export type OrderStatusDto = {
  status: "paid" | "processing" | "open" | "expired" | "failed";
  orderNumber: string;
  customerEmail: string | null;
  customerName: string | null;
  currency: string;
  subtotalAmount: number;
  shippingAmount: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  shippingAddress: {
    line1: string | null;
    line2: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: string | null;
  } | null;
  items: Array<{
    productName: string;
    color: string;
    size: string;
    quantity: number;
    unitAmount: number;
    lineTotal: number;
  }>;
};

async function parseJson<T>(res: Response): Promise<T & { error?: string; code?: string; lines?: InventoryChangedLine[] }> {
  const data = (await res.json().catch(() => ({}))) as T & {
    error?: string;
    code?: string;
    lines?: InventoryChangedLine[];
  };
  if (!res.ok) {
    const err = new Error(data.error || "Request failed") as Error & {
      status: number;
      code?: string;
      lines?: InventoryChangedLine[];
    };
    err.status = res.status;
    err.code = data.code;
    err.lines = data.lines;
    throw err;
  }
  return data;
}

export async function fetchAvailability(): Promise<AvailabilityItem[]> {
  if (!API_URL) return [];
  const res = await fetch(`${API_URL}/api/catalog/availability`);
  const data = await parseJson<{ items: AvailabilityItem[] }>(res);
  return data.items ?? [];
}

export async function createCheckoutSession(
  items: CartLinePayload[],
  resumeOrderId?: string | null,
): Promise<CheckoutSessionResponse> {
  if (!API_URL) {
    throw new Error("Checkout is not configured (missing VITE_API_URL).");
  }
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/checkout/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        ...(resumeOrderId ? { resumeOrderId } : {}),
      }),
    });
  } catch {
    throw new Error(
      `Cannot reach the checkout API at ${API_URL}. Start the API (port 8080 Express or 8787 wrangler) and confirm VITE_API_URL.`,
    );
  }
  return parseJson<CheckoutSessionResponse>(res);
}

export async function fetchOrderBySession(sessionId: string): Promise<OrderStatusDto> {
  if (!API_URL) {
    throw new Error("Order lookup is not configured (missing VITE_API_URL).");
  }
  const res = await fetch(
    `${API_URL}/api/checkout/status?session_id=${encodeURIComponent(sessionId)}`,
  );
  return parseJson<OrderStatusDto>(res);
}
