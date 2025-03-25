"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { XMarkIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import LoadingDots from "components/loading-dots";
import Image from "next/image";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { useCart } from "./cart-context";
import { DeleteItemButton } from "./delete-item-button";
import { EditItemQuantityButton } from "./edit-item-quantity-button";

export const CartModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { cart } = useCart();

  const items = cart.items.map((item) => ({
    id: item.merchandise.id,
    quantity: item.quantity,
    merchandise: item.merchandise,
  }));

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex h-full max-h-[85vh] w-full flex-col gap-4 overflow-hidden p-6 sm:max-w-lg sm:p-6">
        <header className="flex items-center justify-between">
          <p className="text-sm font-semibold">Cart</p>
          <button
            onClick={onClose}
            className="text-neutral-500 transition hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </header>

        {isEmpty ? (
          <div className="mt-20 flex w-full flex-col items-center justify-center overflow-hidden">
            <p className="mt-6 text-center text-2xl font-bold">
              Your cart is empty.
            </p>
          </div>
        ) : (
          <div className="flex h-full flex-col justify-between overflow-hidden p-1">
            <ul className="flex-grow overflow-auto py-4">
              {items
                .sort((a, b) =>
                  a.merchandise.product.name.localeCompare(
                    b.merchandise.product.name
                  )
                )
                .map((item) => {
                  const { merchandise } = item;

                  return (
                    <li
                      key={item.id}
                      className="flex w-full flex-col border-b border-neutral-300 dark:border-neutral-700"
                    >
                      <div className="relative flex w-full flex-row justify-between px-1 py-4">
                        <div className="absolute z-40 -mt-2 ml-[55px]">
                          <DeleteItemButton variant={merchandise} />
                        </div>
                        <Link
                          href={`/product/${merchandise.product.handle}`}
                          onClick={onClose}
                          className="z-30 flex flex-row space-x-4"
                        >
                          <div className="relative h-16 w-16 cursor-pointer overflow-hidden rounded-md border border-neutral-300 bg-neutral-300 dark:border-neutral-700 dark:bg-neutral-900">
                            <Image
                              className="h-full w-full object-cover"
                              width={64}
                              height={64}
                              alt={merchandise.product.name}
                              src={merchandise.product.image_url}
                            />
                          </div>

                          <div className="flex flex-1 flex-col text-base">
                            <span className="leading-tight">
                              {merchandise.product.name}
                            </span>
                            {merchandise.name !== "Default" && (
                              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                {merchandise.name}
                              </p>
                            )}
                          </div>
                        </Link>
                        <div className="flex h-16 flex-col justify-between">
                          <p className="flex justify-end space-x-2 text-right text-sm">
                            <span>
                              {(
                                (merchandise.price_adjustment ||
                                  merchandise.product.base_price) *
                                item.quantity
                              ).toLocaleString("is-IS", {
                                style: "currency",
                                currency: "ISK",
                              })}
                            </span>
                          </p>
                          <EditItemQuantityButton
                            variant={merchandise}
                            quantity={item.quantity}
                          />
                        </div>
                      </div>
                    </li>
                  );
                })}
            </ul>
            <div className="border-t border-neutral-200 py-4 dark:border-neutral-700">
              <div className="mb-3 flex items-center justify-between">
                <p>Subtotal</p>
                <p className="text-right">
                  {Number(cart.cost.subtotalAmount.amount).toLocaleString(
                    "is-IS",
                    {
                      style: "currency",
                      currency: cart.cost.subtotalAmount.currencyCode,
                    }
                  )}
                </p>
              </div>
              <div className="mb-3 flex items-center justify-between">
                <p>Taxes</p>
                <p className="text-right">
                  {Number(cart.cost.totalTaxAmount.amount).toLocaleString(
                    "is-IS",
                    {
                      style: "currency",
                      currency: cart.cost.totalTaxAmount.currencyCode,
                    }
                  )}
                </p>
              </div>
              <div className="mb-3 flex items-center justify-between border-t border-neutral-200 pt-3 dark:border-neutral-700">
                <p className="font-semibold">Total</p>
                <p className="text-right font-semibold">
                  {Number(cart.cost.totalAmount.amount).toLocaleString(
                    "is-IS",
                    {
                      style: "currency",
                      currency: cart.cost.totalAmount.currencyCode,
                    }
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

function CloseCart({ className }: { className?: string }) {
  return (
    <div className="relative flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white">
      <XMarkIcon
        className={clsx(
          "h-6 transition-all ease-in-out hover:scale-110",
          className
        )}
      />
    </div>
  );
}

function CheckoutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="block w-full rounded-full bg-blue-600 p-3 text-center text-sm font-medium text-white opacity-90 hover:opacity-100"
      type="submit"
      disabled={pending}
    >
      {pending ? <LoadingDots className="bg-white" /> : "Áfram í greiðslu"}
    </button>
  );
}
