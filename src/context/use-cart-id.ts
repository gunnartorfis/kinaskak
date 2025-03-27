import { createServerFn } from "@tanstack/react-start";
import {
  getCookie,
  setCookie,
  deleteCookie,
} from "@tanstack/react-start/server";
import { z } from "zod";

const CART_ID_COOKIE_NAME = "cartId";

export const getCartIdServer = createServerFn({ method: "GET" }).handler(
  async () => {
    const cookie = getCookie(CART_ID_COOKIE_NAME);
    return cookie ?? null;
  }
);

export const setCartIdServer = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ cartId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { cartId } = data;
    setCookie(CART_ID_COOKIE_NAME, cartId);
  });

export const deleteCartIdServer = createServerFn({ method: "POST" }).handler(
  async () => {
    deleteCookie(CART_ID_COOKIE_NAME);
  }
);
