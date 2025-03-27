"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSupabaseUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
      setIsLoading(false); // ✅ 无论有没有拿到 user 都要结束 loading
    };

    const fetchLocalUser = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return false;

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
        }
      } catch (err) {
        console.error("Local auth error:", err);
      }

      return false;
    };

    fetchLocalUser().then(async (ok) => {
      if (!ok) {
        await fetchSupabaseUser();
      }
    });
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">
        {isLoading
          ? "Loading..."
          : userEmail
          ? `Welcome, ${userEmail}!`
          : "Not logged in"}
      </h1>
    </div>
  );
}
