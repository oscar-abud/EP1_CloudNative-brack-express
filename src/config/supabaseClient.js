import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

// Cliente único de Supabase (Singleton): se crea una sola vez acá y todos
// los models lo importan, en vez de instanciar uno nuevo cada vez.
// Usa la secret key, así que bypassa RLS: solo el backend la tiene.
export const supabase = createClient(env.supabaseUrl, env.supabaseSecretKey, {
  auth: { persistSession: false },
});
