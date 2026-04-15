import Link from "next/link";
import { signup } from "../actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2 } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | ProfitBuilder AI",
  description: "Create your account and start building your AI-powered digital business.",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const { message, error } = await searchParams;
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-[family-name:var(--font-geist-sans)] p-4">
        <form action={signup} className="w-full max-w-md">
          <Card className="shadow-xl border-slate-200">
            <CardHeader className="space-y-3 text-center">
              <div className="flex justify-center mb-2">
                <Link href="/" className="inline-flex items-center gap-2">
                  <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                    <Wand2 className="w-6 h-6 text-white" />
                  </div>
                </Link>
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
              <CardDescription>Start building your AI business today.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm bg-red-50 text-red-500 rounded-md border border-red-200">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium">Full Name</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  required
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-violet-600 text-white hover:bg-violet-700 py-2 rounded-md font-semibold mt-4 cursor-pointer"
              >
                Sign Up via Email
              </button>
            </CardContent>
            <CardFooter className="flex justify-center border-t p-6">
              <p className="text-sm text-slate-500">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </form>
    </div>
  );
}
