import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
  beforeLoad: () => {
    throw redirect({
      to: "/products/$handle",
      params: {
        handle: "kinaskak-skrifblokk",
      },
    });
  },
});

function Home() {
  return null;
}
