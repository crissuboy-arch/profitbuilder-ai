"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  console.log("Login action started", {
    email: formData.get("email"),
  });
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    console.error("Login error:", error.message);
    return redirect("/login?error=Could not authenticate user");
  }

  console.log("Login successful, redirecting to dashboard");

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  console.log("!!! Signup server action hit !!!");
  console.log("Form data:", Object.fromEntries(formData.entries()));
  const supabase = await createClient();

  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      emailRedirectTo: `${origin}/api/auth/callback`,
      data: {
        full_name: formData.get("fullName") as string,
      }
    },
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    console.error("Signup error:", error.message);
    return redirect("/signup?error=Could not create user");
  }

  console.log("Signup successful, redirecting to login");

  // Redirect to a check-email page or directly to dashboard based on email conf settings
  redirect("/login?message=Check your email to continue sign in process");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
