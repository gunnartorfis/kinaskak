import CartModal from "@/components/cart-modal";
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary";
import { NotFound } from "@/components/NotFound";
import { CartProvider } from "@/context/cart-context";
import { getCartIdServer } from "@/context/use-cart-id";
import { seo } from "@/lib/seo";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getCartItems } from "@/serverFns/cart";
import appCss from "@/styles/app.css?url";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  redirect,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createServerFn } from "@tanstack/react-start";
import { ThemeProvider } from "next-themes";
import * as React from "react";
import { Toaster } from "sonner";

const fetchUser = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = await getSupabaseServerClient();
  const { data, error: _error } = await supabase.auth.getUser();

  if (!data.user?.id) {
    return null;
  }

  const userProfile = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (!userProfile?.data) {
    return null;
  }

  return {
    id: data.user.id,
    name: data.user.user_metadata.name,
    email: data.user.email,
    profile: userProfile.data,
  };
});

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...seo({
        title:
          "TanStack Start | Type-Safe, Client-First, Full-Stack React Framework",
        description: `TanStack Start is a type-safe, client-first, full-stack React framework. `,
      }),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      { rel: "manifest", href: "/site.webmanifest", color: "#fffff" },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  beforeLoad: async () => {
    // temporarily redirect to our Facebook page
    throw redirect({
      href: "https://www.facebook.com/profile.php?id=61575878091177",
    });

    const user = await fetchUser();

    return {
      user,
    };
  },
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    );
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
  loader: async () => {
    const cartId = await getCartIdServer();

    if (!cartId) {
      return {
        items: [],
        cartId: null,
      };
    }

    const items = await getCartItems({ data: { cartId } });

    return {
      items,
      cartId,
    };
  },
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const { cartId, items } = Route.useLoaderData();

  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <CartProvider initialItems={items} cartId={cartId}>
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <nav className="relative flex items-center justify-between p-4 lg:px-6">
              <div className="flex w-full justify-end items-center">
                <div className="flex justify-end md:w-1/3">
                  <CartModal />
                </div>
              </div>
            </nav>
            {children}
            <TanStackRouterDevtools position="bottom-right" />
            <Scripts />
            <Toaster />
          </ThemeProvider>
        </body>
      </CartProvider>
    </html>
  );
}
