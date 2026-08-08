import { getSupabase } from "./supabase";
import { CheckoutError } from "./commerce";
import { logCheckoutFailure } from "./checkout-errors";

/** Release active reservations whose expires_at has passed. Safe to call often. */
export async function cleanupExpiredReservations(): Promise<number> {
  const { data, error } = await getSupabase().rpc("cleanup_expired_reservations");
  if (error) {
    logCheckoutFailure("cleanup_expired_reservations", error, {
      supabaseCode: error.code,
      message: error.message,
    });
    throw new CheckoutError(
      500,
      "cleanup_expired_reservations",
      `cleanup_expired_reservations: ${error.message}`,
    );
  }
  return typeof data === "number" ? data : Number(data ?? 0);
}
