import { getSupabase } from "./supabase";

/** Release active reservations whose expires_at has passed. Safe to call often. */
export async function cleanupExpiredReservations(): Promise<number> {
  const { data, error } = await getSupabase().rpc("cleanup_expired_reservations");
  if (error) {
    throw new Error(`cleanup_expired_reservations: ${error.message}`);
  }
  return typeof data === "number" ? data : Number(data ?? 0);
}
