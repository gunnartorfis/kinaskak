import { getMenu } from "@/lib/store/menu";
import CartModal from "components/cart/modal";

const { SITE_NAME } = process.env;

export async function Navbar() {
  const menu = await getMenu("navbar");

  return (
    <nav className="relative flex items-center justify-between p-4 lg:px-6">
      {/* <div className="block flex-none md:hidden">
        <Suspense fallback={null}>
          <MobileMenu menu={menu} />
        </Suspense>
      </div> */}
      <div className="flex w-full justify-end items-center">
        {/* <div className="flex w-full md:w-1/3">
          <Link
            href="/"
            prefetch={true}
            className="mr-2 flex w-full items-center justify-center md:w-auto lg:mr-6"
          >
            <LogoSquare />
            <div className="ml-2 flex-none text-sm font-medium uppercase md:hidden lg:block">
              {SITE_NAME}
            </div>
          </Link>
          {menu?.items.length ? (
            <ul className="hidden gap-6 text-sm md:flex md:items-center">
              {menu.items.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.path}
                    prefetch={true}
                    className="text-neutral-500 underline-offset-4 hover:text-black hover:underline dark:text-neutral-400 dark:hover:text-neutral-300"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div> */}
        {/* <div className="hidden justify-center md:flex md:w-1/3">
          <Suspense fallback={<SearchSkeleton />}>
            <Search />
          </Suspense>
        </div> */}
        <div className="flex justify-end md:w-1/3">
          <CartModal />
        </div>
      </div>
    </nav>
  );
}
