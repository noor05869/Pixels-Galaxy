import { createLogoutHandler } from "./handler";

export async function POST(): Promise<Response> {
  return createLogoutHandler({ secureCookie: process.env.NODE_ENV === "production" })();
}
