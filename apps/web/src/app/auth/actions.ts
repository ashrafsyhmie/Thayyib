"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

function getRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${key} is required.`);
  }

  return value.trim();
}

function getRedirectPath(formData: FormData) {
  const redirectTo = formData.get("redirectTo");

  if (typeof redirectTo === "string" && redirectTo.startsWith("/")) {
    return redirectTo;
  }

  return "/";
}

export async function signInAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/login?error=Supabase%20is%20not%20configured%20yet");
  }

  const email = getRequiredString(formData, "email");
  const password = getRequiredString(formData, "password");
  const redirectTo = getRedirectPath(formData);
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(formatAuthError(error.message))}`);
  }

  redirect(redirectTo);
}

export async function signUpAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/register?error=Supabase%20is%20not%20configured%20yet");
  }

  const email = getRequiredString(formData, "email");
  const password = getRequiredString(formData, "password");
  const confirmPassword = getRequiredString(formData, "confirmPassword");
  const redirectTo = getRedirectPath(formData);

  if (password !== confirmPassword) {
    redirect("/register?error=Passwords%20do%20not%20match");
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: getOptionalString(formData, "fullName"),
        company_name: getOptionalString(formData, "companyName"),
      },
    },
  });

  if (error) {
    redirect(`/register?error=${encodeURIComponent(formatAuthError(error.message))}`);
  }

  redirect(
    `/login?redirectTo=${encodeURIComponent(redirectTo)}&message=Account%20created.%20Please%20check%20your%20email%20if%20confirmation%20is%20enabled.`,
  );
}

export async function signOutAction() {
  if (!hasSupabaseEnv()) {
    redirect("/login");
  }

  const supabase = await createClient();

  await supabase.auth.signOut();
  redirect("/login");
}

export async function signInWithGoogleAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/login?error=Supabase%20is%20not%20configured%20yet");
  }

  const redirectTo = getRedirectPath(formData);
  const origin = (await headers()).get("origin");
  const supabase = await createClient();

  if (!origin) {
    redirect("/login?error=Unable%20to%20start%20Google%20sign%20in");
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(formatAuthError(error.message))}`);
  }

  if (data.url) {
    redirect(data.url);
  }

  redirect("/login?error=Unable%20to%20start%20Google%20sign%20in");
}

export async function resetPasswordAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/forgot-password?error=Supabase%20is%20not%20configured%20yet");
  }

  const email = getRequiredString(formData, "email");
  const origin = (await headers()).get("origin");
  const supabase = await createClient();

  if (!origin) {
    redirect("/forgot-password?error=Unable%20to%20start%20password%20reset");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/login?message=Password%20reset%20completed`,
  });

  if (error) {
    redirect(`/forgot-password?error=${encodeURIComponent(formatAuthError(error.message))}`);
  }

  redirect(
    "/forgot-password?message=Password%20reset%20link%20sent%20if%20the%20email%20exists",
  );
}

function getOptionalString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    return undefined;
  }

  return value.trim();
}

function formatAuthError(message: string) {
  if (/invalid login credentials/i.test(message)) {
    return "Invalid email or password. If this email used another sign-in method before, reset the password and then sign in with email.";
  }

  if (/user already registered|already been registered/i.test(message)) {
    return "An account already exists for this email. Try logging in or reset the password.";
  }

  return message;
}
