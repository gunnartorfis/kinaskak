const Price = ({
  amount,
  className,
  currencyCode = "ISK",
  currencyCodeClassName,
}: {
  amount: string;
  className?: string;
  currencyCode: string;
  currencyCodeClassName?: string;
} & React.ComponentProps<"p">) => (
  <p suppressHydrationWarning={true} className={className}>
    {formatPrice(amount, currencyCode)}
  </p>
);

export const formatPrice = (amount: string | number, currencyCode: string) => {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currencyCode,
    currencyDisplay: "narrowSymbol",
  }).format(typeof amount === "string" ? parseFloat(amount) : amount);
};

export default Price;
