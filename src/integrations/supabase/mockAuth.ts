// Mock authentication for local development without Supabase
import { User, Session } from "@supabase/supabase-js";

// Always enable mock auth in dev mode or when Supabase is not accessible
export const MOCK_MODE = import.meta.env.DEV;

const MOCK_USER: User = {
  id: "mock-user-123",
  aud: "authenticated",
  role: "authenticated",
  email: "ayushsinghrawat76456@gmail.com",
  email_confirmed_at: new Date().toISOString(),
  phone: null,
  phone_confirmed_at: null,
  phone_change: null,
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
  expires_at: Date.now() + 3600000,
  token_type: "bearer",
  session_created_at: Date.now(),
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

// Enable mock auth in development mode
export const isMockAuthAvailable = () => {
  if (typeof window === "undefined") return false;
  // Check if we're in dev mode
  return MOCK_MODE;
};
