"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.error === "Please verify your email before logging in.") {
        setShowVerifyDialog(true);
      } else {
        setErrorMessage(data.error || "Login failed");
        setShowErrorDialog(true);
      }
      return;
    }

    const { access_token, refresh_token } = data;

    if (rememberMe) {
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
    } else {
      sessionStorage.setItem("access_token", access_token);
      sessionStorage.setItem("refresh_token", refresh_token);
    }

    // ✅ 设置 Supabase 会话（必须带 refresh_token）
    await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    // ✅ 设置防重复标志，避免刷新页面后再次调用 setSession 报错
    sessionStorage.setItem("sessionRestored", "true");

    setShowSuccessDialog(true);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/dashboard",
      },
    });
  };

  return (
    <>
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/forgot-password"
                      className="ml-auto text-sm hover:underline underline-offset-4"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <Label htmlFor="rememberMe">Remember Me</Label>
                </div>

                <div className="flex flex-col gap-3">
                  <Button type="submit" className="w-full">
                    Login
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={(e) => {
                      e.preventDefault();
                      handleGoogleLogin();
                    }}
                  >
                    Login with Google
                  </Button>
                </div>
              </div>
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Login successful 🎉</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => router.push("/dashboard")}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Email verification required 📩</AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-center">Please verify your email before logging in.</p>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowVerifyDialog(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Login failed ❌</AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-center">{errorMessage}</p>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowErrorDialog(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
