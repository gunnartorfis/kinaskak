import { getSupabaseServerClient } from "@/lib/supabase";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

const logoutFn = createServerFn().handler(async () => {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return {
      error: true,
      message: error.message,
    };
  }

  throw redirect({
    href: "/",
  });
});

export const Route = createFileRoute("/logout")({
  preload: false,
  loader: () => logoutFn(),
});
