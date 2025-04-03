"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    // 1. 清除 Supabase 认证信息
    await supabase.auth.signOut();

    // 2. 清除 localStorage 里的 access_token
    localStorage.removeItem("access_token");

    // 3. 跳转回 Login 页面
    router.push("/login");
  };

  return (
    <Button variant="outline" onClick={handleLogout}>
      Logout
    </Button>
  );
}
