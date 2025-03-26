"use client";

import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/lib/utils/image";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { ShoppingCartIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Price from "components/price";
import { DEFAULT_OPTION } from "lib/constants";
import { createUrl } from "lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import { useCart } from "./cart-context";
import { DeleteItemButton } from "./delete-item-button";
import { EditItemQuantityButton } from "./edit-item-quantity-button";
import { useCartTotals } from "./hooks";

type MerchandiseSearchParams = {
  [key: string]: string;
};

export default function CartModal() {
  const { cart } = useCart();
  const cartTotals = useCartTotals();
  const [isOpen, setIsOpen] = useState(false);
  const quantityRef = useRef(cartTotals.totalQuantity);
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  useEffect(() => {
    if (
      cartTotals.totalQuantity !== quantityRef.current &&
      cartTotals.totalQuantity > 0
    ) {
      if (!isOpen) {
        setIsOpen(true);
      }
      quantityRef.current = cartTotals.totalQuantity;
    }
  }, [isOpen, cartTotals.totalQuantity]);

  return (
    <>
      <Button
        variant="outline"
        aria-label="Open cart"
        onClick={openCart}
        className="relative"
      >
        <ShoppingCartIcon className="h-6" />
        {cartTotals.totalQuantity > 0 && (
          <div className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-black text-xs text-white dark:bg-white dark:text-black">
            {cartTotals.totalQuantity}
          </div>
        )}
      </Button>
      <Transition show={isOpen}>
        <Dialog onClose={closeCart} className="relative z-50">
          <TransitionChild
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="opacity-0 backdrop-blur-none"
            enterTo="opacity-100 backdrop-blur-[.5px]"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="opacity-100 backdrop-blur-[.5px]"
            leaveTo="opacity-0 backdrop-blur-none"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          </TransitionChild>
          <TransitionChild
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <DialogPanel className="fixed bottom-0 right-0 top-0 flex h-full w-full flex-col border-l border-neutral-200 bg-white/80 p-6 text-black backdrop-blur-xl md:w-[390px] dark:border-neutral-700 dark:bg-black/80 dark:text-white">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">Karfan mín</p>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Close cart"
                  onClick={closeCart}
                >
                  <XMarkIcon />
                </Button>
              </div>

              {!cart || cart.items.length === 0 ? (
                <div className="mt-20 flex w-full flex-col items-center justify-center overflow-hidden">
                  <ShoppingCartIcon className="h-16" />
                  <p className="mt-6 text-center text-2xl font-bold">
                    Karfan þín er tóm.
                  </p>
                </div>
              ) : (
                <div className="flex h-full flex-col justify-between overflow-hidden p-1">
                  <ul className="grow overflow-auto py-4">
                    {cart.items
                      .sort((a, b) =>
                        a.product.name.localeCompare(b.product.name)
                      )
                      .map((item) => {
                        const merchandiseSearchParams =
                          {} as MerchandiseSearchParams;

                        // Add variant options to search params if needed
                        if (item.variant.name !== DEFAULT_OPTION) {
                          merchandiseSearchParams.variant = item.variant.name;
                        }

                        const merchandiseUrl = createUrl(
                          `/product/${item.product.handle}`,
                          new URLSearchParams(merchandiseSearchParams)
                        );

                        return (
                          <li
                            key={`${item.product.id}-${item.variant.id}`}
                            className="flex w-full flex-col border-b border-neutral-300 dark:border-neutral-700"
                          >
                            <div className="relative flex w-full flex-row justify-between px-1 py-4">
                              <div className="absolute z-40 -ml-1 -mt-2">
                                <DeleteItemButton
                                  variant={item.variant}
                                  product={item.product}
                                />
                              </div>
                              <div className="flex flex-row">
                                <div className="relative h-16 w-16 overflow-hidden rounded-md border border-neutral-300 bg-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                                  <Image
                                    className="h-full w-full object-cover"
                                    width={64}
                                    height={64}
                                    alt={item.product.name}
                                    src={getImageUrl(item.product.image_url)}
                                  />
                                </div>
                                <Link
                                  href={merchandiseUrl}
                                  onClick={closeCart}
                                  className="z-30 ml-2 flex flex-row space-x-4"
                                >
                                  <div className="flex flex-1 flex-col text-base">
                                    <span className="leading-tight">
                                      {item.product.name}
                                    </span>
                                    {item.variant.name !== DEFAULT_OPTION ? (
                                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        {item.variant.name}
                                      </p>
                                    ) : null}
                                  </div>
                                </Link>
                              </div>
                              <div className="flex h-16 flex-col justify-between">
                                <Price
                                  className="flex justify-end space-y-2 text-right text-sm"
                                  amount={(
                                    item.variant.price_adjustment ??
                                    item.product.base_price ??
                                    0
                                  ).toString()}
                                  currencyCode="ISK"
                                />
                                <div className="ml-auto flex h-9 flex-row items-center rounded-full border border-neutral-200 dark:border-neutral-700">
                                  <EditItemQuantityButton
                                    type="minus"
                                    product={item.product}
                                    variant={item.variant}
                                    quantity={item.quantity}
                                  />
                                  <p className="w-6 text-center">
                                    <span className="w-full text-sm">
                                      {item.quantity}
                                    </span>
                                  </p>
                                  <EditItemQuantityButton
                                    type="plus"
                                    product={item.product}
                                    variant={item.variant}
                                    quantity={item.quantity}
                                  />
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                  <div className="py-4 text-sm text-neutral-500 dark:text-neutral-400">
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 dark:border-neutral-700">
                      <p>Þar af vsk</p>
                      <Price
                        className="text-right text-base text-black dark:text-white"
                        amount={cartTotals.totalTaxAmount.amount}
                        currencyCode={cartTotals.totalTaxAmount.currencyCode}
                      />
                    </div>
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 pt-1 dark:border-neutral-700">
                      <p>Sending</p>
                      <p className="text-right">Reiknað í næsta skrefi</p>
                    </div>
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 pt-1 dark:border-neutral-700">
                      <p>Samtals</p>
                      <Price
                        className="text-right text-base text-black dark:text-white"
                        amount={cartTotals.totalAmount.amount}
                        currencyCode={cartTotals.totalAmount.currencyCode}
                      />
                    </div>
                  </div>
                  <Link
                    href={`/checkout/${cart.id}/information`}
                    onClick={closeCart}
                  >
                    <Button className="w-full" type="submit">
                      Áfram í greiðslu
                    </Button>
                  </Link>
                </div>
              )}
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </>
  );
}
