import "server-only";

import { createHash } from "node:crypto";
import { isIP } from "node:net";

import { createClient } from "@supabase/supabase-js";

import { getSupabaseConfig } from "../config/server";

const DEFAULT_CLIENT_LIMIT = 10;
const DEFAULT_WINDOW_MS = 15 * 60 * 1_000;
const DEFAULT_GLOBAL_LIMIT = 500;
const DEFAULT_TRUSTED_RESERVE = 20;
const DEFAULT_MAX_TRUSTED_CLIENTS = 20;
const DEFAULT_TRUST_DURATION_MS = 30 * 24 * 60 * 60 * 1_000;
const CLIENT_KEY_PATTERN = /^[a-f0-9]{64}$/;

export type AdminLoginOutcome = "failure" | "success";

export type AdminLoginReservation = {
  id: string;
};

export type AdminLoginRateLimiter = {
  reserve(clientKey: string): Promise<AdminLoginReservation | null>;
  complete(reservation: AdminLoginReservation, outcome: AdminLoginOutcome): Promise<void>;
};

type MemoryAttempt = {
  clientKey: string;
  attemptedAt: number;
};

export type MemoryAdminLoginRateLimitState = {
  attempts: Map<string, MemoryAttempt>;
  trustedUntil: Map<string, number>;
  lockTail: Promise<void>;
  nextId: number;
};

type MemoryLimiterOptions = {
  state?: MemoryAdminLoginRateLimitState;
  now?: () => number;
  clientLimit?: number;
  windowMs?: number;
  globalLimit?: number;
  trustedReserve?: number;
  maxTrustedClients?: number;
  trustDurationMs?: number;
};

type RpcResult = {
  data: unknown;
  error: unknown;
};

export type AdminLoginRateLimitRpcClient = {
  rpc(name: string, args: Record<string, string>): PromiseLike<RpcResult>;
};

function throttleUnavailable(): Error {
  return new Error("Admin sign-in throttle unavailable");
}

export function adminLoginClientKey(request: Request, trustedHeader: string): string {
  const candidate = request.headers.get(trustedHeader)?.trim();
  const identity = candidate && candidate.length <= 45 && isIP(candidate) !== 0
    ? candidate
    : "admin-client-fallback-v1";
  return createHash("sha256").update(identity).digest("hex");
}

export function createMemoryAdminLoginRateLimitState(): MemoryAdminLoginRateLimitState {
  return {
    attempts: new Map(),
    trustedUntil: new Map(),
    lockTail: Promise.resolve(),
    nextId: 1,
  };
}

async function withMemoryLock<T>(
  state: MemoryAdminLoginRateLimitState,
  operation: () => T,
): Promise<T> {
  const previous = state.lockTail;
  let release!: () => void;
  state.lockTail = new Promise<void>((resolve) => {
    release = resolve;
  });

  await previous;
  try {
    return operation();
  } finally {
    release();
  }
}

export function createMemoryAdminLoginRateLimiter(
  options: MemoryLimiterOptions = {},
): AdminLoginRateLimiter {
  const state = options.state ?? createMemoryAdminLoginRateLimitState();
  const now = options.now ?? Date.now;
  const clientLimit = options.clientLimit ?? DEFAULT_CLIENT_LIMIT;
  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
  const globalLimit = options.globalLimit ?? DEFAULT_GLOBAL_LIMIT;
  const trustedReserve = options.trustedReserve ?? DEFAULT_TRUSTED_RESERVE;
  const maxTrustedClients = options.maxTrustedClients ?? DEFAULT_MAX_TRUSTED_CLIENTS;
  const trustDurationMs = options.trustDurationMs ?? DEFAULT_TRUST_DURATION_MS;

  function prune(currentTime: number): void {
    const cutoff = currentTime - windowMs;
    for (const [id, attempt] of state.attempts) {
      if (attempt.attemptedAt <= cutoff) state.attempts.delete(id);
    }
    for (const [clientKey, expiry] of state.trustedUntil) {
      if (expiry <= currentTime) state.trustedUntil.delete(clientKey);
    }
  }

  return {
    reserve(clientKey) {
      return withMemoryLock(state, () => {
        const currentTime = now();
        prune(currentTime);

        let clientAttempts = 0;
        for (const attempt of state.attempts.values()) {
          if (attempt.clientKey === clientKey) clientAttempts += 1;
        }

        if (clientAttempts >= clientLimit) return null;

        const trusted = (state.trustedUntil.get(clientKey) ?? 0) > currentTime;
        if (state.attempts.size >= globalLimit + trustedReserve) return null;
        if (state.attempts.size >= globalLimit && !trusted) return null;

        const id = `memory-reservation-${state.nextId}`;
        state.nextId += 1;
        state.attempts.set(id, { clientKey, attemptedAt: currentTime });
        return { id };
      });
    },
    complete(reservation, outcome) {
      return withMemoryLock(state, () => {
        const currentTime = now();
        prune(currentTime);
        const attempt = state.attempts.get(reservation.id);
        if (!attempt || outcome === "failure") return;

        for (const [id, candidate] of state.attempts) {
          if (candidate.clientKey === attempt.clientKey) state.attempts.delete(id);
        }
        state.trustedUntil.delete(attempt.clientKey);
        state.trustedUntil.set(attempt.clientKey, currentTime + trustDurationMs);
        while (state.trustedUntil.size > maxTrustedClients) {
          const oldestClientKey = state.trustedUntil.keys().next().value as string | undefined;
          if (!oldestClientKey) break;
          state.trustedUntil.delete(oldestClientKey);
        }
      });
    },
  };
}

export function createSupabaseAdminLoginRateLimiter(
  client: AdminLoginRateLimitRpcClient,
): AdminLoginRateLimiter {
  return {
    async reserve(clientKey) {
      if (!CLIENT_KEY_PATTERN.test(clientKey)) throw throttleUnavailable();

      const { data, error } = await client.rpc("reserve_admin_login_attempt", {
        p_client_key: clientKey,
      });
      const row = Array.isArray(data) ? data[0] as Record<string, unknown> | undefined : undefined;
      if (error || !row || typeof row.allowed !== "boolean") throw throttleUnavailable();
      if (!row.allowed) return null;
      if (typeof row.reservation_id !== "string" || row.reservation_id.length === 0) {
        throw throttleUnavailable();
      }
      return { id: row.reservation_id };
    },
    async complete(reservation, outcome) {
      const { error } = await client.rpc("complete_admin_login_attempt", {
        p_reservation_id: reservation.id,
        p_outcome: outcome,
      });
      if (error) throw throttleUnavailable();
    },
  };
}

function createSharedAdminLoginRateLimiter(): AdminLoginRateLimiter {
  const config = getSupabaseConfig();
  const client = createClient(config.supabaseUrl, config.supabaseSecretKey, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  });
  return createSupabaseAdminLoginRateLimiter(client as unknown as AdminLoginRateLimitRpcClient);
}

let defaultRateLimiter: AdminLoginRateLimiter | undefined;

export function getAdminLoginRateLimiter(): AdminLoginRateLimiter {
  defaultRateLimiter ??= process.env.NODE_ENV === "production"
    ? createSharedAdminLoginRateLimiter()
    : createMemoryAdminLoginRateLimiter();
  return defaultRateLimiter;
}
