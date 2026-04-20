import Link from "next/link";
import { login } from "../actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2 } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | ProfitBuilder AI",
  description: "Log in to your ProfitBuilder AI account to continue building your digital business.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const { message, error } = await searchParams;
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-[family-name:var(--font-geist-sans)] p-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardHeader className="space-y-3 text-center">
          <div className="flex justify-center mb-2">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                <Wand2 className="w-6 h-6 text-white" />
              </div>
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
          <CardDescription>Enter your email and password to log in.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={login} className="space-y-4 text-left">
            {error && (
              <div className="p-3 text-sm bg-red-50 text-red-500 rounded-md border border-red-200">
                {error}
              </div>
            )}
            {message && (
              <div className="p-3 text-sm bg-green-50 text-green-600 rounded-md border border-green-200">
                {message}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-xs text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
            
            <SubmitButton
              className="w-full bg-slate-900 text-white hover:bg-slate-800"
            >
              Sign In
            </SubmitButton>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-6">
          <p className="text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-blue-600 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
