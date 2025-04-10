"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const getTokenStore = () => {
      if (
        localStorage.getItem("access_token") &&
        localStorage.getItem("refresh_token")
      )
        return localStorage;

      if (
        sessionStorage.getItem("access_token") &&
        sessionStorage.getItem("refresh_token")
      )
        return sessionStorage;

      return null;
    };

    const store = getTokenStore();

    if (!store) {
      console.warn("❌ No tokens found");
      router.replace("/login");
      return;
    }

    const accessToken = store.getItem("access_token");
    const refreshToken = store.getItem("refresh_token");
    const sessionRestored = sessionStorage.getItem("sessionRestored") === "true";

    // 🛡️ Token 校验
    if (
      !accessToken ||
      !refreshToken ||
      refreshToken === "undefined" ||
      accessToken === "undefined"
    ) {
      console.warn("❌ Missing or invalid tokens");
      store.removeItem("access_token");
      store.removeItem("refresh_token");
      sessionStorage.removeItem("sessionRestored");
      router.replace("/login");
      return;
    }

    // ✅ 如果 session 已恢复且仍有效，跳过恢复逻辑
    if (sessionRestored) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          setLoading(false);
        } else {
          console.warn("⚠️ sessionRestored 标记为 true 但 session 实际无效");
          store.removeItem("access_token");
          store.removeItem("refresh_token");
          sessionStorage.removeItem("sessionRestored");
          router.replace("/login");
        }
      });
      return;
    }

    const restoreSession = async () => {
      try {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) throw error;

        store.setItem("access_token", data.session?.access_token ?? "");
        store.setItem("refresh_token", data.session?.refresh_token ?? "");
        sessionStorage.setItem("sessionRestored", "true");

        setLoading(false);
      } catch (err) {
        console.error("❌ Session restore failed:", (err as Error).message);
        store.removeItem("access_token");
        store.removeItem("refresh_token");
        sessionStorage.removeItem("sessionRestored");
        router.replace("/login");
      }
    };

    restoreSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const target =
          localStorage.getItem("access_token") !== null
            ? localStorage
            : sessionStorage;

        if (event === "SIGNED_OUT") {
          sessionStorage.removeItem("sessionRestored");
          target.removeItem("access_token");
          target.removeItem("refresh_token");
          router.replace("/login");
        }

        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          target.setItem("access_token", session?.access_token ?? "");
          target.setItem("refresh_token", session?.refresh_token ?? "");
          sessionStorage.setItem("sessionRestored", "true");
        }
      }
    );

    const interval = setInterval(async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        console.warn("🕑 Session expired on interval");
        store.removeItem("access_token");
        store.removeItem("refresh_token");
        sessionStorage.removeItem("sessionRestored");
        router.replace("/login");
      }
    }, 15 * 60 * 1000); // 每 15 分钟检查一次

    return () => {
      listener.subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [mounted, router]);

  if (!mounted || loading) return null;

  return <>{children}</>;
}
