"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");

  const handleUpdate = async () => {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      alert("Update failed: " + error.message);
    } else {
      alert("Password updated!");
      window.location.href = "/login";
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold">Set a new password</h1>
        <Input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button onClick={handleUpdate}>Update Password</Button>
      </div>
    </div>
  );
}
