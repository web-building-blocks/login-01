# Frontend Integration Guide: JWT + Supabase OAuth (Google Login)

This guide documents the frontend changes made to integrate both local JWT login and Supabase Google OAuth login, replacing the previously used `next-auth`. It includes installation steps, reasons for switching, issues encountered, file changes, and third-party settings.

---

## 🚫 Why we removed `next-auth`
- `next-auth` does not work well when trying to combine custom JWT login (local backend) with Supabase OAuth.
- It was hard to distinguish if user info came from JWT or `next-auth`'s Google session.
- Callback redirect and session context (`useSession`) required provider wrapping and were prone to errors like `React Context is unavailable`.

---

## ✅ Installation and Initialization

### 1. Install Supabase
```bash
pnpm install @supabase/supabase-js
```

### 2. Set Supabase credentials in `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Create `lib/supabase.ts`
```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## ⚙️ Google OAuth Setup in Supabase Console

### 1. Go to Supabase > Authentication > Providers > Google
- Enable Google OAuth.
- Fill in:
  - **Client ID** from Google Cloud Console
  - **Client Secret** from Google Cloud Console

### 2. In Supabase > Auth > URL Configuration:
- **Site URL**: `http://localhost:3000`
- **Redirect URLs**: Add `http://localhost:3000/dashboard`

---

## 🔑 Google Cloud Console OAuth Setup

### 1. Go to https://console.cloud.google.com > Credentials
- Create OAuth client ID (Web application)
- Set **Authorized JavaScript origins**:
  - `http://localhost:3000`
- Set **Authorized redirect URIs**:
  - `https://<your-supabase-project>.supabase.co/auth/v1/callback`

### 2. Copy Client ID and Secret into Supabase

---

## 🧠 LoginForm Changes (components/login-form.tsx)
- Support both local JWT login and Supabase OAuth login:
```ts
<Button onClick={handleGoogleLogin}>Login with Google</Button>

const handleGoogleLogin = async () => {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "http://localhost:3000/dashboard",
    },
  });
};
```

---

## 📄 Dashboard Logic (dashboard/page.tsx)

```ts
useEffect(() => {
  const fetchLocalUser = async () => {
    const token = localStorage.getItem("access_token")
    if (!token) return false
    try {
      const res = await fetch("http://localhost:5000/auth/user", {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.email) setUserEmail(data.email)
      return true
    } catch {
      return false
    }
  }

  fetchLocalUser().then(async (ok) => {
    if (!ok) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) setUserEmail(user.email)
    }
  })
}, [])
```

---

## 🧼 Cleanup: Remove next-auth

### 1. Delete these files
- `app/api/auth/[...nextauth]/route.ts`
- `app/providers.tsx` if only used for `SessionProvider`

### 2. Remove packages
```bash
pnpm remove next-auth
```

---

## 🐞 Common Issues

- `redirect_uri_mismatch`: Ensure callback in Google Console exactly matches Supabase callback.
- `React Context unavailable`: caused by missing `<SessionProvider>` with `next-auth`
- `Not logged in` flash: ensure `supabase.auth.getUser()` runs after OAuth redirect finishes.

---

## ✅ Final Project Files Modified

- `lib/supabase.ts` → create Supabase client
- `components/login-form.tsx` → support JWT + OAuth login
- `app/dashboard/page.tsx` → check both local JWT + Supabase session
- `.env.local` → store Supabase credentials
- removed: `app/api/auth/[...nextauth]/route.ts`

---

Now you're ready to support **local JWT login** and **Supabase Google OAuth** together seamlessly in a Next.js app.