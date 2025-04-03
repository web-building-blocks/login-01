"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [dialog, setDialog] = useState<{ title: string; message: string } | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      let message = "Signup failed";
      if (data.error?.toLowerCase().includes("already registered")) {
        message = "This email has already been registered. Please log in instead.";
      }

      setDialog({ title: "Signup failed", message });
      return;
    }

    setDialog({
      title: "Signup successful",
      message: "Please check your email to verify.",
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Sign up
              </Button>
              <p className="text-sm text-muted-foreground text-center mt-2">
                Already have an account?{" "}
                <a href="/login" className="text-primary underline">
                  Log in here
                </a>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      {dialog && (
        <AlertDialog
          open={!!dialog}
          onOpenChange={(open) => {
            if (!open && dialog.title === "Signup successful") router.push("/login");
            if (!open) setDialog(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{dialog.title}</AlertDialogTitle>
              <AlertDialogDescription>{dialog.message}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
