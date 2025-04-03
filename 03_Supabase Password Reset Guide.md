# 🔐 Supabase Password Reset Flow Guide

This guide walks through implementing a password reset flow using Supabase in a fullstack app with Express backend and Next.js frontend.

---

## 📦 Step 1: Configure Supabase Auth Settings

### 1.1 Set Site URL
- Navigate to `Authentication > URL Configuration` in Supabase dashboard.
- Set **Site URL** to:
  ```
  http://localhost:3000
  ```

### 1.2 Add Redirect URL
- Add a **Redirect URL** for password reset:
  ```
  http://localhost:3000/update-password
  ```

---

## 🚀 Step 2: Backend - Add Reset Email Endpoint

Add the following route to your Express backend:

```ts
router.post("/forgot-password", async (req: Request, res: Response) => {
  const { email } = req.body;

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "http://localhost:3000/update-password",
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(200).json({ message: "Password reset email sent" });
});
```

---

## 💽 Step 3: Frontend - Send Password Reset Request

In your `ForgotPasswordForm.tsx`:

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const res = await fetch("http://localhost:5000/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  alert(data.message || data.error);
};
```

---

## 🔐 Step 4: Frontend - Handle Supabase Password Reset

Create a new file: `app/update-password/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    const token = new URLSearchParams(hash.replace("#", "?")).get("access_token");
    if (token) {
      supabase.auth.setSession({ access_token: token, refresh_token: "" });
      setAccessToken(token);
    }
  }, []);

  const handleUpdate = async () => {
    if (!accessToken) {
      alert("No access token found");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      alert("Password update failed: " + error.message);
    } else {
      alert("Password updated successfully");
      router.push("/login");
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
```

---

## ✨ Step 5: Configure GitHub Actions Environment Variables

To securely use Supabase environment variables in your GitHub Actions:

### 📍 Step 1: Go to Secrets
1. Open your repository: `https://github.com/your-username/your-repo`
2. Go to `Settings`
3. In the left sidebar, click `Secrets and variables > Actions`
4. Click `New repository secret`

### ➕ Step 2: Add the following secrets

- **Name:** `NEXT_PUBLIC_SUPABASE_URL`
  - **Value:** `https://lhyuiixwhyojeefnxaeu.supabase.co`

- **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoeXVpaXh3aHlvamVlZm54YWV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMzA0NDIsImV4cCI6MjA1ODYwNjQ0Mn0.Rn0LHb0AbHzthslwogid6ngq1gbIKV_InFJoK7PoV5g`

### 🔧 Step 3: Use them in workflow

In your `.github/workflows/frontend.yml`:

```yaml
- name: Build app
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
    NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
  run: pnpm build
```

This ensures secrets are injected securely into your CI without being exposed ✅

---

## ✅ Final Test Flow

1. Go to `forgot-password` page and submit your email.
2. Click the link received by email (redirects to `/update-password`).
3. Set a new password → you'll be redirected to login.
4. Login using the new password.