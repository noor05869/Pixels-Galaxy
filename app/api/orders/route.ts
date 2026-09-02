import { getOrderApiConfig } from "../../../lib/config/server";
import { createMemoryRateLimiter } from "../../../lib/orders/rate-limit";
import { submitOrder } from "../../../lib/orders/service";
import { createPostHandler, jsonResponse } from "./handler";

// This bounded map protects one server instance. Distributed production enforcement
// must also be configured at the hosting platform or edge firewall.
const rateLimiter = createMemoryRateLimiter();

export async function POST(request: Request): Promise<Response> {
  try {
    const config = getOrderApiConfig();
    return await createPostHandler({
      submitOrder,
      attempt: (key) => rateLimiter.attempt(key),
      clientIpHeader: config.clientIpHeader,
    })(request);
  } catch {
    return jsonResponse({ error: "Order service unavailable" }, 503);
  }
}
