---
title: "Next.js + Google OAuth Authentication Guide"
description: "This guide explains how to integrate Google OAuth authentication into a Next.js project."
---

import CodeBlock from '@theme/CodeBlock';

# Next.js + Google OAuth Authentication Guide

This guide provides a detailed step-by-step process for setting up **Google OAuth authentication** in a **Next.js** project, including installation, configuration, debugging, and additional enhancements.

## 1️⃣ Install Dependencies

Ensure that your system has Node.js installed (recommended v18 or later).

### Create a Next.js Project

If you don't have a Next.js project yet, create one by running:

```sh
npx create-next-app@latest my-app
cd my-app
```

### Install ShadCN UI

If your project does not have ShadCN UI installed, run:

```sh
npx shadcn init
```

### Add Login Component

```sh
npx shadcn@latest add login-01
```

### Install next-auth Dependency

```sh
pnpm add next-auth
```

> **Note**: If using npm or yarn, use `npm install next-auth` or `yarn add next-auth` instead.

## 2️⃣ Configure Google OAuth

### Create Google OAuth Credentials

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project:
   - Click **Select a Project** → **New Project**
   - Set a project name, e.g., `NextAuth App`
   - Click **Create**
3. Enable OAuth 2.0 authentication:
   - Navigate to **APIs & Services** → **Credentials** in the left sidebar
   - Click **+ Create Credentials** → Select **OAuth Client ID**

### Configure OAuth Consent Screen

1. On the **OAuth Consent Screen** page:
   - **Select User Type**
     - If it's a personal or test app, choose `External`
     - If it's for internal organizational use, choose `Internal` (Google Workspace only)
   - **Fill in Application Information**
     - **App Name**: `NextAuth App`
     - **User Support Email**: Your Google account email
     - **Developer Contact Email**: Your Google account email
   - Click **Save and Continue**

2. Go back to **API & Services → Credentials**
   - Click **Create Credentials** → Select **OAuth Client ID**
   - Choose **Web application** as the application type
   - Fill in the OAuth configuration:
     - **Name**: `NextAuth Google Login`
     - **Authorized JavaScript origins**: `http://localhost:3000`
     - **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`
   - Click **Create**
   - **Copy the `Client ID` and `Client Secret`**, then save them in `.env.local`:

```ini
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 3️⃣ Set Up NextAuth API Route

Create an API endpoint in `app/api/auth/[...nextauth]/route.ts`:

```tsx
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    })
  ]
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### Add to `.env.local`

```ini
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

## 4️⃣ Fix Common Errors

### `Cannot find module 'next-auth/react'`

**Cause**: `next-auth` is not properly installed.

**Solution**:

```sh
pnpm add next-auth
```

Then restart VS Code and the Next.js server.

### `Event handlers cannot be passed to Client Component props`

**Cause**: You're using `onClick` inside a **Server Component**, which cannot handle interactivity.

**Solution**:
In `components/ui/login-form.tsx`, add:

```tsx
"use client"; // ✅ Converts LoginForm into a Client Component
```

### `NEXTAUTH_SECRET` Errors

**Solution**:

Manually generate `NEXTAUTH_SECRET` and add it to `.env.local`:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output string into `.env.local`:

```ini
NEXTAUTH_SECRET=your_random_generated_secret
NEXTAUTH_URL=http://localhost:3000
```

## 5️⃣ Implement Signup and Forgot Password

### Create Signup and Forgot Password Pages

1. Create `pages/signup.tsx`:

```tsx
export default function SignupPage() {
  return <h1>Signup Page</h1>;
}
```

2. Create `pages/forgot-password.tsx`:

```tsx
export default function ForgotPasswordPage() {
  return <h1>Forgot Password Page</h1>;
}
```

### Create SignupForm and ForgotPasswordForm Components

1. Create `components/ui/signup-form.tsx`:

```tsx
"use client";
export default function SignupForm() {
  return <form>Signup Form</form>;
}
```

2. Create `components/ui/forgot-password-form.tsx`:

```tsx
"use client";
export default function ForgotPasswordForm() {
  return <form>Forgot Password Form</form>;
}
```

### Modify LoginForm Component

In `components/ui/login-form.tsx`, ensure `"use client"` is added:

```tsx
"use client";
export default function LoginForm() {
  return <form>Login Form</form>;
}
```

## 6️⃣ Run the Project

Start the Next.js development server:

```sh
pnpm dev
```

If using npm or yarn:

```sh
npm run dev
# or
yarn dev
```

Now, open `http://localhost:3000`, and you should see the Google login functionality! 🚀

---

This completes your **Next.js + Google OAuth authentication** setup guide 🎉
