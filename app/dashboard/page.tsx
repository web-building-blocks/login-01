"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LogoutButton } from "@/components/LogoutButton";

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSupabaseUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        setUserEmail(user.email);
      } else {
        router.replace("/login"); // ✅ 如果未登录，跳转到 login
      }
      setIsLoading(false);
    };

    const fetchLocalUser = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.replace("/login"); // ✅ 本地没有 token 也跳转
        return false;
      }

      try {
        const res = await fetch("http://localhost:5000/auth/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.email) {
          setUserEmail(data.email);
          setIsLoading(false);
          return true;
        } else {
          router.replace("/login"); // ✅ Token 失效，跳转
        }
      } catch (err) {
        console.error("Local auth error:", err);
        router.replace("/login"); // ✅ 发生错误也跳转
      }

      return false;
    };

    fetchLocalUser().then(async (ok) => {
      if (!ok) {
        await fetchSupabaseUser();
      }
    });
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">
        {isLoading
          ? "Loading..."
          : userEmail
          ? `Welcome, ${userEmail}!`
          : "Not logged in"}
      </h1>

      {/* ✅ 添加 Logout 按钮 */}
      <LogoutButton />
    </div>
  );
}
