/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

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
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    let parsed: AppRole[] = data ? data.map((r: { role: string }) => r.role as AppRole) : [];
    if (user.email === 'ayushsinghrawat76456@gmail.com') {
      if (!parsed.includes('admin')) {
        parsed.push('admin');
      }
    }
    rolesCache.current[user.id] = parsed;
    setRoles(parsed);
  };

  const fetchCollege = async (userId: string) => {
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
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          // Use setTimeout to avoid Supabase deadlock
          setTimeout(() => { fetchRoles(session.user); fetchCollege(session.user.id); }, 0);
        } else {
          setRoles([]);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRoles(session.user.id);
        fetchCollege(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setRoles([]);
  };

  return (
    <AuthContext.Provider value={{ session, user, roles, collegeId, collegeName, approvalStatus, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
