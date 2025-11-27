// contexts/auth.tsx
import { getCurrentUserFn } from "@/lib/auth";
import { AuthContextType } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createContext, ReactNode, useContext } from "react";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export async function AuthProvider({ children }: { children: ReactNode }) {
  const getCurrentUser = useServerFn(getCurrentUserFn);
  const {
    data: user,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["auth"],
    queryFn: async () => {
      return await getCurrentUser();
    },
  });

  return (
    <AuthContext.Provider value={{ user, isLoading, refetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
