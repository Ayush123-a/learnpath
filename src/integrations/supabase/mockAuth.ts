// Mock authentication for local development without Supabase
import { User, Session } from "@supabase/supabase-js";

// Only enable mock auth when explicitly opted in via localStorage,
// NOT automatically in DEV mode — this ensures real Supabase auth is used.
// Toggle by running: localStorage.setItem('MOCK_AUTH', '1')  or  localStorage.removeItem('MOCK_AUTH')
export const MOCK_MODE = false; // Never force-enable — real Supabase is always preferred

const MOCK_USER: User = {
  id: "mock-user-123",
  aud: "authenticated",
  role: "authenticated",
  email: "ayushsinghrawat76456@gmail.com",
  email_confirmed_at: new Date().toISOString(),
  phone: "",
  phone_confirmed_at: undefined,
  phone_change: "",
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {
    full_name: "Ayush Singh",
  },
  identities: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const MOCK_SESSION: Session = {
  provider_token: "mock-token",
  provider_refresh_token: null,
  access_token: "mock-access-token",
  refresh_token: "mock-refresh-token",
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: "bearer",
  user: MOCK_USER,
};

export const getMockAuthState = () => ({
  session: MOCK_SESSION,
  user: MOCK_USER,
  roles: ["admin", "student"] as const,
  collegeId: "mock-college-id",
  collegeName: "Mock University",
  approvalStatus: "approved",
});

import { isMockEnabled } from "./mockDatabase";

// Mock auth is only available when manually enabled via localStorage key
// This lets developers test offline without breaking real Supabase usage
export const isMockAuthAvailable = () => {
  return isMockEnabled();
};

