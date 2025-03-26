import CartProviderServer from "@/components/cart/cart-provider-server";
import { Inter } from "next/font/google";
import { ReactNode } from "react";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <CartProviderServer>
          <main>
            {children}
            <Toaster closeButton />
          </main>
        </CartProviderServer>
      </body>
    </html>
  );
}
