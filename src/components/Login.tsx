import { LoginForm } from "@/components/login-form";
import { useMutation } from "@/hooks/useMutation";
import { loginFn } from "@/routes/_authed";
import { useRouter } from "@tanstack/react-router";

export function Login() {
  const router = useRouter();

  const loginMutation = useMutation({
    fn: loginFn,
    onSuccess: async (ctx) => {
      if (!ctx.data?.error) {
        await router.invalidate();
        router.navigate({ to: "/" });
        return;
      }
    },
  });

  return (
    <LoginForm
      onSubmit={(e) => {
        const formData = new FormData(e.target as HTMLFormElement);

        loginMutation.mutate({
          data: {
            email: formData.get("email") as string,
            password: formData.get("password") as string,
          },
        });
      }}
    />
  );
}
