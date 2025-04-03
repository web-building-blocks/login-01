"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LogoutButton } from "@/components/LogoutButton";

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      const token = data?.session?.access_token;
      const email = data?.session?.user?.email;

      if (token && email) {
        localStorage.setItem("access_token", token);
        setUserEmail(email);
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      // fallback: Check local token (compatible with old login)
      const stored = localStorage.getItem("access_token");
      if (stored) {
        try {
          const res = await fetch("http://localhost:5000/auth/user", {
            headers: {
              Authorization: `Bearer ${stored}`,
            },
          });
          const json = await res.json();
          if (json.email) {
            setUserEmail(json.email);
            setIsAuthenticated(true);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.error("Token expired or invalid", err);
        }
      }

      router.replace("/login");
    };

    checkSession();
  }, [router]);

  if (isLoading) return <div className="text-center mt-10">Loading...</div>;
  if (!isAuthenticated) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">Welcome, {userEmail}!</h1>
      <LogoutButton />
    </div>
  );
}
