import { createHash } from "node:crypto";
import { isIP } from "node:net";

import { InvalidOrderError } from "../../../lib/orders/service";
import { parseCheckoutInput } from "../../../lib/orders/validation";

const MAX_BODY_BYTES = 32 * 1024;

type PostHandlerDependencies = {
  submitOrder: (value: unknown) => Promise<{ orderNumber: string }>;
  attempt: (clientKey: string) => boolean;
  clientIpHeader: string;
};

class PayloadTooLargeError extends Error {}

export function jsonResponse(body: Record<string, string>, status: number): Response {
  return Response.json(body, { status, headers: { "cache-control": "no-store" } });
}

function hasJsonContentType(request: Request): boolean {
  return request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() === "application/json";
}

async function readBodyWithinLimit(request: Request): Promise<string> {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) throw new PayloadTooLargeError();
  if (!request.body) return "";

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalLength = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalLength += value.byteLength;
    if (totalLength > MAX_BODY_BYTES) {
      await reader.cancel().catch(() => undefined);
      throw new PayloadTooLargeError();
    }
    chunks.push(value);
  }
  const body = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder().decode(body);
}

function clientKey(request: Request, trustedHeader: string): string {
  const headerValue = request.headers.get(trustedHeader)?.trim();
  const identity = headerValue && headerValue.length <= 45 && isIP(headerValue) !== 0
    ? headerValue
    : "order-client-fallback-v1";
  return createHash("sha256").update(identity).digest("hex");
}

export function createPostHandler(dependencies: PostHandlerDependencies): (request: Request) => Promise<Response> {
  return async (request) => {
    if (!hasJsonContentType(request)) return jsonResponse({ error: "JSON content type required" }, 415);

    let value: unknown;
    try {
      value = JSON.parse(await readBodyWithinLimit(request));
    } catch (error) {
      if (error instanceof PayloadTooLargeError) return jsonResponse({ error: "Request body too large" }, 413);
      return jsonResponse({ error: "Invalid order" }, 400);
    }

    let input: ReturnType<typeof parseCheckoutInput>;
    try { input = parseCheckoutInput(value); }
    catch { return jsonResponse({ error: "Invalid order" }, 400); }

    if (!dependencies.attempt(clientKey(request, dependencies.clientIpHeader))) {
      return jsonResponse({ error: "Too many order attempts" }, 429);
    }

    try {
      const result = await dependencies.submitOrder(input);
      return jsonResponse({ orderNumber: result.orderNumber }, 201);
    } catch (error) {
      if (error instanceof InvalidOrderError) return jsonResponse({ error: "Cart items changed; review your cart" }, 409);
      return jsonResponse({ error: "Order service unavailable" }, 503);
    }
  };
}
