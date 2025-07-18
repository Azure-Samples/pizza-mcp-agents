export interface PizzaOrder {
  id: string;
  createdAt: string;
  items: Array<{
    pizzaId: string;
    quantity: number;
    extraToppingIds?: string[];
  }>;
  estimatedCompletionAt: string;
  totalPrice: number;
  status: string;
  completedAt?: string;
}

export async function fetchOrders({
  apiBaseUrl,
  status,
  lastMinutes = 10
}: {
  apiBaseUrl: string;
  status?: string;
  lastMinutes?: number;
}): Promise<PizzaOrder[] | undefined> {
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (lastMinutes) params.append('last', `${lastMinutes}m`);
    const url = `${apiBaseUrl}/api/orders?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) return undefined;
    return await res.json();
  } catch {
    return undefined;
  }
}
