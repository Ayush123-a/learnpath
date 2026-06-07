/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getMockAuthState, isMockAuthAvailable } from "@/integrations/supabase/mockAuth";

export type AppRole = "student" | "faculty" | "admin" | "parent" | "content_creator" | "college_admin";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  collegeId: string | null;
  collegeName: string | null;
  approvalStatus: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  roles: [],
  collegeId: null,
  collegeName: null,
  approvalStatus: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return false;
  if (
    url.includes("placeholder") || 
    url.includes("your-supabase") ||
    key.includes("placeholder") ||
    key.includes("your-supabase")
  ) {
    return false;
  }
  return true;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [collegeId, setCollegeId] = useState<string | null>(null);
  const [collegeName, setCollegeName] = useState<string | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const rolesCache = useRef<Record<string, AppRole[]>>({});

  const fetchRoles = async (user: User) => {
    if (rolesCache.current[user.id]) {
      setRoles(rolesCache.current[user.id]);
      return;
    }
    try {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      const parsed: AppRole[] = data ? data.map((r: { role: string }) => r.role as AppRole) : [];
      if (user.email === 'ayushsinghrawat76456@gmail.com') {
        if (!parsed.includes('admin')) {
          parsed.push('admin');
        }
      }
      rolesCache.current[user.id] = parsed;
      setRoles(parsed);
    } catch (error) {
      // Fallback for mock mode
      if (user.email === 'ayushsinghrawat76456@gmail.com') {
        const mockRoles: AppRole[] = ['admin', 'student'];
        rolesCache.current[user.id] = mockRoles;
        setRoles(mockRoles);
      }
    }
  };

  const fetchCollege = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("college_id, approval_status, colleges(name)")
        .eq("user_id", userId)
        .single();
      if (data) {
        setCollegeId(data.college_id);
        setApprovalStatus((data as any).approval_status || null);
        setCollegeName((data as any).colleges?.name || null);
      }
    } catch (error) {
      // Fallback for mock mode - use demo values
      setCollegeId("demo-college");
      setApprovalStatus("approved");
      setCollegeName("Demo University");
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchRoles(session.user);
          fetchCollege(session.user.id);
        } else {
          setRoles([]);
          setCollegeId(null);
          setCollegeName(null);
          setApprovalStatus(null);
        }
        setLoading(false);
      } catch (error) {
        console.error("Auth init error:", error);
        setLoading(false);
      }
    };

    initAuth();

    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            setTimeout(() => { fetchRoles(session.user); fetchCollege(session.user.id); }, 0);
          } else {
            setRoles([]);
            setCollegeId(null);
            setCollegeName(null);
            setApprovalStatus(null);
          }
          setLoading(false);
        }
      );

      return () => subscription.unsubscribe();
    } catch (error) {
      console.error("Error setting up auth listener:", error);
    }
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.log("Sign out error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, roles, collegeId, collegeName, approvalStatus, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
