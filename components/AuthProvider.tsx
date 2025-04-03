"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // ✅ 监听会话变化
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          console.log("Signed out");
          router.replace("/login");
        }

        if (event === "TOKEN_REFRESHED") {
          console.log("Session refreshed");
          localStorage.setItem("access_token", session?.access_token ?? "");
        }

        if (event === "SIGNED_IN") {
          console.log("Signed in");
          localStorage.setItem("access_token", session?.access_token ?? "");
        }
      }
    );

    // ✅ 定时检测 session（每15分钟）
    const interval = setInterval(async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        console.log("Session expired");
        router.replace("/login");
      }
    }, 15 * 60 * 1000); // 每15分钟检查一次(30s test)

    return () => {
      listener.subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [router]);

  return <>{children}</>;
}
