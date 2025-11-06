import { createClient } from "@supabase/supabase-js";

/**
 * Initializes and exports the Supabase client.
 * This singleton instance is used to interact with the Supabase backend (database, auth, etc.)
 * It reads the Supabase URL and anonymous key from environment variables.
 */
export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
