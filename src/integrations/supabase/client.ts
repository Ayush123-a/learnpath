import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { mockSupabase, isMockEnabled } from './mockDatabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// Safe storage: falls back to sessionStorage if localStorage is blocked
// (e.g., iOS Safari in private/incognito mode, or strict browser settings)
const safeStorage = (() => {
  try {
    localStorage.setItem('__lp_test__', '1');
    localStorage.removeItem('__lp_test__');
    return localStorage;
  } catch {
    return sessionStorage;
  }
})();

const realSupabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: safeStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});

export const supabase = new Proxy(realSupabase, {
  get(target, prop, receiver) {
    if (isMockEnabled()) {
      return Reflect.get(mockSupabase, prop, receiver) || Reflect.get(target, prop, receiver);
    }
    return Reflect.get(target, prop, receiver);
  }
}) as any;